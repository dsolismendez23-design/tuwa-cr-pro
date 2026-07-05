import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db";
import type { ClientPrice, Order, OrderItem, PriceCategory } from "../../types";
import { EmptyState } from "../../components/EmptyState";
import { useToast } from "../../components/Toast";
import { ShareOrderSheet } from "../../components/ShareOrderSheet";
import { PriceCategoryPicker } from "../../components/PriceCategoryPicker";
import { OrdenLineItem, type DraftLine } from "./OrdenLineItem";
import { ClienteForm } from "../clientes/ClienteForm";
import { formatCRC, formatUSD } from "../../lib/format";
import { getPriceCategoryInfo, getProductPrice } from "../../lib/priceCategories";

let lineKeyCounter = 0;
function newLine(): DraftLine {
  lineKeyCounter += 1;
  return { key: `line-${lineKeyCounter}`, productId: "", quantity: "1", isDifferentiated: false, unitPriceUSD: "" };
}

export function OrdenesScreen() {
  const clients = useLiveQuery(() => db.clients.toArray(), []);
  const products = useLiveQuery(() => db.products.toArray(), []);
  const showToast = useToast();

  const [clientId, setClientId] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([newLine()]);
  const [error, setError] = useState("");
  const [generatedOrder, setGeneratedOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);

  const selectedClient = clients?.find((c) => String(c.id) === clientId);
  const priceCategory: PriceCategory = selectedClient?.priceCategory ?? "distribuidor";

  const clientPrices = useLiveQuery(
    (): Promise<ClientPrice[]> =>
      clientId ? db.clientPrices.where("clientId").equals(Number(clientId)).toArray() : Promise.resolve([]),
    [clientId]
  );

  function priceLookup(productId: string): number | undefined {
    const match = clientPrices?.find((cp) => String(cp.productId) === productId);
    return match?.priceUSD;
  }

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const next = { ...l, ...patch };
        if (patch.isDifferentiated === true && !next.unitPriceUSD) {
          const suggested = priceLookup(next.productId);
          if (suggested !== undefined) next.unitPriceUSD = String(suggested);
        }
        if (patch.productId !== undefined && next.isDifferentiated) {
          const suggested = priceLookup(patch.productId);
          next.unitPriceUSD = suggested !== undefined ? String(suggested) : "";
        }
        return next;
      })
    );
  }

  function removeLine(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  async function handleCategoryChange(next: PriceCategory) {
    if (!selectedClient?.id) return;
    await db.clients.update(selectedClient.id, { priceCategory: next });
  }

  async function handleNewClientSave(data: {
    name: string;
    address: string;
    contact: string;
    priceCategory: PriceCategory;
  }) {
    const id = await db.clients.add({ ...data, createdAt: Date.now() });
    showToast("Cliente agregado");
    setClientId(String(id));
    setShowNewClient(false);
  }

  const { totalCRC, totalUSD } = useMemo(() => {
    let crc = 0;
    let usd = 0;
    for (const line of lines) {
      const product = products?.find((p) => String(p.id) === line.productId);
      const qty = Number(line.quantity);
      if (!product || !Number.isFinite(qty)) continue;
      if (line.isDifferentiated) {
        const price = Number(line.unitPriceUSD);
        if (Number.isFinite(price)) usd += qty * price;
      } else {
        const info = getPriceCategoryInfo(priceCategory);
        const price = getProductPrice(product, priceCategory);
        if (info.currency === "USD") usd += qty * price;
        else crc += qty * price;
      }
    }
    return { totalCRC: crc, totalUSD: usd };
  }, [lines, products, priceCategory]);

  function resetForm() {
    setClientId("");
    setLines([newLine()]);
    setError("");
  }

  async function handleGenerar() {
    setError("");
    const client = clients?.find((c) => String(c.id) === clientId);
    if (!client) {
      setError("Seleccioná un cliente.");
      return;
    }
    if (lines.length === 0) {
      setError("Agregá al menos un producto.");
      return;
    }

    const categoryInfo = getPriceCategoryInfo(client.priceCategory);
    const items: OrderItem[] = [];
    for (const line of lines) {
      const product = products?.find((p) => String(p.id) === line.productId);
      if (!product) {
        setError("Todas las líneas deben tener un producto seleccionado.");
        return;
      }
      const qty = Number(line.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        setError(`Cantidad inválida para ${product.description}.`);
        return;
      }
      if (line.isDifferentiated) {
        const price = Number(line.unitPriceUSD);
        if (!Number.isFinite(price) || price < 0) {
          setError(`Ingresá el precio diferenciado en USD para ${product.description}.`);
          return;
        }
        items.push({
          productId: product.id!,
          code: product.code,
          description: product.description,
          quantity: qty,
          unitPrice: price,
          currency: "USD",
          isDifferentiated: true,
          priceLabel: "Precio diferenciado",
        });
      } else {
        items.push({
          productId: product.id!,
          code: product.code,
          description: product.description,
          quantity: qty,
          unitPrice: getProductPrice(product, client.priceCategory),
          currency: categoryInfo.currency,
          isDifferentiated: false,
          priceLabel: categoryInfo.label,
        });
      }
    }

    setSaving(true);
    try {
      const newOrder: Omit<Order, "id"> = {
        clientId: client.id!,
        clientName: client.name,
        clientAddress: client.address,
        clientContact: client.contact,
        priceCategory: client.priceCategory,
        date: new Date().toISOString(),
        items,
        totalCRC,
        totalUSD,
        createdAt: Date.now(),
      };
      const id = await db.orders.add(newOrder as Order);
      const saved = { ...newOrder, id } as Order;
      showToast("Orden generada y guardada");
      setGeneratedOrder(saved);
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  const noProducts = products && products.length === 0;

  return (
    <div>
      <h2 className="screen-title">Nueva Orden de Compra</h2>

      {noProducts && (
        <div className="card">
          <EmptyState icon="🧾" text="Primero agregá al menos un producto en el módulo Productos." />
        </div>
      )}

      {!noProducts && (
        <>
          <div className="card">
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Cliente</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                <option value="">Seleccionar cliente...</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 10 }}
              onClick={() => setShowNewClient(true)}
            >
              + Ingresar cliente nuevo
            </button>
          </div>

          {selectedClient && (
            <div className="card">
              <PriceCategoryPicker value={priceCategory} onChange={handleCategoryChange} />
            </div>
          )}

          {selectedClient && (
            <>
              {lines.map((line) => (
                <OrdenLineItem
                  key={line.key}
                  line={line}
                  products={products ?? []}
                  priceCategory={priceCategory}
                  onChange={(patch) => updateLine(line.key, patch)}
                  onRemove={() => removeLine(line.key)}
                  canRemove={lines.length > 1}
                />
              ))}

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setLines((prev) => [...prev, newLine()])}
                style={{ marginBottom: 14 }}
              >
                + Agregar producto a la orden
              </button>

              <div className="card">
                {totalCRC > 0 && (
                  <div className="total-bar">
                    <span>Total ₡</span>
                    <span className="amount">{formatCRC(totalCRC)}</span>
                  </div>
                )}
                {totalUSD > 0 && (
                  <div className="total-bar">
                    <span>Total $</span>
                    <span className="amount">{formatUSD(totalUSD)}</span>
                  </div>
                )}
              </div>

              {error && (
                <p style={{ color: "var(--tuwa-danger)", fontSize: 13, fontWeight: 600 }}>{error}</p>
              )}

              <button className="btn btn-primary" onClick={handleGenerar} disabled={saving}>
                {saving ? "Generando..." : "Generar Orden"}
              </button>
            </>
          )}
        </>
      )}

      {showNewClient && (
        <ClienteForm onClose={() => setShowNewClient(false)} onSave={handleNewClientSave} />
      )}

      {generatedOrder && (
        <ShareOrderSheet order={generatedOrder} onClose={() => setGeneratedOrder(null)} />
      )}
    </div>
  );
}
