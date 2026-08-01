import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import {
  AGE_OPTIONS,
  AVAILABILITY_OPTIONS,
  EDUCATION_OPTIONS,
  ENGLISH_OPTIONS,
  INVESTMENT_OPTIONS,
  MODALITY_OPTIONS,
  MOTIVATION_OPTIONS,
  buildWhatsAppFicha,
  emptyAnswers,
  evaluateLead,
  formatPhoneInput,
  isEmailValid,
  isPhoneValid,
  openWhatsAppWithFicha,
  submitLeadEmail,
  type QualifyAnswers,
  type QualifyMeta,
  type QualifyResult,
} from "@/lib/qualify";
import { COURSE_LIVE, COURSE_SELF, WHATSAPP_NUMBER } from "@/lib/config";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "profile", title: "Sobre você", hint: "Dados básicos para a ficha" },
  {
    id: "fit",
    title: "Modalidade e perfil",
    hint: "Escolha como quer estudar",
  },
  { id: "commit", title: "Compromisso", hint: "Disponibilidade e investimento" },
  { id: "result", title: "Resultado", hint: "Sua ficha pronta para o WhatsApp" },
] as const;

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

export type QualifyWizardProps = {
  meta?: QualifyMeta;
  source?: string;
  onSent?: () => void;
  idPrefix?: string;
  className?: string;
};

export function QualifyWizard({
  meta,
  source = "site",
  onSent,
  idPrefix = "q",
  className,
}: QualifyWizardProps) {
  const fichaMeta: QualifyMeta = { source, ...meta };

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QualifyAnswers>(emptyAnswers);
  const [errors, setErrors] = useState<
    Partial<Record<keyof QualifyAnswers, string>>
  >({});
  const [result, setResult] = useState<QualifyResult | null>(null);
  const [sending, setSending] = useState(false);
  const [sentFallback, setSentFallback] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  const set =
    (key: keyof QualifyAnswers) =>
    (value: string) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  function validateStep(i: number): boolean {
    const e: Partial<Record<keyof QualifyAnswers, string>> = {};

    if (i === 0) {
      if (answers.name.trim().length < 2) e.name = "Informe seu nome completo";
      if (!isEmailValid(answers.email)) e.email = "Informe um e-mail válido";
      if (!isPhoneValid(answers.phone))
        e.phone = "WhatsApp válido com DDD (mín. 10 dígitos)";
      if (answers.city.trim().length < 2) e.city = "Informe sua cidade";
      if (!answers.age) e.age = "Selecione sua faixa etária";
    }

    if (i === 1) {
      if (!answers.modality) e.modality = "Escolha a modalidade";
      if (!answers.english) e.english = "Selecione uma opção";
      if (!answers.education) e.education = "Selecione sua escolaridade";
      if (!answers.motivation) e.motivation = "Selecione o que mais te motiva";
    }

    if (i === 2) {
      if (!answers.availability)
        e.availability = "Selecione sua disponibilidade";
      if (!answers.investment)
        e.investment = "Selecione sua condição de investimento";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function goNext() {
    if (!validateStep(step)) return;
    if (step === 2) {
      const r = evaluateLead(answers);
      setResult(r);
      setStep(3);
      // Envia o lead por e-mail assim que a ficha é concluída
      setSending(true);
      setEmailError(null);
      try {
        const mail = await submitLeadEmail(answers, r, fichaMeta);
        if (mail.ok) setEmailSent(true);
        else setEmailError(mail.error || "Não foi possível enviar o e-mail");
      } finally {
        setSending(false);
      }
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function sendToWhatsApp() {
    if (!result) return;
    setSending(true);
    setEmailError(null);
    try {
      // Garante o e-mail se ainda não foi
      if (!emailSent) {
        const mail = await submitLeadEmail(answers, result, fichaMeta);
        if (mail.ok) setEmailSent(true);
        else setEmailError(mail.error || "Falha ao enviar e-mail");
      }
      const { ok } = openWhatsAppWithFicha(answers, result, fichaMeta);
      if (!ok) {
        setSentFallback(true);
        const text = buildWhatsAppFicha(answers, result, fichaMeta);
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          /* ignore */
        }
      } else {
        onSent?.();
      }
    } finally {
      setSending(false);
    }
  }

  const stepMeta = STEPS[step]!;
  const investHint =
    answers.modality === "live"
      ? `${COURSE_LIVE.planLabel} (total ${COURSE_LIVE.priceLabel})`
      : answers.modality === "self"
        ? `${COURSE_SELF.planLabel} (total ${COURSE_SELF.priceLabel})`
        : "conforme a modalidade escolhida";

  return (
    <div
      className={cn(
        "flex max-h-[min(92dvh,760px)] w-full flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-bg-elevated shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div className="shrink-0 border-b border-border px-5 pb-4 pt-5 sm:px-6">
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-line">
            Qualificação de vaga
          </p>
          <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-fg">
            {stepMeta.title}
          </h2>
          <p className="mt-0.5 text-sm text-fg-muted">{stepMeta.hint}</p>
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-brand-red transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
          Etapa {step + 1} de {STEPS.length}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {step === 0 && (
          <div className="space-y-4">
            <Field
              label="Nome completo"
              error={errors.name}
              htmlFor={`${idPrefix}-name`}
            >
              <input
                id={`${idPrefix}-name`}
                className={inputClass}
                value={answers.name}
                onChange={(e) => set("name")(e.target.value)}
                placeholder="Como devemos te chamar"
                autoComplete="name"
                autoFocus
              />
            </Field>
            <Field
              label="E-mail"
              error={errors.email}
              htmlFor={`${idPrefix}-email`}
            >
              <input
                id={`${idPrefix}-email`}
                type="email"
                className={inputClass}
                value={answers.email}
                onChange={(e) => set("email")(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                inputMode="email"
              />
            </Field>
            <Field
              label="Seu WhatsApp"
              error={errors.phone}
              htmlFor={`${idPrefix}-phone`}
            >
              <input
                id={`${idPrefix}-phone`}
                className={inputClass}
                value={answers.phone}
                onChange={(e) => set("phone")(formatPhoneInput(e.target.value))}
                placeholder="(71) 99999-9999"
                inputMode="tel"
                autoComplete="tel"
              />
            </Field>
            <Field
              label="Cidade"
              error={errors.city}
              htmlFor={`${idPrefix}-city`}
            >
              <input
                id={`${idPrefix}-city`}
                className={inputClass}
                value={answers.city}
                onChange={(e) => set("city")(e.target.value)}
                placeholder="Ex.: São Paulo, SP"
                autoComplete="address-level2"
              />
            </Field>
            <Field label="Faixa etária" error={errors.age}>
              <OptionGrid
                name="Faixa etária"
                options={AGE_OPTIONS}
                value={answers.age}
                onChange={set("age")}
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <Field
              label="Qual modalidade você prefere?"
              error={errors.modality}
            >
              <OptionGrid
                name="Modalidade"
                options={MODALITY_OPTIONS}
                value={answers.modality}
                onChange={set("modality")}
              />
            </Field>
            <Field
              label="Você fala inglês?"
              error={errors.english}
              hint="Não é obrigatório para a formação. Só usamos para conhecer seu perfil."
            >
              <OptionGrid
                name="Inglês"
                options={ENGLISH_OPTIONS}
                value={answers.english}
                onChange={set("english")}
              />
            </Field>
            <Field label="Escolaridade" error={errors.education}>
              <OptionGrid
                name="Escolaridade"
                options={EDUCATION_OPTIONS}
                value={answers.education}
                onChange={set("education")}
              />
            </Field>
            <Field label="O que mais te motiva?" error={errors.motivation}>
              <OptionGrid
                name="Motivação"
                options={MOTIVATION_OPTIONS}
                value={answers.motivation}
                onChange={set("motivation")}
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field
              label="Horas por semana para a formação"
              error={errors.availability}
            >
              <OptionGrid
                name="Disponibilidade"
                options={AVAILABILITY_OPTIONS}
                value={answers.availability}
                onChange={set("availability")}
              />
            </Field>
            <Field
              label={`Consegue investir ${investHint}?`}
              error={errors.investment}
            >
              <OptionGrid
                name="Investimento"
                options={INVESTMENT_OPTIONS}
                value={answers.investment}
                onChange={set("investment")}
              />
            </Field>
            <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border bg-bg/60 px-4 py-3 text-xs leading-relaxed text-fg-muted">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-wa" />
              Suas respostas montam a ficha e chegam por e-mail à equipe. Em
              seguida você pode abrir o WhatsApp com tudo pronto.
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="space-y-5">
            <div
              className={cn(
                "rounded-[var(--radius-xl)] border p-5 text-center",
                result.status === "qualified" && "border-wa/40 bg-wa/10",
                result.status === "review" &&
                  "border-gold-line/40 bg-gold-line/10",
                result.status === "unqualified" &&
                  "border-brand-red/40 bg-brand-red-soft",
              )}
            >
              <CheckCircle2
                className={cn(
                  "mx-auto size-10",
                  result.status === "qualified" && "text-wa",
                  result.status === "review" && "text-gold-line",
                  result.status === "unqualified" && "text-brand-red",
                )}
              />
              <p className="mt-3 font-display text-xl font-extrabold text-fg">
                {result.status === "qualified" &&
                  "Perfil alinhado com a formação"}
                {result.status === "review" &&
                  "Ficha pronta para análise da equipe"}
                {result.status === "unqualified" && "Vamos avaliar com o time"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                Encaminhe a ficha no WhatsApp para a equipe confirmar a
                modalidade e a matrícula.
              </p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-fg-subtle">
                Status: {result.label} | Score {result.score}/100
              </p>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-border bg-bg/50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-fg-subtle">
                Resumo da ficha
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                {[
                  ["Nome", answers.name],
                  ["E-mail", answers.email],
                  ["WhatsApp", answers.phone],
                  ["Cidade", answers.city],
                  [
                    "Modalidade",
                    answers.modality === "live"
                      ? COURSE_LIVE.shortName
                      : answers.modality === "self"
                        ? COURSE_SELF.shortName
                        : "Não informada",
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-fg-subtle">{k}</dt>
                    <dd className="text-right font-medium text-fg">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {emailSent && (
              <div className="rounded-[var(--radius-md)] border border-wa/30 bg-wa/10 px-4 py-3 text-sm text-fg">
                Lead enviado por e-mail para a equipe. Agora abra o WhatsApp
                para falar com o time.
              </div>
            )}
            {emailError && (
              <div className="rounded-[var(--radius-md)] border border-gold-line/40 bg-gold-line/10 px-4 py-3 text-sm text-fg">
                Não foi possível confirmar o e-mail agora. Você ainda pode
                seguir no WhatsApp.
              </div>
            )}

            {sentFallback && (
              <div className="rounded-[var(--radius-md)] border border-gold-line/40 bg-gold-line/10 px-4 py-3 text-sm text-fg">
                Número do WhatsApp da equipe ainda não configurado. A ficha foi
                copiada. Cole no WhatsApp quando o número estiver ativo.
                {!WHATSAPP_NUMBER && (
                  <span className="mt-1 block text-xs text-fg-muted">
                    (Configure o número em um único lugar quando estiver
                    pronto.)
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-5 py-4 sm:px-6">
        <div className="flex gap-2">
          {step > 0 && step < 3 && (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border px-4 text-sm font-semibold text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
            >
              <ArrowLeft className="size-4" />
              Voltar
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => void goNext()}
              disabled={sending}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red px-5 text-sm font-bold uppercase tracking-[0.04em] text-white shadow-[0_10px_28px_rgba(225,29,46,0.3)] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Continuar
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void sendToWhatsApp()}
              disabled={sending}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-wa px-5 text-sm font-bold uppercase tracking-[0.04em] text-white shadow-[0_12px_32px_rgba(34,163,90,0.35)] transition-all hover:bg-wa-hover active:scale-[0.98] disabled:opacity-70"
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MessageCircle className="size-5" />
              )}
              Enviar ficha no WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
