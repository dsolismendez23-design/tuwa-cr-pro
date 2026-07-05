import { useState } from "react";
import { Sheet } from "../../components/Sheet";
import type { Product } from "../../types";
import { PRICE_CATEGORIES } from "../../lib/priceCategories";

export function ProductForm({
  initial,
  onSave,
  onClose,
  isDuplicateCode,
}: {
  initial?: Product;
  onSave: (data: {
    code: string;
    description: string;
    distribuidorCRC: number;
    veinsaRegularUSD: number;
    veinsaEspecialUSD: number;
    agenteAutorizadoCRC: number;
  }) => void;
  onClose: () => void;
  isDuplicateCode: (code: string, ignoreId?: number) => boolean;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [distribuidorCRC, setDistribuidorCRC] = useState(initial ? String(initial.distribuidorCRC) : "");
  const [veinsaRegularUSD, setVeinsaRegularUSD] = useState(initial ? String(initial.veinsaRegularUSD) : "");
  const [veinsaEspecialUSD, setVeinsaEspecialUSD] = useState(initial ? String(initial.veinsaEspecialUSD) : "");
  const [agenteAutorizadoCRC, setAgenteAutorizadoCRC] = useState(
    initial ? String(initial.agenteAutorizadoCRC) : ""
  );
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedCode = code.trim();
    const trimmedDesc = description.trim();
    const prices = {
      distribuidorCRC: Number(distribuidorCRC || 0),
      veinsaRegularUSD: Number(veinsaRegularUSD || 0),
      veinsaEspecialUSD: Number(veinsaEspecialUSD || 0),
      agenteAutorizadoCRC: Number(agenteAutorizadoCRC || 0),
    };

    if (!trimmedCode || !trimmedDesc) {
      setError("Completá el código y la descripción.");
      return;
    }
    if (Object.values(prices).some((v) => !Number.isFinite(v) || v < 0)) {
      setError("Los precios deben ser números válidos.");
      return;
    }
    if (isDuplicateCode(trimmedCode, initial?.id)) {
      setError("Ya existe un producto con ese código.");
      return;
    }
    onSave({ code: trimmedCode, description: trimmedDesc, ...prices });
  }

  return (
    <Sheet title={initial ? "Editar producto" : "Nuevo producto"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Código</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ej: PRD-001"
            autoFocus
          />
        </div>
        <div className="field">
          <label>Descripción</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Saco de alimento 40kg"
          />
        </div>

        <div className="divider" />
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--tuwa-gray-700)", margin: "0 0 10px" }}>
          Categorías de precio
        </p>

        <div className="field">
          <label>{PRICE_CATEGORIES[0].label} (₡)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={distribuidorCRC}
            onChange={(e) => setDistribuidorCRC(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="field">
          <label>{PRICE_CATEGORIES[1].label} ($)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={veinsaRegularUSD}
            onChange={(e) => setVeinsaRegularUSD(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="field">
          <label>{PRICE_CATEGORIES[2].label} ($)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={veinsaEspecialUSD}
            onChange={(e) => setVeinsaEspecialUSD(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="field">
          <label>{PRICE_CATEGORIES[3].label} (₡)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={agenteAutorizadoCRC}
            onChange={(e) => setAgenteAutorizadoCRC(e.target.value)}
            placeholder="0.00"
          />
        </div>

        {error && (
          <p style={{ color: "var(--tuwa-danger)", fontSize: 13, fontWeight: 600 }}>{error}</p>
        )}
        <div className="row-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </div>
      </form>
    </Sheet>
  );
}
