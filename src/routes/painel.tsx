import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Lock, LogOut, RefreshCw, Search } from "lucide-react";
import {
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

function PainelPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

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

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    await load(password.trim());
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
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
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [rows, q, status]);

  const paid = rows.filter((r) => r.status === "paid").length;
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
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Total", String(rows.length)],
            ["Pagas", String(paid)],
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
            <option value="failed">Falhou</option>
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
                    <span
                      className={
                        r.status === "paid"
                          ? "rounded-full bg-wa/15 px-2 py-0.5 text-[11px] font-bold uppercase text-wa"
                          : "rounded-full bg-fg-subtle/15 px-2 py-0.5 text-[11px] font-bold uppercase text-fg-muted"
                      }
                    >
                      {r.status === "paid" ? "Paga" : r.status === "failed" ? "Falhou" : "Iniciada"}
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
                    <p>{r.modality === "live" ? "Ao vivo" : "No seu ritmo"}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-fg">
                    {brl(Number(r.amount))}
                  </td>
                  <td className="px-4 py-3 text-xs text-fg-muted">
                    {r.payment_id || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
