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
  const [query, setQuery] = useState(selected ? `${selected.code} · ${selected.description}` : "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = products.find((p) => String(p.id) === value);
    setQuery(current ? `${current.code} · ${current.description}` : "");
  }, [value, products]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list =
      !term || (selected && query === `${selected.code} · ${selected.description}`)
        ? products
        : products.filter(
            (p) =>
              p.description.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)
          );
    return list.slice(0, 30);
  }, [products, query, selected]);

  function handlePick(p: Product) {
    onChange(String(p.id));
    setQuery(`${p.code} · ${p.description}`);
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
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange("");
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
