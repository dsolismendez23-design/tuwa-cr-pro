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
      <select value={value} onChange={(e) => onChange(e.target.value as PriceCategory)}>
        {PRICE_CATEGORIES.map((cat) => (
          <option key={cat.key} value={cat.key}>
            {cat.label} ({cat.currency === "USD" ? "$" : "₡"})
          </option>
        ))}
      </select>
    </div>
  );
}
