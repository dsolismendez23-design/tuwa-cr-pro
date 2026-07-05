import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db";
import type { Product } from "../../types";
import { EmptyState } from "../../components/EmptyState";
import { ConfirmSheet } from "../../components/Sheet";
import { ProductForm } from "./ProductForm";
import { useToast } from "../../components/Toast";
import { formatCRC, formatUSD } from "../../lib/format";
import { PRICE_CATEGORIES } from "../../lib/priceCategories";

export function ProductosScreen() {
  const products = useLiveQuery(() => db.products.toArray(), []);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const showToast = useToast();

  const sorted = useMemo(() => {
    if (!products) return [];
    const term = search.trim().toLowerCase();
    const filtered = term
      ? products.filter(
          (p) =>
            p.code.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term)
        )
      : products;
    return [...filtered].sort((a, b) => {
      if (a.code !== b.code) return a.code.localeCompare(b.code);
      return a.description.localeCompare(b.description);
    });
  }, [products, search]);

  function isDuplicateCode(code: string, ignoreId?: number) {
    if (!products) return false;
    return products.some(
      (p) => p.code.toLowerCase() === code.toLowerCase() && p.id !== ignoreId
    );
  }

  async function handleSave(data: {
    code: string;
    description: string;
    distribuidorCRC: number;
    veinsaRegularUSD: number;
    veinsaEspecialUSD: number;
    agenteAutorizadoCRC: number;
  }) {
    if (editing && editing.id) {
      await db.products.update(editing.id, data);
      showToast("Producto actualizado");
    } else {
      await db.products.add({ ...data, createdAt: Date.now() });
      showToast("Producto agregado");
    }
    setEditing(undefined);
  }

  async function handleDelete() {
    if (toDelete?.id) {
      await db.products.delete(toDelete.id);
      showToast("Producto eliminado");
    }
    setToDelete(null);
  }

  return (
    <div>
      <h2 className="screen-title">Productos</h2>

      <input
        className="search-bar"
        type="text"
        placeholder="Buscar por código o descripción..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="card" style={{ marginBottom: 14 }}>
        {sorted.length === 0 ? (
          <EmptyState
            icon="📦"
            text={
              products && products.length === 0
                ? "Aún no hay productos. Agregá el primero."
                : "No se encontraron productos."
            }
          />
        ) : (
          sorted.map((p) => (
            <div className="list-row" key={p.id} style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  <span className="pill" style={{ marginRight: 6 }}>
                    {p.code}
                  </span>
                  {p.description}
                </div>
                <div className="row-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(p)}>
                    Editar
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setToDelete(p)}>
                    Borrar
                  </button>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 6,
                  marginTop: 8,
                  fontSize: 12,
                  color: "var(--tuwa-gray-700)",
                }}
              >
                <div>
                  <span className="pill pill-gray">{PRICE_CATEGORIES[0].shortLabel}</span>{" "}
                  {formatCRC(p.distribuidorCRC)}
                </div>
                <div>
                  <span className="pill pill-gray">{PRICE_CATEGORIES[1].shortLabel}</span>{" "}
                  {formatUSD(p.veinsaRegularUSD)}
                </div>
                <div>
                  <span className="pill pill-gray">{PRICE_CATEGORIES[2].shortLabel}</span>{" "}
                  {formatUSD(p.veinsaEspecialUSD)}
                </div>
                <div>
                  <span className="pill pill-gray">{PRICE_CATEGORIES[3].shortLabel}</span>{" "}
                  {formatCRC(p.agenteAutorizadoCRC)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="btn btn-primary" onClick={() => setEditing(null)}>
        + Agregar producto
      </button>

      {editing !== undefined && (
        <ProductForm
          initial={editing ?? undefined}
          onClose={() => setEditing(undefined)}
          onSave={handleSave}
          isDuplicateCode={isDuplicateCode}
        />
      )}

      {toDelete && (
        <ConfirmSheet
          title="Eliminar producto"
          message={`¿Seguro que querés eliminar "${toDelete.description}"? Esta acción no se puede deshacer.`}
          onCancel={() => setToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
