import { createServerFn } from "@tanstack/react-start";
import { PANEL_PASSWORD } from "./enrollments";
import { supabaseRpc } from "./supabase";

export type CouponRow = {
  id: string;
  code: string;
  kind: "fixed" | "percent";
  amount: number;
  applies_to: "pix_cash" | "pix" | "card" | "all";
  active: boolean;
  max_uses: number | null;
  uses: number;
  note: string;
  created_at: string;
};

export type CouponPreview = {
  code: string;
  kind: string;
  discount: number;
  total: number;
  label: string;
};

export const previewCoupon = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as {
      code?: string;
      method?: string;
      plan?: string;
      amount?: number;
    };
    return {
      code: String(d.code || "").trim(),
      method: String(d.method || "pix"),
      plan: String(d.plan || "pix"),
      amount: Number(d.amount || 0),
    };
  })
  .handler(async ({ data }) => {
    if (!data.code) return { ok: false as const, error: "Informe o cupom" };
    try {
      const preview = await supabaseRpc<CouponPreview>("redeem_coupon", {
        p_code: data.code,
        p_method: data.method,
        p_plan: data.plan,
        p_amount: data.amount,
      });
      return { ok: true as const, preview };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Cupom inválido",
      };
    }
  });

export const listCoupons = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({
    password: String((data as { password?: string })?.password || ""),
  }))
  .handler(async ({ data }) => {
    if (data.password !== PANEL_PASSWORD) {
      return { ok: false as const, error: "Senha incorreta" };
    }
    try {
      const rows = await supabaseRpc<CouponRow[]>("list_coupons", {
        p_password: data.password,
      });
      return { ok: true as const, rows: rows || [] };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha ao carregar cupons",
      };
    }
  });

export const createCoupon = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as Record<string, unknown>)
  .handler(async ({ data }) => {
    const password = String(data.password || "");
    if (password !== PANEL_PASSWORD) {
      return { ok: false as const, error: "Senha incorreta" };
    }
    try {
      const row = await supabaseRpc<CouponRow>("create_coupon", {
        p_password: password,
        payload: {
          code: data.code,
          kind: data.kind,
          amount: data.amount,
          applies_to: data.applies_to,
          active: data.active !== false,
          max_uses: data.max_uses ?? "",
          note: data.note || "",
        },
      });
      return { ok: true as const, row };
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Falha ao criar";
      const error = /duplicate|unique/i.test(raw) ? "Esse código já existe" : raw;
      return { ok: false as const, error };
    }
  });

export const setCouponActive = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as { password?: string; id?: string; active?: boolean };
    return {
      password: String(d.password || ""),
      id: String(d.id || ""),
      active: Boolean(d.active),
    };
  })
  .handler(async ({ data }) => {
    if (data.password !== PANEL_PASSWORD) {
      return { ok: false as const, error: "Senha incorreta" };
    }
    try {
      const row = await supabaseRpc<CouponRow>("set_coupon_active", {
        p_password: data.password,
        p_id: data.id,
        p_active: data.active,
      });
      return { ok: true as const, row };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha ao atualizar",
      };
    }
  });

export const deleteCoupon = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as { password?: string; id?: string };
    return { password: String(d.password || ""), id: String(d.id || "") };
  })
  .handler(async ({ data }) => {
    if (data.password !== PANEL_PASSWORD) {
      return { ok: false as const, error: "Senha incorreta" };
    }
    try {
      await supabaseRpc("delete_coupon", {
        p_password: data.password,
        p_id: data.id,
      });
      return { ok: true as const };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha ao apagar",
      };
    }
  });
