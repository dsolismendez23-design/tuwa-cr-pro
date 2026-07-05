import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "../types";

export function ProductSearchSelect({
  products,
  value,
  onChange,
  placeholder = "Escribí para buscar por descripción o código...",
}: {
  products: Product[];
  value: string;
  onChange: (productId: string) => void;
  placeholder?: string;
}) {
  const selected = products.find((p) => String(p.id) === value);
  const selectedLabel = selected ? `${selected.code} · ${selected.description}` : "";

  const [query, setQuery] = useState(selectedLabel);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only resync the visible text from the selected product when the user
  // isn't actively typing a search — otherwise every keystroke would get
  // wiped out as soon as it clears the previous selection.
  useEffect(() => {
    if (!editing) {
      setQuery(selectedLabel);
    }
  }, [selectedLabel, editing]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setEditing(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = !term || query === selectedLabel
      ? products
      : products.filter(
          (p) => p.description.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)
        );
    return list.slice(0, 30);
  }, [products, query, selectedLabel]);

  function handlePick(p: Product) {
    onChange(String(p.id));
    setQuery(`${p.code} · ${p.description}`);
    setEditing(false);
    setOpen(false);
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setEditing(true);
          setQuery(e.target.value);
          setOpen(true);
        }}
      />
      {open && (
        <div className="product-search-dropdown">
          {matches.length === 0 ? (
            <div className="product-search-empty">Sin coincidencias</div>
          ) : (
            matches.map((p) => (
              <button
                type="button"
                key={p.id}
                className="product-search-option"
                onClick={() => handlePick(p)}
              >
                <span className="pill" style={{ flexShrink: 0 }}>
                  {p.code}
                </span>
                <span>{p.description}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
