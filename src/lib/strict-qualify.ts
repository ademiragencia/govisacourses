import {
  BRAND,
  COURSE_LIVE,
  COURSE_SELF,
  COURSES,
  WEB3FORMS_ACCESS_KEY,
  WEB3FORMS_ENDPOINT,
  getWhatsAppUrl,
  type CourseId,
} from "./config";
import { formatPhoneInput, isEmailValid, isPhoneValid } from "./qualify";

export { formatPhoneInput, isEmailValid, isPhoneValid };

export type StrictAnswers = {
  money: string;
  modality: CourseId | "";
  decision: string;
  availability: string;
  motivation: string;
  name: string;
  email: string;
  phone: string;
  city: string;
};

export type StrictStatus = "qualified" | "unqualified";

export type StrictResult = {
  status: StrictStatus;
  reasons: string[];
  label: string;
};

export type StrictMeta = {
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

export const MONEY_OPTIONS = [
  {
    value: "now",
    label: "Quero garantir minha vaga agora",
  },
  {
    value: "week",
    label: "Quero concluir ainda esta semana",
  },
  {
    value: "month",
    label: "Prefiro começar no próximo mês",
  },
  {
    value: "no",
    label: "Quero me informar melhor antes",
  },
] as const;

export const STRICT_MODALITY_OPTIONS = [
  {
    value: "self",
    label: `${COURSE_SELF.shortName} — ${COURSE_SELF.planLabel}`,
  },
  {
    value: "live",
    label: `${COURSE_LIVE.shortName} — ${COURSE_LIVE.planLabel}`,
  },
] as const;

export const DECISION_OPTIONS = [
  { value: "self", label: "Eu mesmo concluo a matrícula" },
  {
    value: "partner",
    label: "Vou alinhar com alguém e já finalizo",
  },
  {
    value: "loan",
    label: "Quero ver isso com mais calma depois",
  },
] as const;

export const STRICT_AVAILABILITY_OPTIONS = [
  { value: "high", label: "Mais de 10h por semana" },
  { value: "mid", label: "5 a 10h por semana" },
  { value: "low", label: "Menos de 5h por semana" },
] as const;

export const STRICT_MOTIVATION_OPTIONS = [
  {
    value: "hire",
    label: "Quero a formação e crescer com o mercado americano",
  },
  { value: "career", label: "Quero me profissionalizar em imigração agora" },
  { value: "explore", label: "Ainda estou conhecendo o curso" },
] as const;

export function emptyStrictAnswers(): StrictAnswers {
  return {
    money: "",
    modality: "",
    decision: "",
    availability: "",
    motivation: "",
    name: "",
    email: "",
    phone: "",
    city: "",
  };
}

function labelOf(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function isHardMoneyFail(money: string): boolean {
  return money === "no" || money === "month";
}

export function evaluateStrict(a: StrictAnswers): StrictResult {
  const reasons: string[] = [];

  if (a.money === "no") reasons.push("Sem valor disponível agora");
  if (a.money === "month") reasons.push("Só consegue pagar no próximo mês");
  if (a.decision === "loan")
    reasons.push("Depende de empréstimo ou liberação de terceiro");
  if (a.availability === "low")
    reasons.push("Menos de 5h por semana para estudar");
  if (a.motivation === "explore")
    reasons.push("Ainda só conhecendo, sem decisão de matrícula");

  const moneyOk = a.money === "now" || a.money === "week";
  const serious = a.motivation === "hire" || a.motivation === "career";
  const timeOk = a.availability === "mid" || a.availability === "high";
  const decisionOk = a.decision === "self" || a.decision === "partner";

  const status: StrictStatus =
    moneyOk && serious && timeOk && decisionOk && !isHardMoneyFail(a.money)
      ? "qualified"
      : "unqualified";

  return {
    status,
    reasons,
    label: status === "qualified" ? "MATRÍCULA QUALIFICADA" : "NÃO QUALIFICADO",
  };
}

function sourceLabel(meta: StrictMeta): string {
  return meta.source === "ads-matricula" || meta.source === "ads"
    ? "ANÚNCIO / Matrícula"
    : meta.source || "Matrícula";
}

export function buildPaidWhatsApp(
  a: {
    name: string;
    email: string;
    phone: string;
    city: string;
    modality: string;
    cpf?: string;
    rg?: string;
    birthDate?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    state?: string;
    cep?: string;
    planLabel?: string;
  },
  payment: { paymentId: string; amount: number; status: string },
  meta: StrictMeta = {},
): string {
  const course =
    a.modality === "live" || a.modality === "self"
      ? COURSES[a.modality]
      : null;
  const address = [a.street, a.number, a.complement, a.neighborhood, a.city, a.state, a.cep]
    .filter(Boolean)
    .join(", ");

  return [
    `✅ *PAGAMENTO APROVADO — Contrato / Matrícula*`,
    `Status MP: *${payment.status}*`,
    `ID do pagamento: ${payment.paymentId}`,
    `Valor: R$ ${payment.amount.toFixed(2).replace(".", ",")}`,
    `Plano: ${a.planLabel || "-"}`,
    `Origem: *${sourceLabel(meta)}*`,
    "",
    `*Nome:* ${a.name.trim()}`,
    `*CPF:* ${a.cpf || "-"}`,
    `*RG:* ${a.rg || "-"}`,
    `*Nascimento:* ${a.birthDate || "-"}`,
    `*E-mail:* ${a.email.trim()}`,
    `*WhatsApp:* ${a.phone.trim()}`,
    `*Endereço:* ${address || a.city}`,
    `*Modalidade:* ${labelOf(STRICT_MODALITY_OPTIONS, a.modality)}`,
    course ? `*Oferta:* ${course.priceLabel} (${course.planLabel})` : "",
    "",
    `Paguei a matrícula. Seguem os dados para o contrato. Quero liberar o acesso.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildPaidEmail(
  a: {
    name: string;
    email: string;
    phone: string;
    city: string;
    modality: string;
    cpf?: string;
    rg?: string;
    birthDate?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    state?: string;
    cep?: string;
    planLabel?: string;
  },
  payment: { paymentId: string; amount: number; status: string },
  meta: StrictMeta = {},
): string {
  const course =
    a.modality === "live" || a.modality === "self"
      ? COURSES[a.modality]
      : null;
  const address = [a.street, a.number, a.complement, a.neighborhood, a.city, a.state, a.cep]
    .filter(Boolean)
    .join(", ");
  return [
    "PAGAMENTO APROVADO — Contrato / Matrícula",
    "========================================",
    `Status MP: ${payment.status}`,
    `Payment ID: ${payment.paymentId}`,
    `Valor: R$ ${payment.amount.toFixed(2)}`,
    `Plano: ${a.planLabel || "-"}`,
    `Origem: ${sourceLabel(meta)}`,
    "",
    "DADOS DO CONTRATO",
    `Nome: ${a.name.trim()}`,
    `CPF: ${a.cpf || "-"}`,
    `RG: ${a.rg || "-"}`,
    `Nascimento: ${a.birthDate || "-"}`,
    `E-mail: ${a.email.trim()}`,
    `WhatsApp: ${a.phone.trim()}`,
    `Endereço: ${address || a.city}`,
    `Modalidade: ${labelOf(STRICT_MODALITY_OPTIONS, a.modality)}`,
    course ? `Oferta: ${course.priceLabel}` : "",
    "",
    `Enviado em: ${new Date().toLocaleString("pt-BR")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function submitPaidEmail(
  a: Parameters<typeof buildPaidEmail>[0],
  payment: { paymentId: string; amount: number; status: string },
  meta: StrictMeta = {},
): Promise<{ ok: boolean }> {
  if (!WEB3FORMS_ACCESS_KEY) return { ok: false };
  const form = new FormData();
  form.append("access_key", WEB3FORMS_ACCESS_KEY);
  form.append(
    "subject",
    `[PAGO] ${a.name.trim()} — Matrícula ${payment.paymentId}`,
  );
  form.append("from_name", "Go Visa Courses · Pagamento");
  form.append("name", a.name.trim());
  form.append("email", a.email.trim());
  form.append("phone", a.phone.trim());
  form.append("payment_id", payment.paymentId);
  form.append("status", payment.status);
  form.append("message", buildPaidEmail(a, payment, meta));
  form.append("botcheck", "");
  try {
    const res = await fetch(WEB3FORMS_ENDPOINT, { method: "POST", body: form });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean };
    return { ok: Boolean(res.ok && data.success !== false) };
  } catch {
    return { ok: false };
  }
}

export function openPaidWhatsApp(
  a: Parameters<typeof buildPaidWhatsApp>[0],
  payment: { paymentId: string; amount: number; status: string },
  meta: StrictMeta = {},
): { ok: boolean } {
  const url = getWhatsAppUrl(buildPaidWhatsApp(a, payment, meta));
  if (!url) return { ok: false };
  window.open(url, "_blank", "noopener,noreferrer");
  return { ok: true };
}

export function buildStrictWhatsApp(
  a: StrictAnswers,
  result: StrictResult,
  meta: StrictMeta = {},
): string {
  const course =
    a.modality === "live" || a.modality === "self"
      ? COURSES[a.modality]
      : null;

  const lines = [
    `✅ *LEAD QUALIFICADO — Matrícula*`,
    `Status: *${result.label}*`,
    `Origem: *${sourceLabel(meta)}*`,
    `Filtro: passou em pagamento + compromisso com o curso`,
    "",
    `*Nome:* ${a.name.trim()}`,
    `*E-mail:* ${a.email.trim()}`,
    `*WhatsApp do lead:* ${a.phone.trim()}`,
    `*Cidade:* ${a.city.trim()}`,
    `*Quando paga:* ${labelOf(MONEY_OPTIONS, a.money)}`,
    `*Quem decide:* ${labelOf(DECISION_OPTIONS, a.decision)}`,
    `*Modalidade:* ${labelOf(STRICT_MODALITY_OPTIONS, a.modality)}`,
  ];

  if (course) {
    lines.push(
      `*Oferta:* ${course.priceLabel} (${course.planLabel})`,
      `*Início:* ${course.startLabel}`,
    );
  }

  lines.push(
    `*Disponibilidade:* ${labelOf(STRICT_AVAILABILITY_OPTIONS, a.availability)}`,
    `*Motivação:* ${labelOf(STRICT_MOTIVATION_OPTIONS, a.motivation)}`,
  );

  const utmBits = [
    meta.utm_source && `utm_source=${meta.utm_source}`,
    meta.utm_medium && `utm_medium=${meta.utm_medium}`,
    meta.utm_campaign && `utm_campaign=${meta.utm_campaign}`,
    meta.utm_content && `utm_content=${meta.utm_content}`,
    meta.utm_term && `utm_term=${meta.utm_term}`,
  ].filter(Boolean);
  if (utmBits.length) lines.push("", `*UTM:* ${utmBits.join(" | ")}`);

  lines.push(
    "",
    `Quero matricular na Formação em Processos Imigratórios da ${BRAND.firm}. Já tenho o investimento e quero fechar agora.`,
  );
  return lines.join("\n");
}

export function buildStrictEmail(
  a: StrictAnswers,
  result: StrictResult,
  meta: StrictMeta = {},
): string {
  const course =
    a.modality === "live" || a.modality === "self"
      ? COURSES[a.modality]
      : null;

  return [
    "LEAD QUALIFICADO — Matrícula do curso",
    "========================================",
    `Status: ${result.label}`,
    `Origem: ${sourceLabel(meta)}`,
    "",
    "CONTATO",
    `Nome: ${a.name.trim()}`,
    `E-mail: ${a.email.trim()}`,
    `WhatsApp: ${a.phone.trim()}`,
    `Cidade: ${a.city.trim()}`,
    "",
    "PAGAMENTO E CURSO",
    `Quando paga: ${labelOf(MONEY_OPTIONS, a.money)}`,
    `Decisão: ${labelOf(DECISION_OPTIONS, a.decision)}`,
    `Modalidade: ${labelOf(STRICT_MODALITY_OPTIONS, a.modality)}`,
    course ? `Oferta: ${course.priceLabel} (${course.planLabel})` : "",
    `Disponibilidade: ${labelOf(STRICT_AVAILABILITY_OPTIONS, a.availability)}`,
    `Motivação: ${labelOf(STRICT_MOTIVATION_OPTIONS, a.motivation)}`,
    "",
    "UTM",
    `utm_source: ${meta.utm_source || "-"}`,
    `utm_medium: ${meta.utm_medium || "-"}`,
    `utm_campaign: ${meta.utm_campaign || "-"}`,
    `utm_content: ${meta.utm_content || "-"}`,
    `utm_term: ${meta.utm_term || "-"}`,
    "",
    `Enviado em: ${new Date().toLocaleString("pt-BR")}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export async function submitStrictLeadEmail(
  a: StrictAnswers,
  result: StrictResult,
  meta: StrictMeta = {},
): Promise<{ ok: boolean; error?: string }> {
  if (!WEB3FORMS_ACCESS_KEY) return { ok: false, error: "access_key ausente" };

  const fields: Record<string, string> = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `[MATRÍCULA] ${a.name.trim()} — Go Visa Courses`,
    from_name: "Go Visa Courses · Matrícula",
    name: a.name.trim(),
    email: a.email.trim(),
    phone: a.phone.trim(),
    city: a.city.trim(),
    status: result.label,
    modality: labelOf(STRICT_MODALITY_OPTIONS, a.modality),
    money: labelOf(MONEY_OPTIONS, a.money),
    source: sourceLabel(meta),
    utm_source: meta.utm_source || "",
    utm_medium: meta.utm_medium || "",
    utm_campaign: meta.utm_campaign || "",
    message: buildStrictEmail(a, result, meta),
    botcheck: "",
  };

  try {
    const formData = new FormData();
    for (const [k, v] of Object.entries(fields)) formData.append(k, v);
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      body: formData,
    });
    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
    };
    if (res.ok && data.success !== false) return { ok: true };
  } catch {
    /* fallback */
  }

  return submitViaHiddenForm(fields);
}

function submitViaHiddenForm(
  fields: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve({ ok: false, error: "sem document" });
      return;
    }
    const iframeName = `w3f_m_${Date.now()}`;
    const iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.title = "web3forms";
    iframe.style.cssText =
      "position:absolute;width:0;height:0;border:0;visibility:hidden";
    document.body.appendChild(iframe);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = WEB3FORMS_ENDPOINT;
    form.target = iframeName;
    form.style.display = "none";
    for (const [k, v] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      form.appendChild(input);
    }
    document.body.appendChild(form);

    let settled = false;
    const cleanup = (ok: boolean, error?: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      form.remove();
      window.setTimeout(() => iframe.remove(), 4000);
      resolve(ok ? { ok: true } : { ok: false, error });
    };
    iframe.addEventListener("load", () => cleanup(true), { once: true });
    const timer = window.setTimeout(() => cleanup(true), 2500);
    try {
      form.submit();
    } catch (err) {
      cleanup(false, err instanceof Error ? err.message : "submit falhou");
    }
  });
}

export function openStrictWhatsApp(
  a: StrictAnswers,
  result: StrictResult,
  meta: StrictMeta = {},
): { ok: boolean } {
  const message = buildStrictWhatsApp(a, result, meta);
  const url = getWhatsAppUrl(message);
  if (!url) return { ok: false };
  window.open(url, "_blank", "noopener,noreferrer");
  return { ok: true };
}
