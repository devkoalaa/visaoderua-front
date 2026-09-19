"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import type { PixData } from "@/types";
import { site } from "@/lib/site";
import { onlyDigits } from "@/lib/format";
import { ApiError, createCheckout } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/providers/ToastProvider";
import { Container } from "@/components/ui/container";
import { Steps } from "@/components/checkout/Steps";
import { AddressStep } from "@/components/checkout/AddressStep";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { PixStep } from "@/components/checkout/PixStep";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { emptyForm, RA_OPTIONS, STEPS, type CheckoutForm, type CheckoutStep, type PaymentMethod } from "@/components/checkout/types";

export function CheckoutFlow() {
  const router = useRouter();
  const { items, subtotal, hydrated, clear } = useCart();
  const { toast } = useToast();

  const [step, setStep] = useState<CheckoutStep>("address");
  const [form, setForm] = useState<CheckoutForm>(emptyForm);
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pix, setPix] = useState<PixData | null>(null);

  // Sem itens não há checkout (exceto enquanto aguarda o PIX).
  useEffect(() => {
    if (hydrated && items.length === 0 && step !== "pix") router.replace("/");
  }, [hydrated, items.length, step, router]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const patchForm = useCallback((patch: Partial<CheckoutForm>) => setForm((f) => ({ ...f, ...patch })), []);

  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const finish = useCallback(
    (displayNumber: string) => {
      clear();
      router.push(`/success?order=${encodeURIComponent(displayNumber)}`);
    },
    [clear, router],
  );

  const submitPayment = async () => {
    setProcessing(true);
    try {
      const isDF = form.uf === "DF";
      const raLabel = RA_OPTIONS.find((r) => r.value === form.ra)?.label;
      const data = await createCheckout({
        customer: { name: form.nome.trim(), email: form.email.trim(), cpf: onlyDigits(form.cpf), phone: onlyDigits(form.telefone) },
        address: {
          street: form.logradouro.trim(),
          number: form.numero.trim(),
          complement: form.complemento.trim(),
          neighborhood: isDF ? form.ra : form.bairro.trim(),
          city: form.cidade.trim() || site.city,
          state: form.uf || site.state,
          cep: onlyDigits(form.cep),
        },
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        paymentMethod: method === "pix" ? "PIX" : "CREDIT_CARD",
      });
      const id = data.orderId;
      const number = data.orderNumber ?? id;
      setOrderId(id);
      setOrderNumber(number);
      if (method === "pix") {
        setPix(data.paymentResult ?? null);
        setStep("pix");
        toast({ variant: "success", title: "PIX gerado", description: `Pedido ${number}${raLabel ? ` · ${raLabel}` : ""}` });
      } else {
        finish(number);
      }
    } catch (error) {
      console.error("[checkout]", error);
      const detail = error instanceof ApiError && error.status === 400 ? "Confira os dados informados." : "Tenta de novo em instantes ou chama no WhatsApp.";
      toast({ variant: "error", title: "Não rolou processar o pagamento", description: detail });
    } finally {
      setProcessing(false);
    }
  };

  if (!hydrated || (items.length === 0 && step !== "pix")) {
    return <div className="min-h-[60vh]" aria-busy />;
  }

  const currentStep = STEPS.find((s) => s.key === step)!;
  const discountRate = method === "pix" && step !== "address" ? site.pixDiscount : 0;

  return (
    <Container className="py-10 md:py-14">
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/#catalogo" className="mb-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-subtle transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Continuar comprando
          </Link>
          <h1 className="flex items-center gap-3 font-display text-display-sm uppercase text-foreground md:text-display-md">
            <ShoppingBag className="h-8 w-8 text-blood" aria-hidden />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {currentStep.title}
              </motion.span>
            </AnimatePresence>
          </h1>
        </div>
        <div className="w-full md:w-80">
          <Steps current={step} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="order-2 lg:order-1 lg:col-span-2">
          <AnimatePresence mode="wait" initial={false}>
            {step === "address" && <AddressStep key="address" form={form} onChange={patchForm} onNext={() => setStep("payment")} />}
            {step === "payment" && (
              <PaymentStep key="payment" method={method} onMethodChange={setMethod} onBack={() => setStep("address")} onSubmit={submitPayment} processing={processing} />
            )}
            {step === "pix" && orderId && (
              <PixStep key="pix" orderId={orderId} orderNumber={orderNumber ?? orderId} pix={pix} onPaid={() => finish(orderNumber ?? orderId)} onRegenerate={() => setStep("payment")} />
            )}
          </AnimatePresence>
        </div>
        <div className="order-1 lg:order-2">
          <OrderSummary items={items} subtotal={subtotal} discountRate={discountRate} />
        </div>
      </div>
    </Container>
  );
}
