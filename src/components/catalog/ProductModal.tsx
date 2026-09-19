"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import type { Product } from "@/types";
import { site, whatsappLink } from "@/lib/site";
import { lineLabel } from "@/lib/products";
import { Modal, CloseButton } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ProductImage } from "@/components/catalog/ProductImage";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product, quantity: number) => void;
}

const DEFAULT_DESCRIPTION =
  "Armação robusta com design autêntico. Lentes de alta qualidade com proteção total para você dominar a rua com muito estilo e atitude. O kit perfeito para quem tem visão.";

export function ProductModal({ product, onClose, onAdd }: ProductModalProps) {
  // Mantém o último produto durante a animação de saída.
  const [current, setCurrent] = useState<Product | null>(product);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setCurrent(product);
      setQuantity(1);
    }
  }, [product]);

  const p = product ?? current;
  const soldOut = (p?.stock ?? 0) <= 0;
  const max = Math.max(1, Math.min(p?.stock ?? 1, 10));

  return (
    <Modal open={!!product} onClose={onClose} labelledBy="product-modal-title">
      {p && (
        <div className="flex max-h-[92dvh] flex-col overflow-y-auto md:flex-row md:overflow-hidden">
          <CloseButton onClick={onClose} className="absolute right-4 top-4 z-10" />

          <div className="relative flex min-h-[260px] w-full items-center justify-center border-b border-line bg-asphalt-800 p-5 md:min-h-[520px] md:w-1/2 md:border-b-0 md:border-r md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-line md:aspect-[3/4]"
            >
              <ProductImage src={p.imageUrl} alt={p.name} sizes="(max-width: 768px) 90vw, 40vw" priority />
            </motion.div>
          </div>

          <div className="flex w-full flex-col gap-6 p-6 md:w-1/2 md:p-12">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{lineLabel(p.line)}</Badge>
                {soldOut ? <Badge variant="neutral">Esgotado</Badge> : p.stock <= 3 ? <Badge variant="blood">Últimas {p.stock}</Badge> : <Badge variant="success">Pronta entrega</Badge>}
              </div>
              <h2 id="product-modal-title" className="font-display text-display-sm uppercase text-foreground md:text-display-md">
                {p.name}
              </h2>
              <Price value={p.price} size="xl" glow />
              <p className="text-sm leading-relaxed text-muted md:text-base">{p.description || DEFAULT_DESCRIPTION}</p>
              {(p.lensColor || p.frameType) && (
                <dl className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                  {p.lensColor && (
                    <div>
                      <dt className="uppercase tracking-widest text-subtle">Lente</dt>
                      <dd className="mt-0.5 text-foreground/85">{p.lensColor}</dd>
                    </div>
                  )}
                  {p.frameType && (
                    <div>
                      <dt className="uppercase tracking-widest text-subtle">Armação</dt>
                      <dd className="mt-0.5 text-foreground/85">{p.frameType}</dd>
                    </div>
                  )}
                </dl>
              )}
            </motion.div>

            <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 gap-3 text-xs text-foreground/70">
              <li className="flex items-center gap-2 rounded border border-line bg-asphalt-800 px-3 py-2">
                <Truck className="h-4 w-4 shrink-0 text-blood" aria-hidden /> Até {site.deliveryDaysDF} dias no DF
              </li>
              <li className="flex items-center gap-2 rounded border border-line bg-asphalt-800 px-3 py-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-blood" aria-hidden /> Compra protegida
              </li>
            </motion.ul>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mt-auto flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <QuantityStepper size="md" value={quantity} min={1} max={max} onIncrement={() => setQuantity((q) => Math.min(max, q + 1))} onDecrement={() => setQuantity((q) => Math.max(1, q - 1))} />
                <Button size="lg" className="flex-1" disabled={soldOut} onClick={() => onAdd(p, quantity)} leftIcon={<ShoppingBag className="h-5 w-5" />}>
                  {soldOut ? "Indisponível" : "Botar no balaio"}
                </Button>
              </div>
              <a
                href={whatsappLink(`Salve! Tenho interesse na ${p.name}. Ainda tem disponível?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm text-muted transition-colors hover:text-whatsapp"
              >
                <MessageCircle className="h-4 w-4" aria-hidden /> Tirar dúvida no WhatsApp
              </a>
            </motion.div>
          </div>
        </div>
      )}
    </Modal>
  );
}
