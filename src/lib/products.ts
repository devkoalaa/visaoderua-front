import type { Product, ProductLine } from "@/types";
import { parseCurrency } from "@/lib/format";

export const PRODUCT_LINES: { key: ProductLine; label: string; short: string }[] = [
  { key: "juliet", label: "Linha Juliet", short: "Juliet" },
  { key: "romeo", label: "Linha Romeo", short: "Romeo" },
  { key: "monster-dog", label: "Linha Monster Dog", short: "Monster Dog" },
  { key: "minute", label: "Linha Minute", short: "Minute" },
  { key: "outros", label: "Outros modelos exclusivos", short: "Outros" },
];

export const lineLabel = (line: ProductLine) =>
  PRODUCT_LINES.find((l) => l.key === line)?.label ?? "Outros";

export function detectLine(name: string): ProductLine {
  const n = name.toLowerCase();
  if (n.includes("juliet")) return "juliet";
  if (n.includes("romeo") || n.includes("romeu")) return "romeo";
  if (n.includes("monster")) return "monster-dog";
  if (n.includes("minute")) return "minute";
  return "outros";
}

/** Formato cru que o backend devolve. Campos opcionais para tolerar variações. */
export interface ApiProduct {
  id: string | number;
  name: string;
  price: string | number;
  stock_quantity?: number;
  image_url?: string | null;
  description?: string | null;
  slug?: string | null;
  lens_color?: string | null;
  frame_type?: string | null;
}

export function normalizeProduct(raw: ApiProduct): Product {
  return {
    id: String(raw.id),
    name: raw.name,
    price: parseCurrency(raw.price),
    stock: Number.isFinite(Number(raw.stock_quantity)) ? Number(raw.stock_quantity) : 99,
    imageUrl: raw.image_url || null,
    description: raw.description ?? undefined,
    slug: raw.slug ?? undefined,
    lensColor: raw.lens_color ?? undefined,
    frameType: raw.frame_type ?? undefined,
    line: detectLine(raw.name),
  };
}

export function groupByLine(products: Product[]) {
  const map = new Map<ProductLine, Product[]>();
  for (const line of PRODUCT_LINES) map.set(line.key, []);
  for (const p of products) map.get(p.line)?.push(p);
  return PRODUCT_LINES.map((line) => ({ ...line, products: map.get(line.key) ?? [] })).filter(
    (g) => g.products.length > 0,
  );
}

export function filterProducts(products: Product[], query: string, line: ProductLine | "all") {
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    const matchesLine = line === "all" || p.line === line;
    const matchesQuery = !q || p.name.toLowerCase().includes(q);
    return matchesLine && matchesQuery;
  });
}
