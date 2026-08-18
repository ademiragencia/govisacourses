import { useEffect, useMemo, useState } from "react";
import { Check, Copy, CreditCard, Loader2, QrCode, Tag } from "lucide-react";
import { COURSE_LIVE } from "@/lib/config";
import { createSitePayment, verifyAsaasPayment } from "@/lib/asaas-server";
import { createMpCardPayment, listMpInstallments } from "@/lib/mp-server";
import { tokenizeCard } from "@/lib/mp-sdk";
import { formatCardNumber, formatExpiry } from "@/lib/card";
import { previewCoupon, type CouponPreview } from "@/lib/coupons";
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
  const [mpRows, setMpRows] = useState<{ count: number; value: number; total: number }[]>([]);
  const [pix, setPix] = useState<{
    paymentId: string;
    qrImage: string;
    qrPayload: string;
    amount: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [coupon, setCoupon] = useState<CouponPreview | null>(null);
  const [couponErr, setCouponErr] = useState<string | null>(null);

  const options = useMemo(() => cardInstallmentOptions(mpRows), [mpRows]);
  const chosen = options.find((o) => o.count === parcels) || cardInstallment(parcels);
  const isEntry = lead.plan === "entry";
  const basePix = isEntry ? COURSE_LIVE.entryFee : COURSE_LIVE.price;
  const pixAmount = coupon && tab === "pix" ? coupon.total : basePix;

  const cardBin = number.replace(/\D/g, "").slice(0, 6);

  useEffect(() => {
    void listMpInstallments({
      data: {
        amount: COURSE_LIVE.price,
        bin: cardBin.length >= 6 ? cardBin : "",
      },
    }).then((res) => {
      if (res.ok && res.rows.length) setMpRows(res.rows);
    });
  }, [cardBin]);

  useEffect(() => {
    if (!pix?.paymentId) return;
    let stop = false;
    const tick = async () => {
      const res = await verifyAsaasPayment({ data: { paymentId: pix.paymentId } });
      if (stop) return;
      if (res.ok && res.status === "approved") {
        onPaid(res.paymentId, pix.amount, "pix");
      }
    };
    const id = window.setInterval(() => void tick(), 3000);
    void tick();
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, [pix?.paymentId, pix?.amount, onPaid]);

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) {
      setCouponErr("Informe o cupom");
      return;
    }
    setCouponBusy(true);
    setCouponErr(null);
    const res = await previewCoupon({
      data: {
        code,
        method: tab,
        plan: tab === "pix" && !isEntry ? "pix" : lead.plan || "pix",
        amount: tab === "pix" ? basePix : chosen.total,
      },
    });
    setCouponBusy(false);
    if (!res.ok) {
      setCoupon(null);
      setCouponErr(cleanCouponError(res.error));
      return;
    }
    setCoupon(res.preview);
  }

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
      const res = await createMpCardPayment({
        data: {
          amount: COURSE_LIVE.price,
          installments: chosen.count,
          coupon: coupon?.code || "",
          title: lead.courseTitle,
          email: lead.email,
          name: lead.name,
          cpf: lead.cpf,
          phone: lead.phone,
          cardToken: tok.token,
          paymentMethodId: tok.paymentMethodId,
          issuerId: tok.issuerId,
          street: lead.street,
          number: lead.number,
          city: lead.city,
          zip: lead.cep,
          leadId: lead.id,
        },
      });
      if (!res.ok) {
        const note = res.error || "Pagamento recusado";
        setError(cleanCouponError(note));
        onAttempt?.({ status: "refused", method: "card", note });
        return;
      }
      const charged = "amount" in res && res.amount ? Number(res.amount) : chosen.total;
      if (res.status === "approved") {
        onPaid(res.paymentId, charged, "card");
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
      setError(cleanCouponError(note));
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
          amount: basePix,
          installments: 1,
          coupon: coupon?.code || "",
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
        setError(cleanCouponError(note));
        onAttempt?.({ status: "refused", method: "pix", note });
        return;
      }
      const charged = "amount" in res && res.amount ? Number(res.amount) : pixAmount;
      setPix({
        paymentId: res.paymentId,
        qrImage: res.qrImage || "",
        qrPayload: res.qrPayload,
        amount: charged,
      });
      onAttempt?.({
        status: "pending",
        method: "pix",
        paymentId: res.paymentId,
        note: coupon
          ? `Pix com cupom ${coupon.code}`
          : isEntry
            ? "Pix da entrada + 5 parcelas"
            : "Pix à vista gerado",
      });
    } catch (e) {
      const note = e instanceof Error ? e.message : "Não foi possível gerar o Pix";
      setError(cleanCouponError(note));
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
              setCoupon(null);
              setCouponErr(null);
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
              ? `Na fatura: ${chosen.count}× de ${brl(chosen.value)} · total ${brl(chosen.total)}`
              : `Na fatura: 1× de ${brl(chosen.total)}`}
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
              : coupon
                ? `De ${brl(basePix)} por ${brl(pixAmount)} com ${coupon.code}.`
                : `Pix à vista: ${brl(basePix)}.`}
          </p>
          {!isEntry && (
            <div className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
                <Tag className="size-3.5" />
                Cupom no Pix à vista
              </p>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="DESC500"
                  autoCapitalize="characters"
                />
                <button
                  type="button"
                  disabled={couponBusy}
                  onClick={() => void applyCoupon()}
                  className="h-12 shrink-0 rounded-[var(--radius-md)] border border-border px-4 text-xs font-bold uppercase tracking-[0.06em] text-fg"
                >
                  {couponBusy ? "…" : "Aplicar"}
                </button>
              </div>
              {coupon && (
                <p className="mt-2 text-sm font-semibold text-wa">
                  {coupon.code} aplicado. Você paga {brl(coupon.total)}
                  {coupon.discount ? ` (−${brl(coupon.discount)})` : ""}.
                </p>
              )}
              {couponErr && (
                <p className="mt-2 text-xs text-brand-red">{couponErr}</p>
              )}
            </div>
          )}
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
              ? `${brl(pix.amount)} de entrada. Depois 5× R$ 400 no Pix.`
              : `${brl(pix.amount)} à vista${coupon ? ` com ${coupon.code}` : ""}. Depois de pagar, a confirmação entra sozinha.`}
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

function cleanCouponError(raw: string) {
  const t = raw.replace(/^ERROR:\s*/i, "").split("\n")[0] || raw;
  if (/pix à vista|pix a vista/i.test(t)) return "Este cupom vale só no Pix à vista.";
  if (/inválido|invalido/i.test(t)) return "Cupom inválido.";
  if (/inativo/i.test(t)) return "Esse cupom está desligado.";
  if (/esgotado/i.test(t)) return "Esse cupom já esgotou.";
  return t;
}
