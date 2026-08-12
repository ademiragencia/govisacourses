import { useEffect, useState } from "react";
import {
  Barcode,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  QrCode,
} from "lucide-react";
import { createSitePayment, verifyMpPayment } from "@/lib/mp-server";
import {
  formatCardNumber,
  formatExpiry,
  tokenizeCard,
} from "@/lib/mp-sdk";
import type { StoredLead } from "@/lib/mp";
import { cn } from "@/lib/utils";

type Method = "pix" | "card" | "boleto";

export function CheckoutPay({
  lead,
  onPaid,
}: {
  lead: StoredLead;
  onPaid: (paymentId: string, amount: number) => void;
}) {
  const [method, setMethod] = useState<Method>("card");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [holder, setHolder] = useState(lead.name);
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [qr, setQr] = useState("");
  const [qrImg, setQrImg] = useState("");
  const [barcode, setBarcode] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!paymentId || method === "card") return;
    let stop = false;
    const tick = async () => {
      const r = await verifyMpPayment({ data: { paymentId } });
      if (stop) return;
      if (r.ok && r.status === "approved") {
        onPaid(r.paymentId, r.amount || lead.amount);
      }
    };
    const id = window.setInterval(() => void tick(), 3000);
    void tick();
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [paymentId, method, lead.amount, onPaid]);

  async function payPix() {
    setBusy(true);
    setError(null);
    try {
      const res = await createSitePayment({
        data: {
          method: "pix",
          amount: lead.amount,
          installments: 1,
          title: lead.courseTitle,
          email: lead.email,
          name: lead.name,
          cpf: lead.cpf,
          phone: lead.phone,
          leadId: lead.id,
        },
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (res.status === "approved") {
        onPaid(res.paymentId, lead.amount);
        return;
      }
      setPaymentId(res.paymentId);
      setQr(res.qrCode);
      setQrImg(res.qrBase64);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no Pix");
    } finally {
      setBusy(false);
    }
  }

  async function payCard() {
    const digits = number.replace(/\D/g, "");
    const [mm, yy] = expiry.split("/");
    if (digits.length < 13 || !mm || !yy || cvv.length < 3 || holder.trim().length < 3) {
      setError("Preencha os dados do cartão.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const tok = await tokenizeCard({
        cardNumber: digits,
        cardholderName: holder,
        cardExpirationMonth: mm,
        cardExpirationYear: yy,
        securityCode: cvv,
        identificationNumber: lead.cpf,
      });
      const res = await createSitePayment({
        data: {
          method: "card",
          amount: lead.amount,
          installments: lead.installments || 1,
          title: lead.courseTitle,
          email: lead.email,
          name: lead.name,
          cpf: lead.cpf,
          phone: lead.phone,
          cardToken: tok.token,
          paymentMethodId: tok.paymentMethodId,
          issuerId: tok.issuerId,
          leadId: lead.id,
        },
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (res.status === "approved") {
        onPaid(res.paymentId, lead.amount);
        return;
      }
      setError("Pagamento em análise. Aguarde a confirmação.");
      setPaymentId(res.paymentId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível pagar com cartão");
    } finally {
      setBusy(false);
    }
  }

  async function payBoleto() {
    setBusy(true);
    setError(null);
    try {
      const res = await createSitePayment({
        data: {
          method: "boleto",
          amount: lead.amount,
          installments: 1,
          title: lead.courseTitle,
          email: lead.email,
          name: lead.name,
          cpf: lead.cpf,
          phone: lead.phone,
          street: lead.street,
          number: lead.number,
          neighborhood: lead.neighborhood,
          city: lead.city,
          state: lead.state,
          zip: lead.cep,
          leadId: lead.id,
        },
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPaymentId(res.paymentId);
      setBarcode(res.barcode);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no boleto");
    } finally {
      setBusy(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  const inputClass =
    "w-full rounded-[var(--radius-md)] border border-border bg-bg px-4 py-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/20";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { id: "pix" as const, label: "Pix", icon: QrCode },
            { id: "card" as const, label: "Cartão", icon: CreditCard },
            { id: "boleto" as const, label: "Boleto", icon: Barcode },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMethod(id);
              setError(null);
            }}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] border px-2 py-3 text-xs font-bold uppercase tracking-[0.06em]",
              method === id
                ? "border-brand-red bg-brand-red-soft text-fg"
                : "border-border text-fg-muted hover:text-fg",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {method === "pix" && !qr && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void payPix()}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red text-sm font-bold uppercase tracking-[0.04em] text-white hover:brightness-110 disabled:opacity-70"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />}
          Gerar Pix
        </button>
      )}

      {method === "pix" && qr && (
        <div className="space-y-3 text-center">
          {qrImg && (
            <img
              src={`data:image/png;base64,${qrImg}`}
              alt="QR Code Pix"
              className="mx-auto h-44 w-44 rounded-[var(--radius-md)] bg-white p-2"
            />
          )}
          <p className="text-xs text-fg-muted">
            Escaneie o QR ou copie o código. A confirmação é automática.
          </p>
          <button
            type="button"
            onClick={() => void copy(qr)}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border text-sm font-semibold text-fg"
          >
            {copied ? <CheckCircle2 className="size-4 text-wa" /> : <Copy className="size-4" />}
            {copied ? "Código copiado" : "Copiar código Pix"}
          </button>
        </div>
      )}

      {method === "card" && (
        <div className="space-y-3">
          <input
            className={inputClass}
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
            placeholder="Nome no cartão"
            autoComplete="cc-name"
          />
          <input
            className={inputClass}
            value={number}
            onChange={(e) => setNumber(formatCardNumber(e.target.value))}
            placeholder="Número do cartão"
            inputMode="numeric"
            autoComplete="cc-number"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/AA"
              inputMode="numeric"
              autoComplete="cc-exp"
            />
            <input
              className={inputClass}
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="CVV"
              inputMode="numeric"
              autoComplete="cc-csc"
            />
          </div>
          {lead.installments > 1 && (
            <p className="text-xs text-fg-muted">
              Será cobrado em {lead.installments}x de{" "}
              {(lead.amount / lead.installments).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              .
            </p>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void payCard()}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red text-sm font-bold uppercase tracking-[0.04em] text-white hover:brightness-110 disabled:opacity-70"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
            Pagar {lead.planLabel}
          </button>
        </div>
      )}

      {method === "boleto" && !barcode && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void payBoleto()}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red text-sm font-bold uppercase tracking-[0.04em] text-white hover:brightness-110 disabled:opacity-70"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Barcode className="size-4" />}
          Gerar boleto
        </button>
      )}

      {method === "boleto" && barcode && (
        <div className="space-y-3">
          <p className="break-all rounded-[var(--radius-md)] border border-border bg-bg px-3 py-3 font-mono text-xs text-fg">
            {barcode}
          </p>
          <button
            type="button"
            onClick={() => void copy(barcode)}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border text-sm font-semibold text-fg"
          >
            {copied ? <CheckCircle2 className="size-4 text-wa" /> : <Copy className="size-4" />}
            {copied ? "Linha copiada" : "Copiar linha digitável"}
          </button>
          <p className="text-xs text-fg-muted">
            O acesso é liberado depois da compensação do boleto.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-[var(--radius-md)] border border-brand-red/40 bg-brand-red-soft px-4 py-3 text-sm text-fg">
          {error}
        </div>
      )}
    </div>
  );
}
