import { createServerFn } from "@tanstack/react-start";
import { PANEL_PASSWORD, resolvePanelUser } from "./panel-auth";
import { supabaseRpc } from "./supabase";

export type TeamRow = {
  id: string;
  name: string;
  password: string;
  role: "admin" | "sdr";
  active: boolean;
  created_at: string;
};

export const listTeam = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({
    password: String((data as { password?: string })?.password || ""),
  }))
  .handler(async ({ data }) => {
    const user = await resolvePanelUser(data.password);
    if (!user) return { ok: false as const, error: "Senha incorreta" };
    if (user.role !== "admin") {
      return { ok: false as const, error: "Só o admin vê a equipe" };
    }
    try {
      const rows = await supabaseRpc<TeamRow[]>("list_panel_users", {
        p_password: PANEL_PASSWORD,
      });
      return { ok: true as const, rows: rows || [] };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha ao carregar equipe",
      };
    }
  });

export const createTeamUser = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as Record<string, unknown>)
  .handler(async ({ data }) => {
    const user = await resolvePanelUser(String(data.password || ""));
    if (!user || user.role !== "admin") {
      return { ok: false as const, error: "Só o admin cria acesso" };
    }
    const name = String(data.name || "").trim();
    const pass = String(data.userPassword || "").trim();
    if (!name || pass.length < 4) {
      return { ok: false as const, error: "Nome e senha (mín. 4) são obrigatórios" };
    }
    try {
      const row = await supabaseRpc<TeamRow>("create_panel_user", {
        p_password: PANEL_PASSWORD,
        payload: { name, password: pass, role: data.role || "sdr" },
      });
      return { ok: true as const, row };
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Falha ao criar";
      return {
        ok: false as const,
        error: /unique|duplicate/i.test(raw) ? "Essa senha já existe" : raw,
      };
    }
  });

export const deleteTeamUser = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as { password?: string; id?: string };
    return { password: String(d.password || ""), id: String(d.id || "") };
  })
  .handler(async ({ data }) => {
    const user = await resolvePanelUser(data.password);
    if (!user || user.role !== "admin") {
      return { ok: false as const, error: "Só o admin remove acesso" };
    }
    try {
      await supabaseRpc("delete_panel_user", {
        p_password: PANEL_PASSWORD,
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
