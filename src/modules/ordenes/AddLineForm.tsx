import { useEffect, useState } from "react";
import type { ClientPrice, OrderItem, PriceCategory, Product } from "../../types";
import { getPriceCategoryInfo, getProductPrice } from "../../lib/priceCategories";
import { formatMoney } from "../../lib/format";
import { ProductSearchSelect } from "../../components/ProductSearchSelect";

export function AddLineForm({
  products,
  priceCategory,
  clientPrices,
  editItem,
  onSave,
  onCancelEdit,
}: {
  products: Product[];
  priceCategory: PriceCategory;
  clientPrices: ClientPrice[];
  editItem: OrderItem | null;
  onSave: (item: OrderItem) => void;
  onCancelEdit: () => void;
}) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isDifferentiated, setIsDifferentiated] = useState(false);
  const [unitPriceUSD, setUnitPriceUSD] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editItem) {
      setProductId(String(editItem.productId));
      setQuantity(String(editItem.quantity));
      setIsDifferentiated(editItem.isDifferentiated);
      setUnitPriceUSD(editItem.isDifferentiated ? String(editItem.unitPrice) : "");
      setError("");
    }
  }, [editItem]);

  const product = products.find((p) => String(p.id) === productId);
  const categoryInfo = getPriceCategoryInfo(priceCategory);

  function priceLookup(pid: string): number | undefined {
    return clientPrices.find((cp) => String(cp.productId) === pid)?.priceUSD;
  }

  function handleProductChange(pid: string) {
    setProductId(pid);
    if (isDifferentiated) {
      const suggested = priceLookup(pid);
      setUnitPriceUSD(suggested !== undefined ? String(suggested) : "");
    }
  }

  function handleDifferentiatedChange(checked: boolean) {
    setIsDifferentiated(checked);
    if (checked && !unitPriceUSD) {
      const suggested = priceLookup(productId);
      if (suggested !== undefined) setUnitPriceUSD(String(suggested));
    }
  }

  function resetFields() {
    setProductId("");
    setQuantity("1");
    setIsDifferentiated(false);
    setUnitPriceUSD("");
    setError("");
  }

  function handleSubmit() {
    setError("");
    if (!product) {
      setError("Seleccioná un producto.");
      return;
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Cantidad inválida.");
      return;
    }

    let item: OrderItem;
    if (isDifferentiated) {
      const price = Number(unitPriceUSD);
      if (!Number.isFinite(price) || price < 0) {
        setError("Ingresá el precio diferenciado en USD.");
        return;
      }
      item = {
        productId: product.id!,
        code: product.code,
        description: product.description,
        quantity: qty,
        unitPrice: price,
        currency: "USD",
        isDifferentiated: true,
        priceLabel: "Precio diferenciado",
      };
    } else {
      item = {
        productId: product.id!,
        code: product.code,
        description: product.description,
        quantity: qty,
        unitPrice: getProductPrice(product, priceCategory),
        currency: categoryInfo.currency,
        isDifferentiated: false,
        priceLabel: categoryInfo.label,
      };
    }

    onSave(item);
    resetFields();
  }

  function handleCancel() {
    resetFields();
    onCancelEdit();
  }

  return (
    <div className={`card add-line-form${editItem ? " add-line-form-editing" : ""}`}>
      {editItem && <p className="add-line-editing-badge">✏️ Editando línea</p>}

      <div className="field" style={{ marginBottom: 10 }}>
        <label>Descripción del producto</label>
        <ProductSearchSelect products={products} value={productId} onChange={handleProductChange} />
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label>Cantidad (unidades)</label>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="1"
        />
      </div>

      <div className="checkbox-row">
        <input
          type="checkbox"
          id="add-line-diff"
          checked={isDifferentiated}
          onChange={(e) => handleDifferentiatedChange(e.target.checked)}
          disabled={!productId}
        />
        <label htmlFor="add-line-diff">¿Precio diferenciado para este cliente?</label>
      </div>

      {isDifferentiated && (
        <div className="field" style={{ marginTop: 8, marginBottom: 4 }}>
          <label>Precio por unidad (USD)</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={unitPriceUSD}
            onChange={(e) => setUnitPriceUSD(e.target.value)}
            placeholder="0.00"
          />
        </div>
      )}

      {!isDifferentiated && product && (
        <p style={{ fontSize: 12, color: "var(--tuwa-gray-700)", margin: "8px 0 0" }}>
          {categoryInfo.shortLabel}: {formatMoney(getProductPrice(product, priceCategory), categoryInfo.currency)} / unidad
        </p>
      )}

      {error && (
        <p style={{ color: "var(--tuwa-danger)", fontSize: 12, fontWeight: 600, margin: "8px 0 0" }}>
          {error}
        </p>
      )}

      <button type="button" className="btn btn-dark" style={{ marginTop: 12 }} onClick={handleSubmit}>
        {editItem ? "Guardar cambios" : "+ Agregar línea"}
      </button>
      {editItem && (
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={handleCancel}>
          Cancelar edición
        </button>
      )}
    </div>
  );
}
