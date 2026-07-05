import type { PriceCategory, Product } from "../types";

export interface PriceCategoryInfo {
  key: PriceCategory;
  label: string;
  shortLabel: string;
  currency: "CRC" | "USD";
  productField: "distribuidorCRC" | "veinsaRegularUSD" | "veinsaEspecialUSD" | "agenteAutorizadoCRC";
}

export const PRICE_CATEGORIES: PriceCategoryInfo[] = [
  {
    key: "distribuidor",
    label: "Precio Regular Distribuidor",
    shortLabel: "Distribuidor",
    currency: "CRC",
    productField: "distribuidorCRC",
  },
  {
    key: "veinsaRegular",
    label: "Precio Regular VEINSA",
    shortLabel: "VEINSA Regular",
    currency: "USD",
    productField: "veinsaRegularUSD",
  },
  {
    key: "veinsaEspecial",
    label: "Precio Especial VEINSA",
    shortLabel: "VEINSA Especial",
    currency: "USD",
    productField: "veinsaEspecialUSD",
  },
  {
    key: "agenteAutorizado",
    label: "Precio Agente Autorizado",
    shortLabel: "Agente Autorizado",
    currency: "CRC",
    productField: "agenteAutorizadoCRC",
  },
];

export function getPriceCategoryInfo(key: PriceCategory): PriceCategoryInfo {
  return PRICE_CATEGORIES.find((c) => c.key === key) ?? PRICE_CATEGORIES[0];
}

export function getProductPrice(product: Product, category: PriceCategory): number {
  const info = getPriceCategoryInfo(category);
  return product[info.productField];
}
