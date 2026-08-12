import { COURSE_LIVE, COURSE_SELF, type CourseId } from "./config";
import type { StrictMeta } from "./strict-qualify";

export const LEAD_STORAGE_KEY = "gv_matricula_lead";

export type PayPlan = "cash" | "installments" | "entry";

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
    modality: "",
    plan: "",
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

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function paymentOptions(modality: CourseId | ""): PaymentOption[] {
  if (modality === "live") {
    return [
      {
        id: "cash",
        label: "R$ 3.000,00 à vista",
        detail: "Pix, cartão ou boleto",
        amount: COURSE_LIVE.price,
        installments: 1,
        amountLabel: brl(COURSE_LIVE.price),
      },
      {
        id: "entry",
        label: "Entrada de R$ 1.000",
        detail: "Depois 5× R$ 400 com a equipe",
        amount: COURSE_LIVE.entryFee,
        installments: 1,
        amountLabel: brl(COURSE_LIVE.entryFee),
      },
    ];
  }
  const parcelado = COURSE_SELF.installments * COURSE_SELF.installmentValue;
  return [
    {
      id: "cash",
      label: "R$ 2.000,00 à vista",
      detail: "Pix, cartão ou boleto",
      amount: COURSE_SELF.price,
      installments: 1,
      amountLabel: brl(COURSE_SELF.price),
    },
    {
      id: "installments",
      label: "5× R$ 500",
      detail: `Total ${brl(parcelado)} no cartão`,
      amount: parcelado,
      installments: COURSE_SELF.installments,
      amountLabel: brl(parcelado),
    },
  ];
}

export function selectedOffer(a: Pick<ContractAnswers, "modality" | "plan">) {
  const course = a.modality === "live" ? COURSE_LIVE : COURSE_SELF;
  const option =
    paymentOptions(a.modality).find((o) => o.id === a.plan) ??
    paymentOptions(a.modality)[0];
  return {
    modality: (a.modality === "live" ? "live" : "self") as CourseId,
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
  try {
    const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    const json = (await res.json()) as {
      erro?: boolean;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
    };
    if (!res.ok || json.erro) return null;
    return {
      street: json.logradouro || "",
      neighborhood: json.bairro || "",
      city: json.localidade || "",
      state: json.uf || "",
    };
  } catch {
    return null;
  }
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
