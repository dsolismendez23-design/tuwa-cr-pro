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
  const [expandedId, setExpandedId] = useState<number | null>(null);
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
      if (expandedId === toDelete.id) setExpandedId(null);
      showToast("Producto eliminado");
    }
    setToDelete(null);
  }

  function toggleExpanded(id?: number) {
    if (!id) return;
    setExpandedId((prev) => (prev === id ? null : id));
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

      <div className="card" style={{ marginBottom: 14, padding: 6 }}>
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
          sorted.map((p) => {
            const isOpen = expandedId === p.id;
            return (
              <div key={p.id} className="product-accordion-item">
                <button
                  type="button"
                  className="product-accordion-header"
                  onClick={() => toggleExpanded(p.id)}
                >
                  <span className="pill" style={{ flexShrink: 0 }}>
                    {p.code}
                  </span>
                  <span className="product-accordion-desc">{p.description}</span>
                  <span className={`product-accordion-chevron ${isOpen ? "open" : ""}`}>›</span>
                </button>

                {isOpen && (
                  <div className="product-accordion-body">
                    <div className="product-price-row">
                      {PRICE_CATEGORIES.map((cat) => (
                        <div className="product-price-chip" key={cat.key}>
                          <span className="product-price-chip-label">{cat.shortLabel}</span>
                          <span className="product-price-chip-value">
                            {cat.currency === "USD"
                              ? formatUSD(p[cat.productField])
                              : formatCRC(p[cat.productField])}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="row-actions" style={{ marginTop: 10 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setEditing(p)}>
                        Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => setToDelete(p)}>
                        Borrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
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
