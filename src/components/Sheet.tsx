import type { ReactNode } from "react";

export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function ConfirmSheet({
  title,
  message,
  confirmLabel = "Eliminar",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Sheet title={title} onClose={onCancel}>
      <p style={{ color: "var(--tuwa-gray-700)", marginTop: 0 }}>{message}</p>
      <div className="row-actions">
        <button className="btn btn-ghost" onClick={onCancel} type="button">
          Cancelar
        </button>
        <button className="btn btn-danger" onClick={onConfirm} type="button">
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}
