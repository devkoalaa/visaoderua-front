"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CreditCard, Lock, QrCode, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { maskCard, maskCVV, maskExpiry } from "@/lib/format";
import { spring } from "@/lib/motion";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FieldsetTitle } from "@/components/checkout/AddressStep";
import { emptyCard, type CardForm, type PaymentMethod } from "@/components/checkout/types";
import { validateCard } from "@/components/checkout/validation";

interface PaymentStepProps {
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  processing: boolean;
}

/**
 * Cartão fica desabilitado até o front gerar o token do Mercado Pago
 * (paymentData.token) que o backend exige. PIX é o único método ativo.
 */
const options: { key: PaymentMethod; title: string; desc: string; icon: React.ReactNode; badge?: string; disabled?: boolean }[] = [
  { key: "pix", title: "PIX", desc: "Aprovação imediata.", icon: <QrCode className="h-6 w-6" />, badge: `${Math.round(site.pixDiscount * 100)}% off` },
  { key: "credit_card", title: "Cartão de crédito", desc: "Em breve, até 3x sem juros.", icon: <CreditCard className="h-6 w-6" />, disabled: true },
];

export function PaymentStep({ method, onMethodChange, onBack, onSubmit, processing }: PaymentStepProps) {
  const [card, setCard] = useState<CardForm>(emptyCard);
  const [errors, setErrors] = useState<Partial<Record<keyof CardForm, string>>>({});

  const setField = (field: keyof CardForm, mask?: (v: string) => string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCard((c) => ({ ...c, [field]: mask ? mask(e.target.value) : e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (method === "credit_card") {
      const result = validateCard(card);
      setErrors(result);
      if (Object.keys(result).length > 0) return;
    }
    await onSubmit();
  };

  return (
    <motion.form
      key="payment"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-8"
    >
      <fieldset className="surface flex flex-col gap-5 p-5 sm:p-6">
        <legend className="sr-only">Forma de pagamento</legend>
        <FieldsetTitle icon={<Wallet className="h-4 w-4" />} title="Forma de pagamento" />

        <div role="radiogroup" aria-label="Forma de pagamento" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((opt) => {
            const active = method === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={active}
                aria-disabled={opt.disabled || undefined}
                disabled={opt.disabled}
                onClick={() => !opt.disabled && onMethodChange(opt.key)}
                className={cn(
                  "relative flex items-center gap-4 rounded-lg border p-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blood",
                  active ? "border-blood bg-blood/5" : "border-line hover:border-line-strong",
                  opt.disabled && "cursor-not-allowed opacity-50 hover:border-line",
                )}
              >
                {active && <motion.span layoutId="payment-active" transition={spring} className="absolute inset-0 rounded-lg ring-1 ring-blood" aria-hidden />}
                <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors", active ? "border-blood/50 bg-blood/10 text-blood" : "border-line bg-asphalt-700 text-foreground/60")}>
                  {opt.icon}
                </span>
                <span className="flex flex-col">
                  <span className="flex flex-wrap items-center gap-2 font-display text-xl tracking-widest text-foreground">
                    {opt.title}
                    {opt.badge && <Badge variant="blood" className="shrink-0">{opt.badge}</Badge>}
                    {opt.disabled && <Badge variant="neutral" className="shrink-0">Em breve</Badge>}
                  </span>
                  <span className="text-xs text-muted">{opt.desc}</span>
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {method === "credit_card" && (
            <motion.div
              key="card-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-line bg-asphalt-900 p-4">
                <Input className="col-span-2" label="Número do cartão" name="card-number" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={card.number} onChange={setField("number", maskCard)} error={errors.number} leftIcon={<CreditCard className="h-4 w-4" />} required />
                <Input label="Validade" name="card-expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={card.expiry} onChange={setField("expiry", maskExpiry)} error={errors.expiry} required />
                <Input label="CVV" name="card-cvv" inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvv} onChange={setField("cvv", maskCVV)} error={errors.cvv} required />
                <Input className="col-span-2" label="Nome no cartão" name="card-holder" autoComplete="cc-name" value={card.holder} onChange={setField("holder")} error={errors.holder} required />
                <p className="col-span-2 flex items-center gap-2 text-xs text-subtle">
                  <Lock className="h-3.5 w-3.5" aria-hidden /> Ambiente seguro. Seus dados são criptografados.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </fieldset>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button type="button" variant="secondary" size="xl" onClick={onBack} disabled={processing} leftIcon={<ArrowLeft className="h-5 w-5" />} className="sm:w-1/3">
          Voltar
        </Button>
        <Button type="submit" size="xl" loading={processing} className="sm:flex-1" leftIcon={<Lock className="h-5 w-5" />}>
          {method === "pix" ? "Gerar PIX" : "Finalizar compra"}
        </Button>
      </div>
    </motion.form>
  );
}
