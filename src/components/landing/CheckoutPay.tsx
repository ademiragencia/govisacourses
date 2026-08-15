import { useEffect, useMemo, useState } from "react";
import { Check, Copy, CreditCard, Loader2, QrCode } from "lucide-react";
import { COURSE_LIVE } from "@/lib/config";
import { createSitePayment, verifyAsaasPayment } from "@/lib/asaas-server";
import { formatCardNumber, formatExpiry } from "@/lib/card";
import type { StoredLead } from "@/lib/mp";
import { brl, cardInstallment, cardInstallmentOptions } from "@/lib/pricing";

export type PayAttempt = {
  status: "paid" | "refused" | "pending" | "pix_seller";
  paymentId?: string;
  method: "card" | "pix" | "pix_seller";
  note?: string;
};

export function CheckoutPay({
  lead,
  onPaid,
  onAttempt,
}: {
  lead: StoredLead;
  onPaid: (paymentId: string, amount: number, method?: "card" | "pix") => void;
  onAttempt?: (attempt: PayAttempt) => void;
}) {
  const [tab, setTab] = useState<"card" | "pix">(
    lead.plan === "card" ? "card" : "pix",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [holder, setHolder] = useState(lead.name);
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [parcels, setParcels] = useState(Math.max(1, lead.installments || 1));
  const [pix, setPix] = useState<{
    paymentId: string;
    qrImage: string;
    qrPayload: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const options = useMemo(() => cardInstallmentOptions(), []);
  const chosen = cardInstallment(parcels);
  const isEntry = lead.plan === "entry";
  const pixAmount = isEntry ? COURSE_LIVE.entryFee : COURSE_LIVE.price;

  useEffect(() => {
    if (!pix?.paymentId) return;
    let stop = false;
    const tick = async () => {
      const res = await verifyAsaasPayment({ data: { paymentId: pix.paymentId } });
      if (stop) return;
      if (res.ok && res.status === "approved") {
        onPaid(res.paymentId, pixAmount, "pix");
      }
    };
    const id = window.setInterval(() => void tick(), 3000);
    void tick();
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [pix?.paymentId, pixAmount, onPaid]);

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
      const res = await createSitePayment({
        data: {
          method: "card",
          plan: "card",
          amount: chosen.total,
          installments: chosen.count,
          title: lead.courseTitle,
          email: lead.email,
          name: lead.name,
          cpf: lead.cpf,
          phone: lead.phone,
          cardNumber: digits,
          cardHolder: holder,
          cardMonth: mm,
          cardYear: yy,
          cardCvv: cvv,
          street: lead.street,
          number: lead.number,
          complement: lead.complement,
          city: lead.city,
          zip: lead.cep,
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
        onPaid(res.paymentId, chosen.total, "card");
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

  async function payPix() {
    setBusy(true);
    setError(null);
    try {
      const res = await createSitePayment({
        data: {
          method: "pix",
          plan: isEntry ? "entry" : "pix",
          amount: pixAmount,
          installments: 1,
          title: lead.courseTitle,
          email: lead.email,
          name: lead.name,
          cpf: lead.cpf,
          phone: lead.phone,
          street: lead.street,
          number: lead.number,
          complement: lead.complement,
          city: lead.city,
          zip: lead.cep,
          leadId: lead.id,
        },
      });
      if (!res.ok || !res.qrPayload) {
        const note = !res.ok ? res.error : "Não foi possível gerar o Pix.";
        setError(note);
        onAttempt?.({ status: "refused", method: "pix", note });
        return;
      }
      setPix({
        paymentId: res.paymentId,
        qrImage: res.qrImage || "",
        qrPayload: res.qrPayload,
      });
      onAttempt?.({
        status: "pending",
        method: "pix",
        paymentId: res.paymentId,
        note: isEntry ? "Pix da entrada + 5 parcelas" : "Pix à vista gerado",
      });
    } catch (e) {
      const note = e instanceof Error ? e.message : "Não foi possível gerar o Pix";
      setError(note);
      onAttempt?.({ status: "refused", method: "pix", note });
    } finally {
      setBusy(false);
    }
  }

  async function copyPix() {
    if (!pix?.qrPayload) return;
    try {
      await navigator.clipboard.writeText(pix.qrPayload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copie o código manualmente.");
    }
  }

  const inputClass =
    "w-full rounded-[var(--radius-md)] border border-border bg-bg px-4 py-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/20";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["pix", "Pix à vista"],
            ["card", "Cartão"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setError(null);
            }}
            className={
              tab === id
                ? "h-10 rounded-[var(--radius-md)] bg-brand-red text-sm font-bold text-white"
                : "h-10 rounded-[var(--radius-md)] border border-border text-sm font-semibold text-fg-muted"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "card" && (
        <>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-fg-subtle">
              Parcelas no cartão
            </span>
            <select
              className={inputClass}
              value={parcels}
              onChange={(e) => setParcels(Number(e.target.value))}
            >
              {options.map((opt) => (
                <option key={opt.count} value={opt.count}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-fg-muted">
            {chosen.count > 1
              ? `${chosen.count}× de ${brl(chosen.value)} · total ${brl(chosen.total)}`
              : `1× de ${brl(chosen.total)}`}
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
          <button
            type="button"
            disabled={busy}
            onClick={() => void payCard()}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red text-sm font-bold uppercase tracking-[0.04em] text-white hover:brightness-110 disabled:opacity-70"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
            Pagar {chosen.label}
          </button>
        </>
      )}

      {tab === "pix" && !pix && (
        <>
          <p className="text-sm text-fg-muted">
            {isEntry
              ? "Pague R$ 1.000 agora. As 5× R$ 400 entram no Pix todo mês."
              : `Pix à vista: ${brl(pixAmount)}.`}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void payPix()}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red text-sm font-bold uppercase tracking-[0.04em] text-white hover:brightness-110 disabled:opacity-70"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />}
            Gerar Pix de {brl(pixAmount)}
          </button>
        </>
      )}

      {tab === "pix" && pix && (
        <div className="rounded-[var(--radius-lg)] border border-border bg-bg px-4 py-5 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-line">
            Escaneie ou copie o Pix
          </p>
          {pix.qrImage && (
            <img
              src={`data:image/png;base64,${pix.qrImage}`}
              alt="QR Code Pix"
              className="mx-auto mt-4 h-48 w-48 rounded-md bg-white p-2"
            />
          )}
          <p className="mt-3 text-sm text-fg-muted">
            {isEntry
              ? `${brl(pixAmount)} de entrada. Depois 5× R$ 400 no Pix.`
              : `${brl(pixAmount)} à vista. Depois de pagar, a confirmação entra sozinha.`}
          </p>
          <button
            type="button"
            onClick={() => void copyPix()}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border text-sm font-semibold text-fg"
          >
            {copied ? <Check className="size-4 text-wa" /> : <Copy className="size-4" />}
            {copied ? "Copiado" : "Copiar código Pix"}
          </button>
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
