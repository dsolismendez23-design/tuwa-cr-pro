import type { PriceCategory, Product } from "../../types";
import { getPriceCategoryInfo, getProductPrice } from "../../lib/priceCategories";
import { formatMoney } from "../../lib/format";

export interface DraftLine {
  key: string;
  productId: string;
  quantity: string;
  isDifferentiated: boolean;
  unitPriceUSD: string;
}

export function OrdenLineItem({
  line,
  products,
  priceCategory,
  onChange,
  onRemove,
  canRemove,
}: {
  line: DraftLine;
  products: Product[];
  priceCategory: PriceCategory;
  onChange: (patch: Partial<DraftLine>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const product = products.find((p) => String(p.id) === line.productId);
  const categoryInfo = getPriceCategoryInfo(priceCategory);

  return (
    <div className="order-line-card">
      <div className="field" style={{ marginBottom: 10 }}>
        <label>Producto</label>
        <select
          value={line.productId}
          onChange={(e) => onChange({ productId: e.target.value })}
        >
          <option value="">Seleccionar producto...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} · {p.description}
            </option>
          ))}
        </select>
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>Cantidad (unidades)</label>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          value={line.quantity}
          onChange={(e) => onChange({ quantity: e.target.value })}
          placeholder="1"
        />
      </div>

      <div className="checkbox-row">
        <input
          type="checkbox"
          id={`diff-${line.key}`}
          checked={line.isDifferentiated}
          onChange={(e) => onChange({ isDifferentiated: e.target.checked })}
          disabled={!line.productId}
        />
        <label htmlFor={`diff-${line.key}`}>¿Precio diferenciado para este cliente?</label>
      </div>

      {line.isDifferentiated && (
        <div className="field" style={{ marginTop: 8, marginBottom: 4 }}>
          <label>Precio por unidad (USD)</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={line.unitPriceUSD}
            onChange={(e) => onChange({ unitPriceUSD: e.target.value })}
            placeholder="0.00"
          />
        </div>
      )}

      {!line.isDifferentiated && product && (
        <p style={{ fontSize: 12, color: "var(--tuwa-gray-700)", margin: "8px 0 0" }}>
          {categoryInfo.shortLabel}: {formatMoney(getProductPrice(product, priceCategory), categoryInfo.currency)} / unidad
        </p>
      )}

      {canRemove && (
        <button
          type="button"
          className="btn btn-danger btn-sm"
          style={{ marginTop: 10 }}
          onClick={onRemove}
        >
          Quitar línea
        </button>
      )}
    </div>
  );
}
