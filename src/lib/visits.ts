import { createServerFn } from "@tanstack/react-start";
import { PANEL_PASSWORD } from "./enrollments";
import { supabaseRpc } from "./supabase";

export type VisitRow = {
  id: string;
  session_id: string;
  path: string;
  source: string;
  referrer: string;
  referrer_host: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  landing: string;
  created_at: string;
};

const SID = "gv_sid";
const LANDING = "gv_landing";

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function resolveSource(input: {
  utm?: string;
  referrer?: string;
  search?: string;
}) {
  const utm = (input.utm || "").trim().toLowerCase();
  if (utm) return utm;
  const q = input.search || "";
  if (/fbclid=/.test(q) || /instagram\.com|facebook\.com|l\.facebook|lm\.facebook/.test(input.referrer || ""))
    return "meta";
  if (/gclid=|gbraid=|wbraid=/.test(q) || /google\./.test(input.referrer || ""))
    return "google";
  if (/ttclid=/.test(q) || /tiktok/.test(input.referrer || "")) return "tiktok";
  const host = hostOf(input.referrer || "");
  if (host) return host;
  return "direto";
}

export async function trackVisit(path: string, search = "") {
  if (typeof window === "undefined") return;
  if (path.startsWith("/painel")) return;
  let sid = sessionStorage.getItem(SID);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SID, sid);
  }
  let landing = sessionStorage.getItem(LANDING);
  if (!landing) {
    landing = `${path}${search || ""}`;
    sessionStorage.setItem(LANDING, landing);
  }
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const referrer = document.referrer || "";
  const payload = {
    session_id: sid,
    path,
    source: resolveSource({
      utm: params.get("utm_source") || "",
      referrer,
      search,
    }),
    referrer,
    referrer_host: hostOf(referrer),
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
    landing,
  };
  try {
    await supabaseRpc("insert_page_visit", { payload });
  } catch {
    /* não bloqueia a página */
  }
}

export const listVisits = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as { password?: string };
    return { password: String(d?.password || "") };
  })
  .handler(async ({ data }) => {
    if (data.password !== PANEL_PASSWORD) {
      return { ok: false as const, error: "Senha incorreta" };
    }
    try {
      const rows = await supabaseRpc<VisitRow[]>("admin_list_visits", {
        p_password: data.password,
      });
      return { ok: true as const, rows: rows || [] };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha ao carregar acessos",
      };
    }
  });
