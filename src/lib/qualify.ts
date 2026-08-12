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

export type QualifyAnswers = {
  name: string;
  email: string;
  phone: string;
  city: string;
  age: string;
  modality: CourseId | "";
  english: string;
  education: string;
  availability: string;
  investment: string;
  motivation: string;
};

export type QualifyStatus = "qualified" | "review" | "unqualified";

export type QualifyResult = {
  status: QualifyStatus;
  score: number;
  flags: string[];
  label: string;
};

export type QualifyMeta = {
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

export const AGE_OPTIONS = [
  { value: "18-24", label: "18 a 24 anos" },
  { value: "25-34", label: "25 a 34 anos" },
  { value: "35-44", label: "35 a 44 anos" },
  { value: "45-54", label: "45 a 54 anos" },
  { value: "55+", label: "55 anos ou mais" },
] as const;

export const MODALITY_OPTIONS = [
  {
    value: "live",
    label: `Ao vivo + portal (${COURSE_LIVE.priceLabel}: ${COURSE_LIVE.planLabel})`,
  },
  {
    value: "self",
    label: `No seu ritmo (${COURSE_SELF.priceLabel}: ${COURSE_SELF.planLabel})`,
  },
] as const;

export const ENGLISH_OPTIONS = [
  {
    value: "none",
    label: "Não falo inglês (sem problema, não é obrigatório)",
  },
  { value: "basic", label: "Básico (palavras e frases simples)" },
  { value: "inter", label: "Intermediário (consigo me comunicar)" },
  { value: "advanced", label: "Avançado / fluente" },
] as const;

export const EDUCATION_OPTIONS = [
  { value: "hs", label: "Ensino médio" },
  { value: "college", label: "Superior incompleto" },
  { value: "grad", label: "Superior completo" },
  { value: "post", label: "Pós-graduação" },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: "low", label: "Menos de 5h por semana" },
  { value: "mid", label: "5 a 10h por semana" },
  { value: "high", label: "Mais de 10h por semana" },
] as const;

export const INVESTMENT_OPTIONS = [
  { value: "ready", label: "Sim, posso investir agora" },
  { value: "soon", label: "Consigo nas próximas semanas" },
  { value: "hard", label: "Ainda não tenho condições" },
] as const;

export const MOTIVATION_OPTIONS = [
  {
    value: "hire",
    label: `Quero ser contratado pela ${BRAND.firm} faturando em dólar`,
  },
  { value: "career", label: "Quero atuar profissionalmente em imigração" },
  { value: "dollar", label: "Quero carreira com o mercado americano / em dólar" },
  { value: "remote", label: "Quero trabalhar de casa com estabilidade" },
  { value: "explore", label: "Estou só conhecendo a oportunidade" },
] as const;

export function emptyAnswers(): QualifyAnswers {
  return {
    name: "",
    email: "",
    phone: "",
    city: "",
    age: "",
    modality: "",
    english: "",
    education: "",
    availability: "",
    investment: "",
    motivation: "",
  };
}

function labelOf(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function evaluateLead(a: QualifyAnswers): QualifyResult {
  let score = 0;
  const flags: string[] = [];

  if (a.investment === "ready") score += 35;
  else if (a.investment === "soon") {
    score += 22;
    flags.push("Investimento nas próximas semanas");
  } else if (a.investment === "hard") {
    score += 0;
    flags.push("Sem condições financeiras no momento");
  }

  if (a.availability === "high") score += 25;
  else if (a.availability === "mid") score += 18;
  else if (a.availability === "low") {
    score += 6;
    flags.push("Pouca disponibilidade de estudo");
  }

  if (a.motivation === "hire") {
    score += 20;
    flags.push(`Alvo: contratação ${BRAND.firm} em dólar`);
  } else if (a.motivation === "career" || a.motivation === "dollar") score += 16;
  else if (a.motivation === "remote") score += 12;
  else if (a.motivation === "explore") {
    score += 5;
    flags.push("Ainda explorando, não decidido");
  }

  if (a.education === "grad" || a.education === "post") score += 6;
  else if (a.education === "college") score += 5;
  else score += 3;

  if (a.age === "25-34" || a.age === "35-44") score += 6;
  else if (a.age === "18-24" || a.age === "45-54") score += 4;
  else score += 2;

  if (a.modality === "live") {
    score += 5;
    flags.push("Interesse na turma com aulas ao vivo (30/08/2026)");
  } else if (a.modality === "self") {
    score += 5;
    flags.push("Interesse na modalidade no próprio ritmo");
  }

  if (a.english === "advanced") {
    score += 10;
    flags.push("Inglês avançado (diferencial, não obrigatório)");
  } else if (a.english === "inter") {
    score += 7;
    flags.push("Inglês intermediário (diferencial, não obrigatório)");
  } else if (a.english === "basic") {
    score += 3;
  } else if (a.english === "none") {
    flags.push("Sem inglês: ok, não é requisito da formação");
  }

  let status: QualifyStatus = "review";
  if (score >= 65 && a.investment !== "hard") status = "qualified";
  else if (a.investment === "hard" || score < 35) status = "unqualified";

  const label =
    status === "qualified"
      ? "QUALIFICADO"
      : status === "review"
        ? "EM ANÁLISE"
        : "PERFIL FORA DO IDEAL";

  return { status, score, flags, label };
}

function sourceLabel(meta: QualifyMeta): string {
  if (meta.source === "ads-qualificacao" || meta.source === "ads")
    return "ANÚNCIO / Página de qualificação";
  if (meta.source === "site") return "Landing principal";
  return meta.source || "Site";
}

export function buildWhatsAppFicha(
  a: QualifyAnswers,
  result: QualifyResult,
  meta: QualifyMeta = {},
): string {
  const statusEmoji =
    result.status === "qualified"
      ? "✅"
      : result.status === "review"
        ? "🟡"
        : "🔴";

  const course =
    a.modality === "live" || a.modality === "self"
      ? COURSES[a.modality]
      : null;

  const lines = [
    `${statusEmoji} *NOVA FICHA: Processos Imigratórios*`,
    `Status: *${result.label}* (score ${result.score}/100)`,
    `Origem: *${sourceLabel(meta)}*`,
    `Meta: contratação ${BRAND.firm} em dólar`,
    "",
    `*Nome:* ${a.name.trim()}`,
    `*E-mail:* ${a.email.trim()}`,
    `*WhatsApp do lead:* ${a.phone.trim()}`,
    `*Cidade:* ${a.city.trim()}`,
    `*Idade:* ${labelOf(AGE_OPTIONS, a.age)}`,
    `*Modalidade:* ${labelOf(MODALITY_OPTIONS, a.modality)}`,
  ];

  if (course) {
    lines.push(
      `*Oferta escolhida:* ${course.priceLabel} (${course.planLabel})`,
      `*Início:* ${course.startLabel}`,
    );
  }

  lines.push(
    `*Inglês:* ${labelOf(ENGLISH_OPTIONS, a.english)} (não é requisito)`,
    `*Escolaridade:* ${labelOf(EDUCATION_OPTIONS, a.education)}`,
    `*Disponibilidade:* ${labelOf(AVAILABILITY_OPTIONS, a.availability)}`,
    `*Investimento:* ${labelOf(INVESTMENT_OPTIONS, a.investment)}`,
    `*Motivação:* ${labelOf(MOTIVATION_OPTIONS, a.motivation)}`,
  );

  const utmBits = [
    meta.utm_source && `utm_source=${meta.utm_source}`,
    meta.utm_medium && `utm_medium=${meta.utm_medium}`,
    meta.utm_campaign && `utm_campaign=${meta.utm_campaign}`,
    meta.utm_content && `utm_content=${meta.utm_content}`,
    meta.utm_term && `utm_term=${meta.utm_term}`,
  ].filter(Boolean);

  if (utmBits.length) {
    lines.push("", `*UTM / Anúncio:* ${utmBits.join(" | ")}`);
  }

  if (result.flags.length) {
    lines.push("", "*Observações:*");
    for (const f of result.flags) lines.push(`• ${f}`);
  }

  lines.push(
    "",
    `Vim pela página de qualificação. Quero a formação e a chance de ser contratado pela ${BRAND.firm} faturando em dólar.`,
  );

  return lines.join("\n");
}

/** Corpo legível do lead no e-mail (Web3Forms) */
export function buildLeadEmailMessage(
  a: QualifyAnswers,
  result: QualifyResult,
  meta: QualifyMeta = {},
): string {
  const course =
    a.modality === "live" || a.modality === "self"
      ? COURSES[a.modality]
      : null;

  const lines = [
    "NOVO LEAD — Formação Processos Imigratórios",
    "========================================",
    `Status: ${result.label} (score ${result.score}/100)`,
    `Origem: ${sourceLabel(meta)}`,
    "",
    "DADOS DE CONTATO",
    `Nome: ${a.name.trim()}`,
    `E-mail: ${a.email.trim()}`,
    `WhatsApp: ${a.phone.trim()}`,
    `Cidade: ${a.city.trim()}`,
    `Faixa etária: ${labelOf(AGE_OPTIONS, a.age)}`,
    "",
    "QUALIFICAÇÃO",
    `Modalidade: ${labelOf(MODALITY_OPTIONS, a.modality)}`,
  ];

  if (course) {
    lines.push(
      `Oferta: ${course.priceLabel} (${course.planLabel})`,
      `Início: ${course.startLabel}`,
    );
  }

  lines.push(
    `Inglês: ${labelOf(ENGLISH_OPTIONS, a.english)}`,
    `Escolaridade: ${labelOf(EDUCATION_OPTIONS, a.education)}`,
    `Disponibilidade: ${labelOf(AVAILABILITY_OPTIONS, a.availability)}`,
    `Investimento: ${labelOf(INVESTMENT_OPTIONS, a.investment)}`,
    `Motivação: ${labelOf(MOTIVATION_OPTIONS, a.motivation)}`,
  );

  if (
    meta.utm_source ||
    meta.utm_medium ||
    meta.utm_campaign ||
    meta.utm_content ||
    meta.utm_term
  ) {
    lines.push(
      "",
      "UTM / ANÚNCIO",
      `utm_source: ${meta.utm_source || "-"}`,
      `utm_medium: ${meta.utm_medium || "-"}`,
      `utm_campaign: ${meta.utm_campaign || "-"}`,
      `utm_content: ${meta.utm_content || "-"}`,
      `utm_term: ${meta.utm_term || "-"}`,
    );
  }

  if (result.flags.length) {
    lines.push("", "OBSERVAÇÕES");
    for (const f of result.flags) lines.push(`- ${f}`);
  }

  lines.push("", `Enviado em: ${new Date().toLocaleString("pt-BR")}`);
  return lines.join("\n");
}

/**
 * Envia lead por e-mail via Web3Forms.
 * 1) tenta fetch com FormData (sem preflight JSON)
 * 2) se falhar, POST clássico em iframe (formato do form HTML deles)
 */
export async function submitLeadEmail(
  a: QualifyAnswers,
  result: QualifyResult,
  meta: QualifyMeta = {},
): Promise<{ ok: boolean; error?: string }> {
  if (!WEB3FORMS_ACCESS_KEY) {
    return { ok: false, error: "access_key ausente" };
  }

  const fields: Record<string, string> = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `[Lead ${result.label}] ${a.name.trim()} — Go Visa Courses`,
    from_name: "Go Visa Courses · Qualificação",
    name: a.name.trim(),
    email: a.email.trim(),
    phone: a.phone.trim(),
    city: a.city.trim(),
    status: result.label,
    score: String(result.score),
    modality: labelOf(MODALITY_OPTIONS, a.modality),
    source: sourceLabel(meta),
    utm_source: meta.utm_source || "",
    utm_medium: meta.utm_medium || "",
    utm_campaign: meta.utm_campaign || "",
    utm_content: meta.utm_content || "",
    utm_term: meta.utm_term || "",
    message: buildLeadEmailMessage(a, result, meta),
    botcheck: "",
  };

  // 1) fetch FormData
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
    if (res.ok && data.success !== false) {
      return { ok: true };
    }
    // se API recusou de forma clara, propaga
    if (data.success === false && data.message) {
      // cai pro fallback de form nativo abaixo
    }
  } catch {
    /* CORS / rede — tenta form nativo */
  }

  // 2) fallback: form HTML → iframe (mesmo padrão do snippet Web3Forms)
  return submitLeadEmailViaForm(fields);
}

function submitLeadEmailViaForm(
  fields: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve({ ok: false, error: "sem document" });
      return;
    }

    const iframeName = `w3f_${Date.now()}`;
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
      // mantém iframe um pouco para o POST completar
      window.setTimeout(() => iframe.remove(), 4000);
      resolve(ok ? { ok: true } : { ok: false, error });
    };

    iframe.addEventListener("load", () => cleanup(true), { once: true });
    const timer = window.setTimeout(() => {
      // Em muitos casos o load dispara; se não, assume enviado (fire-and-forget)
      cleanup(true);
    }, 2500);

    try {
      form.submit();
    } catch (err) {
      cleanup(false, err instanceof Error ? err.message : "submit falhou");
    }
  });
}

export function openWhatsAppWithFicha(
  a: QualifyAnswers,
  result: QualifyResult,
  meta: QualifyMeta = {},
): { ok: boolean; url: string | null } {
  const message = buildWhatsAppFicha(a, result, meta);
  const url = getWhatsAppUrl(message);
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
    return { ok: true, url };
  }
  return { ok: false, url: null };
}

export function formatPhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }
  digits = digits.slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const VALID_DDD = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35,
  37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64,
  65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88,
  89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

export function phoneDigits(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
  return d.slice(0, 11);
}

export function isPhoneValid(phone: string): boolean {
  const d = phoneDigits(phone);
  if (d.length !== 11) return false;
  if (/^(\d)\1+$/.test(d)) return false;
  const ddd = Number(d.slice(0, 2));
  if (!VALID_DDD.has(ddd)) return false;
  if (d[2] !== "9") return false;
  if (/^(\d)\1+$/.test(d.slice(2))) return false;
  return true;
}

export function phoneError(phone: string): string | null {
  const d = phoneDigits(phone);
  if (!d) return "Informe um celular com DDD";
  if (d.length < 11) return "Celular incompleto. Use DDD + 9 dígitos";
  if (!VALID_DDD.has(Number(d.slice(0, 2)))) return "DDD inválido";
  if (d[2] !== "9") return "Use um celular (o número deve começar com 9)";
  if (!isPhoneValid(phone)) return "Número de celular inválido";
  return null;
}

/** Lê UTMs da URL (para anúncios Meta/Google) */
export function readUtmFromSearch(search: string): QualifyMeta {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  return {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_content: params.get("utm_content") || undefined,
    utm_term: params.get("utm_term") || undefined,
  };
}
