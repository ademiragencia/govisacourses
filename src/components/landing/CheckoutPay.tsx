import { useState } from "react";
import { CreditCard, Loader2, MessageCircle } from "lucide-react";
import { createSitePayment } from "@/lib/mp-server";
import {
  formatCardNumber,
  formatExpiry,
  tokenizeCard,
} from "@/lib/mp-sdk";
import type { StoredLead } from "@/lib/mp";
import { getWhatsAppUrl } from "@/lib/config";

export type PayAttempt = {
  status: "paid" | "refused" | "pending" | "pix_seller";
  paymentId?: string;
  method: "card" | "pix_seller";
  note?: string;
};

export function CheckoutPay({
  lead,
  onPaid,
  onAttempt,
}: {
  lead: StoredLead;
  onPaid: (paymentId: string, amount: number) => void;
  onAttempt?: (attempt: PayAttempt) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [holder, setHolder] = useState(lead.name);
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  async function payCard() {
    const digits = number.replace(/\D/g, "");
    const [mm, yy] = expiry.split("/");
    if (digits.length < 13 || !mm || !yy || cvv.length < 3 || holder.trim().length < 3) {
      setError("Preencha os dados do cartão de crédito.");
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
        const note = res.error || "Pagamento recusado";
        setError(note);
        onAttempt?.({ status: "refused", method: "card", note });
        return;
      }
      if (res.status === "approved") {
        onPaid(res.paymentId, lead.amount);
        return;
      }
      onAttempt?.({
        status: "pending",
        method: "card",
        paymentId: res.paymentId,
        note: "Cartão em análise",
      });
      setError("Pagamento em análise. Aguarde a confirmação no cartão.");
    } catch (e) {
      const note =
        e instanceof Error ? e.message : "Não foi possível pagar com o cartão";
      setError(note);
      onAttempt?.({ status: "refused", method: "card", note });
    } finally {
      setBusy(false);
    }
  }

  function payPixSeller() {
    onAttempt?.({
      status: "pix_seller",
      method: "pix_seller",
      note: "Pix com o vendedor",
    });
    const valor = lead.amount.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    const url = getWhatsAppUrl(
      [
        "PIX COM VENDEDOR",
        `Nome: ${lead.name}`,
        `CPF: ${lead.cpf}`,
        `WhatsApp: ${lead.phone}`,
        `E-mail: ${lead.email}`,
        `Curso: ${lead.courseTitle}`,
        `Plano: ${lead.planLabel}`,
        `Valor: ${valor}`,
        "Quero pagar no Pix com o vendedor.",
      ].join("\n"),
    );
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  const inputClass =
    "w-full rounded-[var(--radius-md)] border border-border bg-bg px-4 py-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/20";

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fg-subtle">
        Cartão de crédito
      </p>
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
      <button
        type="button"
        disabled={busy}
        onClick={payPixSeller}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border text-sm font-semibold text-fg hover:bg-bg"
      >
        <MessageCircle className="size-4 text-wa" />
        Pagar no Pix com o vendedor
      </button>
      {error && (
        <div className="rounded-[var(--radius-md)] border border-brand-red/40 bg-brand-red-soft px-4 py-3 text-sm text-fg">
          {error}
        </div>
      )}
    </div>
  );
}
