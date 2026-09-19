"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Home, MessageCircle, Package, Truck } from "lucide-react";
import { site, whatsappLink } from "@/lib/site";
import { ease } from "@/lib/motion";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const list = { hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: ease.out } } };

export function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order") ?? "—";

  return (
    <Container size="sm" className="py-16 text-center md:py-24">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 64 64" className="relative h-24 w-24" aria-hidden>
          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3" className="text-whatsapp" />
          <motion.path
            d="M20 33 L28 41 L44 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-whatsapp"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: ease.out }}
          />
        </svg>
      </motion.div>

      <motion.div variants={list} initial="hidden" animate="visible" className="flex flex-col items-center">
        <motion.h1 variants={item} className="font-display text-display-md uppercase text-foreground md:text-display-lg">
          Pedido confirmado!
        </motion.h1>
        <motion.p variants={item} className="mt-3 max-w-md text-lg text-muted">
          Sua lupa tá garantida, parceiro. Só aguardar o corre.
        </motion.p>

        <motion.div variants={item} className="surface relative mt-10 w-full overflow-hidden p-6 text-left sm:p-8">
          <Truck className="absolute -right-6 -top-6 h-40 w-40 text-white/[0.03]" aria-hidden />
          <h2 className="mb-6 flex items-center gap-2 font-display text-2xl tracking-widest text-foreground">
            <Package className="h-5 w-5 text-blood" aria-hidden /> Detalhes da entrega
          </h2>
          <dl className="relative grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-widest text-subtle">Código do pedido</dt>
              <dd className="mt-1 break-all font-mono text-lg font-bold text-blood">{orderId}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-subtle">Prazo estimado</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">Até {site.deliveryDaysDF} dias úteis no DF</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-subtle">Status</dt>
              <dd className="mt-1.5">
                <Badge variant="success">Pagamento aprovado</Badge>
              </dd>
            </div>
          </dl>
        </motion.div>

        <motion.div variants={item} className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <ButtonLink href="/" size="lg" leftIcon={<Home className="h-5 w-5" />}>
            Voltar pra loja
          </ButtonLink>
          <ButtonLink href={whatsappLink(`Salve! Acabei de fazer o pedido ${orderId}.`)} variant="whatsapp" size="lg" leftIcon={<MessageCircle className="h-5 w-5" />}>
            Falar no WhatsApp
          </ButtonLink>
        </motion.div>
      </motion.div>
    </Container>
  );
}
