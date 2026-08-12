import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  DECISION_OPTIONS,
  MONEY_OPTIONS,
  STRICT_AVAILABILITY_OPTIONS,
  STRICT_MODALITY_OPTIONS,
  STRICT_MOTIVATION_OPTIONS,
  emptyStrictAnswers,
  evaluateStrict,
  formatPhoneInput,
  isEmailValid,
  isHardMoneyFail,
  isPhoneValid,
  type StrictAnswers,
  type StrictMeta,
  type StrictResult,
} from "@/lib/strict-qualify";
import { COURSE_LIVE, COURSE_SELF } from "@/lib/config";
import { createMpCheckout } from "@/lib/mp-server";
import { newLeadId, offerFor, saveLead } from "@/lib/mp";
import { cn } from "@/lib/utils";

type Screen = "gate" | "commit" | "contact" | "pay" | "fail";

function OptionGrid({
  options,
  value,
  onChange,
  name,
}: {
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  name: string;
}) {
  return (
    <div className="grid gap-2" role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-[var(--radius-md)] border px-4 py-3.5 text-left text-sm font-medium transition-all",
              active
                ? "border-brand-red bg-brand-red-soft text-fg shadow-[0_0_0_1px_rgba(225,29,46,0.35)]"
                : "border-border bg-bg-elevated/50 text-fg-muted hover:border-border-strong hover:text-fg",
            )}
          >
            <span className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border",
                  active
                    ? "border-brand-red bg-brand-red"
                    : "border-fg-subtle/40",
                )}
              >
                {active && <span className="size-1.5 rounded-full bg-white" />}
              </span>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Field({
  label,
  children,
  error,
  htmlFor,
  hint,
}: {
  label: string;
  children: ReactNode;
  error?: string;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <div className="block">
      <div className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-fg-subtle">
        {htmlFor ? (
          <label htmlFor={htmlFor}>{label}</label>
        ) : (
          <span>{label}</span>
        )}
      </div>
      {hint ? (
        <p className="mb-2 text-xs leading-relaxed text-fg-muted">{hint}</p>
      ) : null}
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-brand-red">
          {error}
        </span>
      ) : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/20";

export function MatriculaWizard({
  meta,
  className,
}: {
  meta?: StrictMeta;
  className?: string;
}) {
  const fichaMeta: StrictMeta = { source: "ads-matricula", ...meta };

  const [screen, setScreen] = useState<Screen>("gate");
  const [answers, setAnswers] = useState<StrictAnswers>(emptyStrictAnswers);
  const [errors, setErrors] = useState<
    Partial<Record<keyof StrictAnswers, string>>
  >({});
  const [result, setResult] = useState<StrictResult | null>(null);
  const [sending, setSending] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const offer = offerFor(answers.modality);

  const progress = useMemo(() => {
    if (screen === "gate") return 20;
    if (screen === "commit") return 45;
    if (screen === "contact") return 70;
    if (screen === "pay") return 90;
    return 100;
  }, [screen]);

  const set =
    (key: keyof StrictAnswers) =>
    (value: string) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  function goGateNext() {
    const e: Partial<Record<keyof StrictAnswers, string>> = {};
    if (!answers.money) e.money = "Selecione quando você consegue pagar";
    if (!answers.modality) e.modality = "Escolha a modalidade do curso";
    setErrors(e);
    if (Object.keys(e).length) return;

    if (isHardMoneyFail(answers.money)) {
      setResult(evaluateStrict(answers));
      setScreen("fail");
      return;
    }
    setScreen("commit");
  }

  function goCommitNext() {
    const e: Partial<Record<keyof StrictAnswers, string>> = {};
    if (!answers.decision) e.decision = "Selecione quem decide o pagamento";
    if (!answers.availability)
      e.availability = "Selecione sua disponibilidade";
    if (!answers.motivation) e.motivation = "Selecione o que você quer agora";
    setErrors(e);
    if (Object.keys(e).length) return;

    const r = evaluateStrict(answers);
    setResult(r);
    setScreen(r.status === "qualified" ? "contact" : "fail");
  }

  function goContactNext() {
    const e: Partial<Record<keyof StrictAnswers, string>> = {};
    if (answers.name.trim().length < 2) e.name = "Informe seu nome completo";
    if (!isEmailValid(answers.email)) e.email = "Informe um e-mail válido";
    if (!isPhoneValid(answers.phone))
      e.phone = "WhatsApp válido com DDD (mín. 10 dígitos)";
    if (answers.city.trim().length < 2) e.city = "Informe sua cidade";
    setErrors(e);
    if (Object.keys(e).length) return;
    setScreen("pay");
  }

  async function startCheckout() {
    if (!result || result.status !== "qualified") return;
    setSending(true);
    setPayError(null);
    const leadId = newLeadId();
    saveLead({
      ...answers,
      id: leadId,
      meta: fichaMeta,
      amount: offer.amount,
      courseTitle: offer.title,
    });
    try {
      const res = await createMpCheckout({
        data: {
          name: answers.name,
          email: answers.email,
          phone: answers.phone,
          city: answers.city,
          modality: answers.modality === "live" ? "live" : "self",
          leadId,
          origin: window.location.origin,
        },
      });
      if (!res.ok) {
        setPayError(res.error);
        return;
      }
      window.location.href = res.initPoint;
    } catch (err) {
      setPayError(
        err instanceof Error ? err.message : "Não foi possível abrir o pagamento",
      );
    } finally {
      setSending(false);
    }
  }

  const title =
    screen === "gate"
      ? "Investimento do curso"
      : screen === "commit"
        ? "Compromisso com a formação"
        : screen === "contact"
          ? "Seus dados para matrícula"
          : screen === "pay"
            ? "Pague para garantir a vaga"
            : "Ainda não é o momento";

  const hint =
    screen === "gate"
      ? "Só segue quem consegue pagar agora"
      : screen === "commit"
        ? "Queremos alunos prontos para começar"
        : screen === "contact"
          ? "Depois você paga no Mercado Pago"
          : screen === "pay"
            ? "WhatsApp só depois do pagamento aprovado"
            : "Esta turma é para quem já tem o investimento.";

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-bg-elevated shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div className="shrink-0 border-b border-border px-5 pb-4 pt-5 sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-line">
          Matrícula
        </p>
        <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-fg">
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-fg-muted">{hint}</p>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-brand-red transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-5 py-5 sm:px-6">
        {screen === "gate" && (
          <div className="space-y-5">
            <div className="rounded-[var(--radius-md)] border border-border bg-bg/60 px-4 py-3 text-xs leading-relaxed text-fg-muted">
              <p className="font-bold text-fg">Valores do curso</p>
              <p className="mt-1">
                {COURSE_SELF.shortName}: {COURSE_SELF.planLabel}
              </p>
              <p>
                {COURSE_LIVE.shortName}: {COURSE_LIVE.planLabel}
              </p>
            </div>
            <Field
              label="Você consegue pagar a matrícula agora?"
              error={errors.money}
            >
              <OptionGrid
                name="Investimento"
                options={MONEY_OPTIONS}
                value={answers.money}
                onChange={set("money")}
              />
            </Field>
            <Field label="Qual curso você quer?" error={errors.modality}>
              <OptionGrid
                name="Modalidade"
                options={STRICT_MODALITY_OPTIONS}
                value={answers.modality}
                onChange={set("modality")}
              />
            </Field>
          </div>
        )}

        {screen === "commit" && (
          <div className="space-y-5">
            <Field
              label="Você decide e paga a matrícula?"
              error={errors.decision}
            >
              <OptionGrid
                name="Decisão"
                options={DECISION_OPTIONS}
                value={answers.decision}
                onChange={set("decision")}
              />
            </Field>
            <Field
              label="Horas por semana para o curso"
              error={errors.availability}
            >
              <OptionGrid
                name="Disponibilidade"
                options={STRICT_AVAILABILITY_OPTIONS}
                value={answers.availability}
                onChange={set("availability")}
              />
            </Field>
            <Field label="O que você quer agora?" error={errors.motivation}>
              <OptionGrid
                name="Motivação"
                options={STRICT_MOTIVATION_OPTIONS}
                value={answers.motivation}
                onChange={set("motivation")}
              />
            </Field>
          </div>
        )}

        {screen === "contact" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-wa/30 bg-wa/10 px-4 py-3 text-xs leading-relaxed text-fg">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-wa" />
              Você passou no filtro. No próximo passo o pagamento é no Mercado
              Pago. A equipe só é avisada depois da aprovação.
            </div>
            <Field label="Nome completo" error={errors.name} htmlFor="m-name">
              <input
                id="m-name"
                className={inputClass}
                value={answers.name}
                onChange={(e) => set("name")(e.target.value)}
                placeholder="Como devemos te chamar"
                autoComplete="name"
                autoFocus
              />
            </Field>
            <Field label="E-mail" error={errors.email} htmlFor="m-email">
              <input
                id="m-email"
                type="email"
                className={inputClass}
                value={answers.email}
                onChange={(e) => set("email")(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </Field>
            <Field label="WhatsApp" error={errors.phone} htmlFor="m-phone">
              <input
                id="m-phone"
                className={inputClass}
                value={answers.phone}
                onChange={(e) => set("phone")(formatPhoneInput(e.target.value))}
                placeholder="(71) 99999-9999"
                inputMode="tel"
                autoComplete="tel"
              />
            </Field>
            <Field label="Cidade" error={errors.city} htmlFor="m-city">
              <input
                id="m-city"
                className={inputClass}
                value={answers.city}
                onChange={(e) => set("city")(e.target.value)}
                placeholder="Ex.: São Paulo, SP"
                autoComplete="address-level2"
              />
            </Field>
          </div>
        )}

        {screen === "pay" && (
          <div className="space-y-5">
            <div className="rounded-[var(--radius-xl)] border border-gold-line/40 bg-gold-line/10 p-5 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-line">
                {offer.shortName}
              </p>
              <p className="mt-2 font-display text-4xl font-extrabold text-fg">
                {offer.priceLabel}
              </p>
              <p className="mt-1 text-sm text-fg-muted">{offer.planLabel}</p>
            </div>
            <dl className="space-y-2 text-sm">
              {[
                ["Nome", answers.name],
                ["E-mail", answers.email],
                ["WhatsApp", answers.phone],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-fg-subtle">{k}</dt>
                  <dd className="text-right font-medium text-fg">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs leading-relaxed text-fg-muted">
              Pix, cartão ou boleto no Mercado Pago. Depois que o pagamento
              for aprovado, você cai no WhatsApp da equipe com a comprovação.
            </p>
            {payError && (
              <div className="rounded-[var(--radius-md)] border border-brand-red/40 bg-brand-red-soft px-4 py-3 text-sm text-fg">
                {payError}
              </div>
            )}
          </div>
        )}

        {screen === "fail" && (
          <div className="space-y-4 text-center">
            <XCircle className="mx-auto size-10 text-brand-red" />
            <p className="font-display text-xl font-extrabold text-fg">
              Esta matrícula é para quem já pode investir
            </p>
            <p className="text-sm leading-relaxed text-fg-muted">
              O curso tem valor definido (
              {COURSE_SELF.planLabel} ou {COURSE_LIVE.planLabel}). Quando você
              tiver o investimento e quiser começar, volte nesta página e
              preencha de novo.
            </p>
            <p className="text-xs text-fg-subtle">
              Não enviamos sua ficha para a equipe neste momento.
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-5 py-4 sm:px-6">
        <div className="flex gap-2">
          {(screen === "commit" || screen === "contact" || screen === "pay") && (
            <button
              type="button"
              onClick={() =>
                setScreen(
                  screen === "pay"
                    ? "contact"
                    : screen === "contact"
                      ? "commit"
                      : "gate",
                )
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border px-4 text-sm font-semibold text-fg-muted hover:bg-white/5 hover:text-fg"
            >
              <ArrowLeft className="size-4" />
              Voltar
            </button>
          )}

          {screen === "gate" && (
            <button
              type="button"
              onClick={goGateNext}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red px-5 text-sm font-bold uppercase tracking-[0.04em] text-white shadow-[0_10px_28px_rgba(225,29,46,0.3)] hover:brightness-110"
            >
              Continuar
              <ArrowRight className="size-4" />
            </button>
          )}
          {screen === "commit" && (
            <button
              type="button"
              onClick={goCommitNext}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red px-5 text-sm font-bold uppercase tracking-[0.04em] text-white shadow-[0_10px_28px_rgba(225,29,46,0.3)] hover:brightness-110"
            >
              Continuar
              <ArrowRight className="size-4" />
            </button>
          )}
          {screen === "contact" && (
            <button
              type="button"
              onClick={goContactNext}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red px-5 text-sm font-bold uppercase tracking-[0.04em] text-white shadow-[0_10px_28px_rgba(225,29,46,0.3)] hover:brightness-110"
            >
              Ir para o pagamento
              <ArrowRight className="size-4" />
            </button>
          )}
          {screen === "pay" && (
            <button
              type="button"
              onClick={() => void startCheckout()}
              disabled={sending}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red px-5 text-sm font-bold uppercase tracking-[0.04em] text-white shadow-[0_10px_28px_rgba(225,29,46,0.3)] hover:brightness-110 disabled:opacity-70"
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CreditCard className="size-5" />
              )}
              Pagar no Mercado Pago
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
