import type { OrderItem } from "../../types";
import { formatMoney } from "../../lib/format";

export function AddedLinesList({
  items,
  onRemove,
}: {
  items: OrderItem[];
  onRemove: (index: number) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="card added-lines-list">
        <p className="added-lines-empty">Las líneas que agregués van a aparecer acá.</p>
      </div>
    );
  }

  return (
    <div className="card added-lines-list">
      {items.map((item, idx) => (
        <div className="added-line-row" key={idx}>
          <button
            type="button"
            className="added-line-remove"
            onClick={() => onRemove(idx)}
            aria-label="Quitar línea"
          >
            ×
          </button>
          <div className="added-line-code">{item.code}</div>
          <div className="added-line-desc">{item.description}</div>
          <div className="added-line-qty">
            {item.quantity} × {formatMoney(item.unitPrice, item.currency)}
          </div>
          <div className="added-line-subtotal">
            {formatMoney(item.quantity * item.unitPrice, item.currency)}
          </div>
          {item.isDifferentiated && <span className="pill added-line-pill">diferenciado</span>}
        </div>
      ))}
    </div>
  );
}
