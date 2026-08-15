import { COURSE_LIVE, type CourseId } from "./config";
import { brl } from "./pricing";
import type { StrictMeta } from "./strict-qualify";

export const LEAD_STORAGE_KEY = "gv_matricula_lead";

export type PayPlan = "pix" | "card";

export type ContractAnswers = {
  modality: CourseId | "";
  plan: PayPlan | "";
  name: string;
  cpf: string;
  rg: string;
  birthDate: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type StoredLead = ContractAnswers & {
  id: string;
  meta: StrictMeta;
  amount: number;
  installments: number;
  courseTitle: string;
  planLabel: string;
};

export type PaymentOption = {
  id: PayPlan;
  label: string;
  detail: string;
  amount: number;
  installments: number;
  amountLabel: string;
};

export function emptyContract(): ContractAnswers {
  return {
    modality: "live",
    plan: "pix",
    name: "",
    cpf: "",
    rg: "",
    birthDate: "",
    email: "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  };
}

export function paymentOptions(_modality?: CourseId | ""): PaymentOption[] {
  return [
    {
      id: "pix",
      label: "Pix à vista",
      detail: "R$ 3.000 agora. Sem juros e sem parcela.",
      amount: COURSE_LIVE.price,
      installments: 1,
      amountLabel: brl(COURSE_LIVE.price),
    },
    {
      id: "card",
      label: "Cartão em até 10×",
      detail: "Você escolhe de 1× a 10×. A partir de 2× tem juros.",
      amount: COURSE_LIVE.price,
      installments: 1,
      amountLabel: "até 10×",
    },
  ];
}

export function selectedOffer(a: Pick<ContractAnswers, "modality" | "plan">) {
  const course = COURSE_LIVE;
  const option =
    paymentOptions("live").find((o) => o.id === a.plan) ??
    paymentOptions("live")[0];
  return {
    modality: "live" as CourseId,
    title: `${course.name} — ${course.shortName}`,
    shortName: course.shortName,
    amount: option.amount,
    installments: option.installments,
    priceLabel: option.amountLabel,
    planLabel: option.label,
    planDetail: option.detail,
  };
}

export function formatCpf(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatBirthDate(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

export function birthError(value: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!m) return "Use o formato 00/00/0000";
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const now = new Date().getFullYear();
  if (month < 1 || month > 12 || day < 1 || day > 31) return "Data inválida";
  if (year < 1930 || year > now - 16) return "Informe uma data de nascimento válida";
  const dt = new Date(year, month - 1, day);
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() !== month - 1 ||
    dt.getDate() !== day
  ) {
    return "Data inválida";
  }
  return null;
}

export function formatCep(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function isCpfValid(cpf: string) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export function cpfError(cpf: string): string | null {
  const d = cpf.replace(/\D/g, "");
  if (!d) return "Informe o CPF";
  if (d.length < 11) return "CPF incompleto";
  if (!isCpfValid(cpf)) return "CPF inválido. Digite um CPF verdadeiro";
  return null;
}

export async function lookupCep(cep: string) {
  const d = cep.replace(/\D/g, "");
  if (d.length !== 8) return null;
  const urls = [
    `https://viacep.com.br/ws/${d}/json/`,
    `https://brasilapi.com.br/api/cep/v2/${d}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      const json = (await res.json()) as Record<string, unknown>;
      if (!res.ok || json.erro || json.type === "service_error") continue;
      return {
        street: String(json.logradouro || json.street || ""),
        neighborhood: String(json.bairro || json.neighborhood || ""),
        city: String(json.localidade || json.city || ""),
        state: String(json.uf || json.state || ""),
      };
    } catch {
      /* try next */
    }
  }
  return null;
}

export function saveLead(lead: StoredLead) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(lead);
  try {
    sessionStorage.setItem(LEAD_STORAGE_KEY, raw);
    localStorage.setItem(LEAD_STORAGE_KEY, raw);
  } catch {
    /* ignore */
  }
}

export function loadLead(): StoredLead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(LEAD_STORAGE_KEY) ||
      localStorage.getItem(LEAD_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredLead;
  } catch {
    return null;
  }
}

export function newLeadId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `gv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
