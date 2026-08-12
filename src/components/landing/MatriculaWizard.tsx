import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, CreditCard, Loader2 } from "lucide-react";
import { COURSE_LIVE, COURSE_SELF } from "@/lib/config";
import { createMpCheckout } from "@/lib/mp-server";
import {
  emptyContract,
  formatCep,
  formatCpf,
  isCpfValid,
  lookupCep,
  newLeadId,
  paymentOptions,
  saveLead,
  selectedOffer,
  type ContractAnswers,
} from "@/lib/mp";
import { formatPhoneInput, isEmailValid, isPhoneValid } from "@/lib/qualify";
import type { StrictMeta } from "@/lib/strict-qualify";
import { cn } from "@/lib/utils";

type Screen = "offer" | "contract" | "pay";

const UF = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

function Field({
  label,
  children,
  error,
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  error?: string;
  htmlFor?: string;
}) {
  return (
    <div className="block">
      <div className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-fg-subtle">
        {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : <span>{label}</span>}
      </div>
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
  const [screen, setScreen] = useState<Screen>("offer");
  const [answers, setAnswers] = useState<ContractAnswers>(emptyContract);
  const [errors, setErrors] = useState<Partial<Record<keyof ContractAnswers, string>>>({});
  const [sending, setSending] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  const plans = paymentOptions(answers.modality);
  const offer = selectedOffer(answers);

  const progress = useMemo(() => {
    if (screen === "offer") return 33;
    if (screen === "contract") return 66;
    return 92;
  }, [screen]);

  const set =
    (key: keyof ContractAnswers) =>
    (value: string) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  async function onCep(value: string) {
    const formatted = formatCep(value);
    set("cep")(formatted);
    if (formatted.replace(/\D/g, "").length !== 8) return;
    setCepLoading(true);
    const found = await lookupCep(formatted);
    setCepLoading(false);
    if (!found) return;
    setAnswers((prev) => ({
      ...prev,
      cep: formatted,
      street: found.street || prev.street,
      neighborhood: found.neighborhood || prev.neighborhood,
      city: found.city || prev.city,
      state: found.state || prev.state,
    }));
  }

  function goOfferNext() {
    const e: Partial<Record<keyof ContractAnswers, string>> = {};
    if (!answers.modality) e.modality = "Escolha a formação";
    if (!answers.plan) e.plan = "Escolha à vista ou parcelado";
    setErrors(e);
    if (Object.keys(e).length) return;
    setScreen("contract");
  }

  function goContractNext() {
    const e: Partial<Record<keyof ContractAnswers, string>> = {};
    if (answers.name.trim().length < 5) e.name = "Informe o nome completo";
    if (!isCpfValid(answers.cpf)) e.cpf = "CPF inválido";
    if (answers.rg.trim().length < 4) e.rg = "Informe o RG";
    if (!answers.birthDate) e.birthDate = "Informe a data de nascimento";
    if (!isEmailValid(answers.email)) e.email = "E-mail inválido";
    if (!isPhoneValid(answers.phone)) e.phone = "WhatsApp com DDD";
    if (answers.cep.replace(/\D/g, "").length !== 8) e.cep = "CEP inválido";
    if (answers.street.trim().length < 2) e.street = "Informe o endereço";
    if (!answers.number.trim()) e.number = "Número";
    if (answers.neighborhood.trim().length < 2) e.neighborhood = "Bairro";
    if (answers.city.trim().length < 2) e.city = "Cidade";
    if (!answers.state) e.state = "UF";
    setErrors(e);
    if (Object.keys(e).length) return;
    setScreen("pay");
  }

  async function startCheckout() {
    setSending(true);
    setPayError(null);
    const leadId = newLeadId();
    saveLead({
      ...answers,
      id: leadId,
      meta: fichaMeta,
      amount: offer.amount,
      installments: offer.installments,
      courseTitle: offer.title,
      planLabel: offer.planLabel,
    });
    try {
      const res = await createMpCheckout({
        data: {
          name: answers.name,
          email: answers.email,
          phone: answers.phone,
          cpf: answers.cpf,
          city: answers.city,
          street: answers.street,
          number: answers.number,
          zip: answers.cep,
          modality: answers.modality === "live" ? "live" : "self",
          plan: answers.plan || "cash",
          amount: offer.amount,
          installments: offer.installments,
          title: offer.title,
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
    screen === "offer"
      ? "Curso e pagamento"
      : screen === "contract"
        ? "Dados para o contrato"
        : "Revisar e pagar";

  const hint =
    screen === "offer"
      ? "À vista ou parcelado, como no anúncio"
      : screen === "contract"
        ? "Esses dados entram no contrato de matrícula"
        : "Pagamento seguro no Mercado Pago";

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
        {screen === "offer" && (
          <div className="space-y-5">
            <Field label="Qual formação você quer?" error={errors.modality}>
              <div className="grid gap-2">
                {(
                  [
                    {
                      id: "self" as const,
                      t: COURSE_SELF.shortName,
                      d: COURSE_SELF.planLabel,
                    },
                    {
                      id: "live" as const,
                      t: COURSE_LIVE.shortName,
                      d: COURSE_LIVE.planLabel,
                    },
                  ] as const
                ).map((c) => {
                  const active = answers.modality === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setAnswers((prev) => ({
                          ...prev,
                          modality: c.id,
                          plan: "",
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          modality: undefined,
                          plan: undefined,
                        }));
                      }}
                      className={cn(
                        "rounded-[var(--radius-md)] border px-4 py-3.5 text-left transition-all",
                        active
                          ? "border-brand-red bg-brand-red-soft text-fg"
                          : "border-border bg-bg-elevated/50 text-fg-muted hover:text-fg",
                      )}
                    >
                      <p className="text-sm font-bold">{c.t}</p>
                      <p className="mt-0.5 text-xs opacity-80">{c.d}</p>
                    </button>
                  );
                })}
              </div>
            </Field>

            {answers.modality && (
              <Field label="Como você quer pagar?" error={errors.plan}>
                <div className="grid gap-2">
                  {plans.map((p) => {
                    const active = answers.plan === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => set("plan")(p.id)}
                        className={cn(
                          "rounded-[var(--radius-md)] border px-4 py-3.5 text-left transition-all",
                          active
                            ? "border-brand-red bg-brand-red-soft text-fg"
                            : "border-border bg-bg-elevated/50 text-fg-muted hover:text-fg",
                        )}
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-sm font-bold">{p.label}</p>
                          <p className="text-xs font-semibold">{p.amountLabel}</p>
                        </div>
                        <p className="mt-0.5 text-xs opacity-80">{p.detail}</p>
                      </button>
                    );
                  })}
                </div>
              </Field>
            )}
          </div>
        )}

        {screen === "contract" && (
          <div className="space-y-4">
            <Field label="Nome completo" error={errors.name} htmlFor="m-name">
              <input
                id="m-name"
                className={inputClass}
                value={answers.name}
                onChange={(e) => set("name")(e.target.value)}
                placeholder="Como no documento"
                autoComplete="name"
                autoFocus
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CPF" error={errors.cpf} htmlFor="m-cpf">
                <input
                  id="m-cpf"
                  className={inputClass}
                  value={answers.cpf}
                  onChange={(e) => set("cpf")(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                />
              </Field>
              <Field label="RG" error={errors.rg} htmlFor="m-rg">
                <input
                  id="m-rg"
                  className={inputClass}
                  value={answers.rg}
                  onChange={(e) => set("rg")(e.target.value)}
                  placeholder="Documento de identidade"
                />
              </Field>
            </div>
            <Field
              label="Data de nascimento"
              error={errors.birthDate}
              htmlFor="m-birth"
            >
              <input
                id="m-birth"
                type="date"
                className={inputClass}
                value={answers.birthDate}
                onChange={(e) => set("birthDate")(e.target.value)}
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
            <Field label="CEP" error={errors.cep} htmlFor="m-cep">
              <input
                id="m-cep"
                className={inputClass}
                value={answers.cep}
                onChange={(e) => void onCep(e.target.value)}
                placeholder="00000-000"
                inputMode="numeric"
              />
              {cepLoading && (
                <span className="mt-1 block text-xs text-fg-subtle">
                  Buscando endereço…
                </span>
              )}
            </Field>
            <Field label="Endereço" error={errors.street} htmlFor="m-street">
              <input
                id="m-street"
                className={inputClass}
                value={answers.street}
                onChange={(e) => set("street")(e.target.value)}
                placeholder="Rua / avenida"
                autoComplete="address-line1"
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Nº" error={errors.number} htmlFor="m-num">
                <input
                  id="m-num"
                  className={inputClass}
                  value={answers.number}
                  onChange={(e) => set("number")(e.target.value)}
                  placeholder="123"
                />
              </Field>
              <div className="col-span-2">
                <Field label="Complemento" htmlFor="m-comp">
                  <input
                    id="m-comp"
                    className={inputClass}
                    value={answers.complement}
                    onChange={(e) => set("complement")(e.target.value)}
                    placeholder="Apto, bloco"
                  />
                </Field>
              </div>
            </div>
            <Field label="Bairro" error={errors.neighborhood} htmlFor="m-bairro">
              <input
                id="m-bairro"
                className={inputClass}
                value={answers.neighborhood}
                onChange={(e) => set("neighborhood")(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Field label="Cidade" error={errors.city} htmlFor="m-city">
                  <input
                    id="m-city"
                    className={inputClass}
                    value={answers.city}
                    onChange={(e) => set("city")(e.target.value)}
                    autoComplete="address-level2"
                  />
                </Field>
              </div>
              <Field label="UF" error={errors.state} htmlFor="m-uf">
                <select
                  id="m-uf"
                  className={inputClass}
                  value={answers.state}
                  onChange={(e) => set("state")(e.target.value)}
                >
                  <option value="">UF</option>
                  {UF.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        )}

        {screen === "pay" && (
          <div className="space-y-5">
            <div className="rounded-[var(--radius-xl)] border border-gold-line/40 bg-gold-line/10 p-5 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-line">
                {offer.shortName}
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold text-fg">
                {offer.planLabel}
              </p>
              <p className="mt-1 text-sm text-fg-muted">{offer.planDetail}</p>
            </div>
            <dl className="space-y-2 text-sm">
              {[
                ["Nome", answers.name],
                ["CPF", answers.cpf],
                ["E-mail", answers.email],
                ["WhatsApp", answers.phone],
                [
                  "Endereço",
                  `${answers.street}, ${answers.number} — ${answers.city}/${answers.state}`,
                ],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="shrink-0 text-fg-subtle">{k}</dt>
                  <dd className="text-right font-medium text-fg">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs leading-relaxed text-fg-muted">
              Ao pagar, você confirma os dados para o contrato de matrícula.
              Depois da confirmação a equipe libera o acesso.
            </p>
            {payError && (
              <div className="rounded-[var(--radius-md)] border border-brand-red/40 bg-brand-red-soft px-4 py-3 text-sm text-fg">
                {payError}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-5 py-4 sm:px-6">
        <div className="flex gap-2">
          {(screen === "contract" || screen === "pay") && (
            <button
              type="button"
              onClick={() => setScreen(screen === "pay" ? "contract" : "offer")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border px-4 text-sm font-semibold text-fg-muted hover:bg-white/5 hover:text-fg"
            >
              <ArrowLeft className="size-4" />
              Voltar
            </button>
          )}
          {screen === "offer" && (
            <button
              type="button"
              onClick={goOfferNext}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red px-5 text-sm font-bold uppercase tracking-[0.04em] text-white shadow-[0_10px_28px_rgba(225,29,46,0.3)] hover:brightness-110"
            >
              Continuar
              <ArrowRight className="size-4" />
            </button>
          )}
          {screen === "contract" && (
            <button
              type="button"
              onClick={goContractNext}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red px-5 text-sm font-bold uppercase tracking-[0.04em] text-white shadow-[0_10px_28px_rgba(225,29,46,0.3)] hover:brightness-110"
            >
              Revisar matrícula
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
              Pagar {offer.planLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
