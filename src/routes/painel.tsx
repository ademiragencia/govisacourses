import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Lock, LogOut, RefreshCw, Search, Trash2 } from "lucide-react";
import {
  clearEnrollments,
  listEnrollments,
  type EnrollmentRow,
} from "@/lib/enrollments";
import { SITE_URL } from "@/lib/seo";

const SESSION_KEY = "gv_painel_pass";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel | Go Visa Courses" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/painel` }],
  }),
  component: PainelPage,
});

function brl(n: number) {
  return Number(n || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function when(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

function statusLabel(status: string) {
  if (status === "paid") return "Paga";
  if (status === "refused" || status === "failed") return "Recusada";
  if (status === "pix_seller") return "Pix vendedor";
  if (status === "pending") return "Em análise";
  return "Iniciada";
}

function statusClass(status: string) {
  if (status === "paid") return "rounded-full bg-wa/15 px-2 py-0.5 text-[11px] font-bold uppercase text-wa";
  if (status === "refused" || status === "failed")
    return "rounded-full bg-brand-red/15 px-2 py-0.5 text-[11px] font-bold uppercase text-brand-red";
  if (status === "pix_seller")
    return "rounded-full bg-gold-line/15 px-2 py-0.5 text-[11px] font-bold uppercase text-gold-line";
  return "rounded-full bg-fg-subtle/15 px-2 py-0.5 text-[11px] font-bold uppercase text-fg-muted";
}

function PainelPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      setAuthed(true);
      void load(saved);
    }
  }, []);

  async function load(pass: string) {
    setLoading(true);
    setError(null);
    const res = await listEnrollments({ data: { password: pass } });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      setAuthed(false);
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }
    setRows(res.rows);
    setAuthed(true);
    sessionStorage.setItem(SESSION_KEY, pass);
  }

  async function onClear() {
    const pass = sessionStorage.getItem(SESSION_KEY) || "";
    setClearing(true);
    setError(null);
    const res = await clearEnrollments({ data: { password: pass } });
    setClearing(false);
    if (!res.ok) {
      setError(res.error);
      setConfirmClear(false);
      return;
    }
    setRows([]);
    setConfirmClear(false);
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    await load(password.trim());
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status === "refused") {
        if (r.status !== "refused" && r.status !== "failed") return false;
      } else if (status !== "all" && r.status !== status) return false;
      if (!term) return true;
      return [
        r.name,
        r.email,
        r.phone,
        r.cpf,
        r.city,
        r.course_title,
        r.plan_label,
        r.payment_id,
        r.method,
        r.note,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [rows, q, status]);

  const paid = rows.filter((r) => r.status === "paid").length;
  const refused = rows.filter((r) => r.status === "refused" || r.status === "failed").length;
  const pix = rows.filter((r) => r.status === "pix_seller").length;
  const total = rows.reduce(
    (acc, r) => acc + (r.status === "paid" ? Number(r.amount) : 0),
    0,
  );

  if (!authed) {
    return (
      <main className="container-lp flex min-h-dvh items-center justify-center py-16">
        <form
          onSubmit={(e) => void onLogin(e)}
          className="w-full max-w-sm rounded-[var(--radius-2xl)] border border-border bg-bg-elevated p-8 shadow-[var(--shadow-soft)]"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-line">
            Área interna
          </p>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-fg">
            Painel de matrículas
          </h1>
          <label className="mt-6 block text-xs font-bold uppercase tracking-[0.12em] text-fg-subtle">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-[var(--radius-md)] border border-border bg-bg px-4 py-3 text-sm text-fg outline-none focus:border-brand-red/50"
            autoFocus
          />
          {error && <p className="mt-2 text-xs text-brand-red">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red text-sm font-bold uppercase tracking-[0.04em] text-white disabled:opacity-70"
          >
            <Lock className="size-4" />
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-dvh">
      <header className="border-b border-border bg-bg/80 backdrop-blur-lg">
        <div className="container-lp flex h-14 items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-line">
              Painel
            </p>
            <p className="text-sm font-semibold text-fg">Matrículas</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void load(sessionStorage.getItem(SESSION_KEY) || "")}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-border px-3 text-xs font-semibold text-fg-muted hover:text-fg"
            >
              <RefreshCw className="size-3.5" />
              Atualizar
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-brand-red/40 px-3 text-xs font-semibold text-brand-red hover:bg-brand-red-soft"
            >
              <Trash2 className="size-3.5" />
              Limpar
            </button>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem(SESSION_KEY);
                setAuthed(false);
                setPassword("");
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-border px-3 text-xs font-semibold text-fg-muted hover:text-fg"
            >
              <LogOut className="size-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container-lp py-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Tentativas", String(rows.length)],
            ["Pagas", String(paid)],
            ["Recusadas", String(refused)],
            ["Pix vendedor", String(pix)],
            ["Faturado", brl(total)],
          ].map(([k, v]) => (
            <div
              key={k}
              className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-4 py-3"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
                {k}
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold text-fg">
                {v}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar nome, e-mail, CPF, cidade…"
              className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg-elevated pl-10 pr-4 text-sm text-fg outline-none"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 rounded-[var(--radius-md)] border border-border bg-bg-elevated px-3 text-sm text-fg"
          >
            <option value="all">Todos os status</option>
            <option value="paid">Pagas</option>
            <option value="started">Iniciadas</option>
            <option value="refused">Recusadas</option>
            <option value="pix_seller">Pix vendedor</option>
            <option value="pending">Em análise</option>
          </select>
        </div>

        <div className="mt-5 overflow-x-auto rounded-[var(--radius-xl)] border border-border">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-bg-elevated text-[11px] uppercase tracking-[0.1em] text-fg-subtle">
              <tr>
                {[
                  "Quando",
                  "Status",
                  "Aluno",
                  "Contato",
                  "Curso",
                  "Valor",
                  "Pagamento",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-fg-muted">
                    {loading ? "Carregando…" : "Nenhuma matrícula ainda."}
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="px-4 py-3 text-xs text-fg-muted">
                    {when(r.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={statusClass(r.status)}>
                      {statusLabel(r.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-fg">{r.name}</p>
                    <p className="text-xs text-fg-muted">
                      CPF {r.cpf} · {r.city}/{r.state}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-fg-muted">
                    <p>{r.email}</p>
                    <p>{r.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-fg-muted">
                    <p className="font-medium text-fg">{r.plan_label}</p>
                    <p>{r.modality === "live" || !r.modality ? "Ao vivo" : "Ao vivo"}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-fg">
                    {brl(Number(r.amount))}
                  </td>
                  <td className="px-4 py-3 text-xs text-fg-muted">
                    <p>{r.method === "pix_seller" ? "Pix vendedor" : r.method === "card" ? "Cartão" : r.method || "—"}</p>
                    <p>{r.payment_id || r.note || "—"}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmClear && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-[var(--radius-2xl)] border border-border bg-bg-elevated p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-xl font-extrabold text-fg">
              Limpar o painel?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              Isso apaga todas as tentativas e matrículas. Não dá para
              desfazer.
            </p>
            {error && <p className="mt-3 text-xs text-brand-red">{error}</p>}
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-border text-sm font-semibold text-fg"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={clearing}
                onClick={() => void onClear()}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red text-sm font-bold uppercase tracking-[0.04em] text-white disabled:opacity-70"
              >
                <Trash2 className="size-4" />
                {clearing ? "Limpando…" : "Limpar tudo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
