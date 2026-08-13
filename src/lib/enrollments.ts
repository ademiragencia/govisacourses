import { createServerFn } from "@tanstack/react-start";
import { supabaseRpc } from "./supabase";
import type { StoredLead } from "./mp";

export const PANEL_PASSWORD = "386510";

export type EnrollmentRow = {
  id: string;
  lead_id: string;
  status: string;
  name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  modality: string;
  plan: string;
  amount: number;
  installments: number;
  course_title: string;
  plan_label: string;
  payment_id: string;
  source: string;
  method: string;
  note: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
};

export function leadToPayload(
  lead: StoredLead,
  extra?: {
    status?: string;
    paymentId?: string;
    method?: string;
    note?: string;
  },
) {
  return {
    lead_id: lead.id,
    status: extra?.status || "started",
    name: lead.name,
    cpf: lead.cpf,
    rg: lead.rg,
    birth_date: lead.birthDate,
    email: lead.email,
    phone: lead.phone,
    cep: lead.cep,
    street: lead.street,
    number: lead.number,
    complement: lead.complement,
    neighborhood: lead.neighborhood,
    city: lead.city,
    state: lead.state,
    modality: lead.modality,
    plan: lead.plan,
    amount: lead.amount,
    installments: lead.installments,
    course_title: lead.courseTitle,
    plan_label: lead.planLabel,
    payment_id: extra?.paymentId || "",
    source: lead.meta?.source || "",
    method: extra?.method || "",
    note: extra?.note || "",
  };
}

export const saveEnrollment = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as Record<string, unknown>)
  .handler(async ({ data }) => {
    try {
      const row = await supabaseRpc<EnrollmentRow>("upsert_enrollment", {
        payload: data,
      });
      return { ok: true as const, row };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha ao salvar",
      };
    }
  });

export const listEnrollments = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as { password?: string };
    return { password: String(d?.password || "") };
  })
  .handler(async ({ data }) => {
    if (data.password !== PANEL_PASSWORD) {
      return { ok: false as const, error: "Senha incorreta" };
    }
    try {
      const rows = await supabaseRpc<EnrollmentRow[]>("admin_list_enrollments", {
        p_password: data.password,
      });
      return { ok: true as const, rows: rows || [] };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha ao carregar",
      };
    }
  });
