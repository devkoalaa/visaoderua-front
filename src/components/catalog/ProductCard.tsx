"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Eye, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { PRODUCT_LINES } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { ProductImage } from "@/components/catalog/ProductImage";

interface ProductCardProps {
  product: Product;
  onOpen: (product: Product) => void;
  onAdd: (product: Product) => void;
  index?: number;
}

export const ProductCard = forwardRef<HTMLElement, ProductCardProps>(function ProductCard({ product, onOpen, onAdd, index = 0 }, ref) {
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 3;
  const lineShort = PRODUCT_LINES.find((l) => l.key === product.line)?.short;

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ ...spring, delay: Math.min(index, 8) * 0.04 }}
      whileHover={{ y: -6 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-line bg-asphalt-800 shadow-card transition-[border-color,box-shadow] duration-400 ease-out-expo hover:border-white/20 hover:shadow-card-hover",
        soldOut && "opacity-70",
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(product)}
        aria-label={`Ver detalhes de ${product.name}`}
        className="relative isolate aspect-[4/3] w-full overflow-hidden bg-asphalt-800 [transform:translateZ(0)] focus-visible:outline-none"
      >
        <div className="absolute -inset-px transition-transform duration-600 ease-out-expo will-change-transform group-hover:scale-105">
          <ProductImage src={product.imageUrl} alt={product.name} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
        </div>
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut && <Badge variant="neutral">Esgotado</Badge>}
          {lowStock && <Badge variant="blood">Últimas {product.stock}</Badge>}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-asphalt-800 to-transparent" aria-hidden />
        <span className="absolute bottom-3 right-3 flex translate-y-2 items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-foreground/90 opacity-0 backdrop-blur-sm transition-all duration-300 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
          <Eye className="h-3.5 w-3.5" aria-hidden /> Detalhes
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          {lineShort && <span className="text-[10px] font-bold uppercase tracking-widest2 text-subtle">{lineShort}</span>}
          <h3 className="mt-0.5 truncate font-display text-2xl tracking-wider text-foreground" title={product.name}>
            {product.name}
          </h3>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3">
          <Price value={product.price} size="lg" />
        </div>
        <button
          type="button"
          onClick={() => onAdd(product)}
          disabled={soldOut}
          className={cn(
            "relative inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded border border-line-strong bg-asphalt-600 font-display text-lg uppercase tracking-widest text-foreground transition-all duration-300 ease-out-expo",
            "hover:border-blood hover:bg-blood hover:text-white active:translate-y-px",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-asphalt-800",
            "disabled:pointer-events-none disabled:opacity-40",
          )}
        >
          <ShoppingBag className="h-4 w-4" aria-hidden />
          {soldOut ? "Indisponível" : "Botar no balaio"}
        </button>
      </div>
    </motion.article>
  );
});
