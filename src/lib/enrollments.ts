import { createServerFn } from "@tanstack/react-start";
import { PANEL_PASSWORD, resolvePanelUser } from "./panel-auth";
import { supabaseRpc } from "./supabase";
import type { StoredLead } from "./mp";

export { PANEL_PASSWORD };

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
  pipeline: string;
  owner: string;
  coupon_code: string;
  contacted_at: string | null;
  follow_up: string;
};

export function leadToPayload(
  lead: StoredLead,
  extra?: {
    status?: string;
    paymentId?: string;
    method?: string;
    note?: string;
    coupon?: string;
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
    coupon_code: extra?.coupon || "",
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
  .validator((data: unknown) => ({
    password: String((data as { password?: string })?.password || ""),
  }))
  .handler(async ({ data }) => {
    const user = await resolvePanelUser(data.password);
    if (!user) return { ok: false as const, error: "Senha incorreta" };
    try {
      const rows = await supabaseRpc<EnrollmentRow[]>("admin_list_enrollments", {
        p_password: PANEL_PASSWORD,
      });
      return { ok: true as const, rows: rows || [], user };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha ao carregar",
      };
    }
  });

export const clearEnrollments = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({
    password: String((data as { password?: string })?.password || ""),
  }))
  .handler(async ({ data }) => {
    const user = await resolvePanelUser(data.password);
    if (!user || user.role !== "admin") {
      return { ok: false as const, error: "Só o admin pode limpar" };
    }
    try {
      const res = await supabaseRpc<{ deleted?: number }>(
        "admin_clear_enrollments",
        { p_password: PANEL_PASSWORD },
      );
      return { ok: true as const, deleted: Number(res?.deleted ?? 0) };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha ao limpar",
      };
    }
  });

export const deleteEnrollment = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as { password?: string; id?: string };
    return { password: String(d?.password || ""), id: String(d?.id || "") };
  })
  .handler(async ({ data }) => {
    const user = await resolvePanelUser(data.password);
    if (!user) return { ok: false as const, error: "Senha incorreta" };
    if (!data.id) return { ok: false as const, error: "Registro inválido" };
    try {
      const res = await supabaseRpc<{ deleted?: number }>(
        "admin_delete_enrollment",
        { p_password: PANEL_PASSWORD, p_id: data.id },
      );
      return { ok: true as const, deleted: Number(res?.deleted ?? 0) };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha ao apagar",
      };
    }
  });

export const setEnrollmentOps = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as {
      password?: string;
      id?: string;
      pipeline?: string;
      owner?: string;
      follow_up?: string;
      contacted?: boolean;
    };
    return {
      password: String(d.password || ""),
      id: String(d.id || ""),
      pipeline: String(d.pipeline || ""),
      owner: String(d.owner ?? ""),
      follow_up: d.follow_up === undefined ? undefined : String(d.follow_up),
      contacted: Boolean(d.contacted),
    };
  })
  .handler(async ({ data }) => {
    const user = await resolvePanelUser(data.password);
    if (!user) return { ok: false as const, error: "Senha incorreta" };
    try {
      const row = await supabaseRpc<EnrollmentRow>("set_enrollment_ops", {
        p_password: data.password,
        p_id: data.id,
        p_pipeline: data.pipeline || null,
        p_owner: data.owner || null,
        p_follow_up: data.follow_up ?? null,
        p_contacted: data.contacted || null,
      });
      return { ok: true as const, row };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha ao atualizar",
      };
    }
  });
