import type { OrderItem } from "../../types";
import { formatMoney } from "../../lib/format";

export function AddedLinesList({
  items,
  editingIndex,
  onEdit,
  onRemove,
}: {
  items: OrderItem[];
  editingIndex: number | null;
  onEdit: (index: number) => void;
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
        <div
          className={`added-line-row${editingIndex === idx ? " added-line-row-editing" : ""}`}
          key={idx}
        >
          <div className="added-line-actions">
            <button
              type="button"
              className="added-line-edit"
              onClick={() => onEdit(idx)}
              aria-label="Editar línea"
              title="Editar línea"
            >
              ✏️
            </button>
            <button
              type="button"
              className="added-line-remove"
              onClick={() => onRemove(idx)}
              aria-label="Quitar línea"
              title="Quitar línea"
            >
              ✕
            </button>
          </div>
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
