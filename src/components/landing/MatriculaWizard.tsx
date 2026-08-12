import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { COURSE_LIVE, COURSE_SELF } from "@/lib/config";
import { CheckoutPay } from "@/components/landing/CheckoutPay";
import {
  emptyContract,
  formatBirthDate,
  formatCep,
  formatCpf,
  birthError,
  cpfError,
  lookupCep,
  newLeadId,
  paymentOptions,
  saveLead,
  selectedOffer,
  type ContractAnswers,
  type StoredLead,
} from "@/lib/mp";
import { formatPhoneInput, isEmailValid, phoneError } from "@/lib/qualify";
import {
  openPaidWhatsApp,
  submitPaidEmail,
  type StrictMeta,
} from "@/lib/strict-qualify";
import { cn } from "@/lib/utils";

type Screen = "offer" | "contract" | "pay" | "done";

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
  const [cepLoading, setCepLoading] = useState(false);
  const [lead, setLead] = useState<StoredLead | null>(null);

  const plans = paymentOptions(answers.modality);
  const offer = selectedOffer(answers);

  const progress = useMemo(() => {
    if (screen === "offer") return 30;
    if (screen === "contract") return 60;
    if (screen === "pay") return 85;
    return 100;
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
    const cpfMsg = cpfError(answers.cpf);
    if (cpfMsg) e.cpf = cpfMsg;
    if (answers.rg.trim().length < 4) e.rg = "Informe o RG";
    const birthMsg = birthError(answers.birthDate);
    if (birthMsg) e.birthDate = birthMsg;
    if (!isEmailValid(answers.email)) e.email = "E-mail inválido";
    const phoneMsg = phoneError(answers.phone);
    if (phoneMsg) e.phone = phoneMsg;
    if (answers.cep.replace(/\D/g, "").length !== 8) e.cep = "CEP inválido";
    if (answers.street.trim().length < 2) e.street = "Informe o endereço";
    if (!answers.number.trim()) e.number = "Número";
    if (answers.city.trim().length < 2) e.city = "Cidade";
    if (!answers.state) e.state = "UF";
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      const ids: Record<string, string> = {
        name: "m-name",
        cpf: "m-cpf",
        rg: "m-rg",
        birthDate: "m-birth",
        email: "m-email",
        phone: "m-phone",
        cep: "m-cep",
        street: "m-street",
        number: "m-num",
        city: "m-city",
        state: "m-uf",
      };
      requestAnimationFrame(() => {
        document.getElementById(ids[first] || "m-name")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
      return;
    }
    const next: StoredLead = {
      ...answers,
      id: newLeadId(),
      meta: fichaMeta,
      amount: offer.amount,
      installments: offer.installments,
      courseTitle: offer.title,
      planLabel: offer.planLabel,
    };
    saveLead(next);
    setLead(next);
    setScreen("pay");
  }

  const onPaid = useCallback(
    (paymentId: string, amount: number) => {
      setLead((current) => {
        if (!current) return current;
        const payment = { paymentId, amount, status: "approved" };
        void submitPaidEmail(current, payment, current.meta);
        openPaidWhatsApp(current, payment, current.meta);
        return current;
      });
      setScreen("done");
    },
    [],
  );

  const title =
    screen === "offer"
      ? "Curso e pagamento"
      : screen === "contract"
        ? "Dados para o contrato"
        : screen === "pay"
          ? "Pagamento"
          : "Matrícula confirmada";

  const hint =
    screen === "offer"
      ? "À vista ou parcelado, como no anúncio"
      : screen === "contract"
        ? "Esses dados entram no contrato de matrícula"
        : screen === "pay"
          ? "Pix, cartão ou boleto aqui mesmo"
          : "Acesso em liberação";

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
                  onChange={(e) => {
                    const v = formatCpf(e.target.value);
                    set("cpf")(v);
                    if (v.replace(/\D/g, "").length === 11) {
                      setErrors((prev) => ({ ...prev, cpf: cpfError(v) || undefined }));
                    }
                  }}
                  onBlur={() =>
                    setErrors((prev) => ({
                      ...prev,
                      cpf: cpfError(answers.cpf) || undefined,
                    }))
                  }
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
                className={inputClass}
                value={answers.birthDate}
                onChange={(e) => set("birthDate")(formatBirthDate(e.target.value))}
                placeholder="00/00/0000"
                inputMode="numeric"
                autoComplete="bday"
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
            <Field label="Celular com DDD" error={errors.phone} htmlFor="m-phone">
              <input
                id="m-phone"
                className={inputClass}
                value={answers.phone}
                onChange={(e) => {
                  const v = formatPhoneInput(e.target.value);
                  set("phone")(v);
                  if (v.replace(/\D/g, "").length >= 11) {
                    setErrors((prev) => ({
                      ...prev,
                      phone: phoneError(v) || undefined,
                    }));
                  }
                }}
                onBlur={() =>
                  setErrors((prev) => ({
                    ...prev,
                    phone: phoneError(answers.phone) || undefined,
                  }))
                }
                placeholder="(11) 98765-4321"
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

        {screen === "pay" && lead && (
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
            <p className="text-xs text-fg-muted">
              {answers.name} · {answers.cpf}
            </p>
            <CheckoutPay lead={lead} onPaid={onPaid} />
          </div>
        )}

        {screen === "done" && (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto size-12 text-wa" />
            <p className="font-display text-xl font-extrabold text-fg">
              Pagamento confirmado
            </p>
            <p className="text-sm leading-relaxed text-fg-muted">
              A equipe já recebeu os dados do contrato. Se o WhatsApp não
              abriu, use o botão abaixo.
            </p>
            <button
              type="button"
              onClick={() => {
                if (!lead) return;
                openPaidWhatsApp(
                  lead,
                  {
                    paymentId: "aprovado",
                    amount: lead.amount,
                    status: "approved",
                  },
                  lead.meta,
                );
              }}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-wa text-sm font-bold uppercase tracking-[0.04em] text-white"
            >
              <MessageCircle className="size-5" />
              Abrir WhatsApp
            </button>
          </div>
        )}
      </div>

      {screen !== "done" && (
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
            <div className="w-full space-y-2">
              {Object.values(errors).filter(Boolean).length > 0 && (
                <p className="text-center text-xs font-medium text-brand-red">
                  Confira os campos em vermelho para seguir ao pagamento.
                </p>
              )}
              <button
                type="button"
                onClick={goContractNext}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red px-5 text-sm font-bold uppercase tracking-[0.04em] text-white shadow-[0_10px_28px_rgba(225,29,46,0.3)] hover:brightness-110"
              >
                Ir para o pagamento
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
