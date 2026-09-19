"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Copy, QrCode, RefreshCw, Smartphone } from "lucide-react";
import type { PixData } from "@/types";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { formatCountdown } from "@/lib/format";
import { fetchOrderStatus } from "@/lib/api";
import { useCopyToClipboard, useCountdown } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PixStepProps {
  /** id interno, usado para consultar o status. */
  orderId: string;
  /** número legível exibido ao cliente. */
  orderNumber: string;
  pix: PixData | null;
  onPaid: () => void;
  onRegenerate: () => void;
}

const POLL_MS = 5000;

export function PixStep({ orderId, orderNumber, pix, onPaid, onRegenerate }: PixStepProps) {
  const { seconds, expired } = useCountdown(site.pixExpirationMinutes * 60, true);
  const { copied, copy } = useCopyToClipboard();

  // Consulta o status do pedido periodicamente até o pagamento ser confirmado.
  useEffect(() => {
    if (expired) return;
    const controller = new AbortController();
    const id = window.setInterval(async () => {
      try {
        const { status } = await fetchOrderStatus(orderId, controller.signal);
        if (status === "PAID") {
          window.clearInterval(id);
          onPaid();
        }
      } catch {
        /* tenta de novo no próximo ciclo */
      }
    }, POLL_MS);
    return () => {
      window.clearInterval(id);
      controller.abort();
    };
  }, [orderId, expired, onPaid]);

  const code = pix?.qr_code;
  const image = pix?.qr_code_base64;

  return (
    <motion.div
      key="pix"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="surface flex flex-col items-center gap-6 p-6 text-center sm:p-10"
    >
      <div>
        <Badge variant="outline" className="mb-3">
          Pedido {orderNumber}
        </Badge>
        <h2 className="font-display text-display-sm uppercase text-foreground">Quase lá, visionário!</h2>
        <p className="mt-2 text-sm text-muted">Escaneie o QR Code ou copie o código para pagar no app do seu banco.</p>
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 22 }}
        className={cn("relative rounded-xl bg-white p-4 shadow-modal", expired && "opacity-40 grayscale")}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`data:image/png;base64,${image}`} alt="QR Code PIX" width={208} height={208} className="h-52 w-52" />
        ) : (
          <div className="flex h-52 w-52 items-center justify-center bg-gray-100">
            <QrCode className="h-14 w-14 animate-pulse text-gray-400" aria-label="Gerando QR Code" />
          </div>
        )}
      </motion.div>

      <div className="flex w-full max-w-md items-center gap-2 rounded border border-line bg-asphalt-900 p-2 pl-4">
        <p className="min-w-0 flex-1 truncate text-left font-mono text-xs text-foreground/70">{code ?? "Gerando código PIX…"}</p>
        <Button
          size="sm"
          variant={copied ? "whatsapp" : "secondary"}
          disabled={!code || expired}
          onClick={() => code && copy(code)}
          leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        >
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>

      {expired ? (
        <div className="flex flex-col items-center gap-3">
          <p className="font-display text-2xl tracking-widest text-blood">PIX expirado</p>
          <Button variant="outline" onClick={onRegenerate} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Gerar novo PIX
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="flex items-center gap-2 text-sm text-muted">
            <span className="inline-flex h-2 w-2 rounded-full bg-blood" aria-hidden />
            Aguardando pagamento
            <span className={cn("font-mono text-lg font-bold tabular-nums", seconds < 60 ? "text-blood animate-pulse" : "text-foreground")}>{formatCountdown(seconds)}</span>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-subtle">
            <Smartphone className="h-3.5 w-3.5" aria-hidden /> Assim que o pagamento cair, você é redirecionado automaticamente.
          </p>
        </div>
      )}
    </motion.div>
  );
}
