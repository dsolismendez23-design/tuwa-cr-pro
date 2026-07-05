import { PRICE_CATEGORIES } from "../lib/priceCategories";
import type { PriceCategory } from "../types";

export function PriceCategoryPicker({
  value,
  onChange,
}: {
  value: PriceCategory;
  onChange: (value: PriceCategory) => void;
}) {
  return (
    <div className="field">
      <label>Categoría de precio del cliente</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {PRICE_CATEGORIES.map((cat) => (
          <label
            key={cat.key}
            className="price-category-option"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: `1.5px solid ${value === cat.key ? "var(--tuwa-orange)" : "var(--tuwa-gray-300)"}`,
              background: value === cat.key ? "var(--tuwa-orange-light)" : "var(--tuwa-white)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 10px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={value === cat.key}
              onChange={() => onChange(cat.key)}
              style={{ width: 16, height: 16, accentColor: "var(--tuwa-orange)" }}
            />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--tuwa-black)", lineHeight: 1.2 }}>
              {cat.shortLabel}
              <br />
              <span style={{ fontWeight: 500, color: "var(--tuwa-gray-700)" }}>
                ({cat.currency === "USD" ? "$" : "₡"})
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
