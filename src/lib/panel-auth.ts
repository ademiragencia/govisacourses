import { createServerFn } from "@tanstack/react-start";
import { supabaseRpc } from "./supabase";

export const PANEL_PASSWORD = "386510";

export type PanelUser = {
  name: string;
  role: "admin" | "sdr";
  isMaster: boolean;
};

export async function resolvePanelUser(password: string): Promise<PanelUser | null> {
  const pass = password.trim();
  if (!pass) return null;
  if (pass === PANEL_PASSWORD) {
    return { name: "Admin", role: "admin", isMaster: true };
  }
  try {
    const row = await supabaseRpc<{
      name?: string;
      role?: string;
      is_master?: boolean;
    }>("panel_login", { p_password: pass });
    if (!row?.name) return null;
    return {
      name: row.name,
      role: row.role === "admin" ? "admin" : "sdr",
      isMaster: Boolean(row.is_master),
    };
  } catch {
    return null;
  }
}

export const loginPanel = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({
    password: String((data as { password?: string })?.password || ""),
  }))
  .handler(async ({ data }) => {
    const user = await resolvePanelUser(data.password);
    if (!user) return { ok: false as const, error: "Senha incorreta" };
    return { ok: true as const, user };
  });
