import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db";
import { formatUSD } from "../../lib/format";
import { useToast } from "../../components/Toast";
import type { Client } from "../../types";

export function ClientePrecios({ client }: { client: Client }) {
  const products = useLiveQuery(() => db.products.toArray(), []);
  const prices = useLiveQuery(
    () => db.clientPrices.where("clientId").equals(client.id!).toArray(),
    [client.id]
  );
  const showToast = useToast();

  const [productId, setProductId] = useState("");
  const [priceUSD, setPriceUSD] = useState("");
  const [error, setError] = useState("");

  const assignedProductIds = new Set((prices ?? []).map((p) => p.productId));
  const availableProducts = (products ?? []).filter((p) => !assignedProductIds.has(p.id!));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const pid = Number(productId);
    const price = Number(priceUSD);
    if (!pid) {
      setError("Seleccioná un producto.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Ingresá un precio válido en dólares.");
      return;
    }
    await db.clientPrices.add({
      clientId: client.id!,
      productId: pid,
      priceUSD: price,
      createdAt: Date.now(),
    });
    setProductId("");
    setPriceUSD("");
    setError("");
    showToast("Precio diferenciado agregado");
  }

  async function handleRemove(id?: number) {
    if (!id) return;
    await db.clientPrices.delete(id);
    showToast("Precio diferenciado eliminado");
  }

  function productLabel(productId: number) {
    const p = products?.find((pr) => pr.id === productId);
    return p ? `${p.code} · ${p.description}` : "Producto eliminado";
  }

  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 800, margin: "6px 0 10px" }}>
        Precios diferenciados (USD)
      </h3>

      {(prices ?? []).length === 0 && (
        <p style={{ fontSize: 13, color: "var(--tuwa-gray-700)" }}>
          Este cliente no tiene precios diferenciados configurados.
        </p>
      )}

      {(prices ?? []).map((price) => (
        <div className="list-row" key={price.id}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{productLabel(price.productId)}</div>
            <div style={{ fontSize: 13, color: "var(--tuwa-orange-dark)", fontWeight: 700 }}>
              {formatUSD(price.priceUSD)} / unidad
            </div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => handleRemove(price.id)}>
            Quitar
          </button>
        </div>
      ))}

      <div className="divider" />

      {availableProducts.length === 0 && (products ?? []).length > 0 ? (
        <p style={{ fontSize: 13, color: "var(--tuwa-gray-500)" }}>
          Ya se asignó precio diferenciado a todos los productos.
        </p>
      ) : (products ?? []).length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--tuwa-gray-500)" }}>
          Agregá productos en el módulo Productos para poder asignarles precio diferenciado.
        </p>
      ) : (
        <form onSubmit={handleAdd}>
          <div className="field">
            <label>Producto</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Seleccionar producto...</option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.description}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Precio por unidad (USD)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={priceUSD}
              onChange={(e) => setPriceUSD(e.target.value)}
              placeholder="0.00"
            />
          </div>
          {error && (
            <p style={{ color: "var(--tuwa-danger)", fontSize: 13, fontWeight: 600 }}>{error}</p>
          )}
          <button type="submit" className="btn btn-dark">
            + Asignar precio diferenciado
          </button>
        </form>
      )}
    </div>
  );
}
