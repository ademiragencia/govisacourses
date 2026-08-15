import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Download,
  Lock,
  LogOut,
  MessageCircle,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  clearEnrollments,
  deleteEnrollment,
  listEnrollments,
  type EnrollmentRow,
} from "@/lib/enrollments";
import { clearVisits, listVisits, type VisitRow } from "@/lib/visits";
import { getWhatsAppUrl } from "@/lib/config";
import { SITE_URL } from "@/lib/seo";

const SESSION_KEY = "gv_painel_pass";

type Tab = "geral" | "matriculas" | "acessos";

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

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function topCounts(items: string[], limit = 6) {
  const map = new Map<string, number>();
  for (const raw of items) {
    const k = raw.trim() || "direto";
    map.set(k, (map.get(k) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function statusLabel(status: string) {
  if (status === "paid") return "Paga";
  if (status === "refused" || status === "failed") return "Recusada";
  if (status === "pix_seller") return "Pix vendedor";
  if (status === "pending") return "Em análise";
  return "Iniciada";
}

function statusClass(status: string) {
  if (status === "paid")
    return "rounded-full bg-wa/15 px-2 py-0.5 text-[11px] font-bold uppercase text-wa";
  if (status === "refused" || status === "failed")
    return "rounded-full bg-brand-red/15 px-2 py-0.5 text-[11px] font-bold uppercase text-brand-red";
  if (status === "pix_seller")
    return "rounded-full bg-gold-line/15 px-2 py-0.5 text-[11px] font-bold uppercase text-gold-line";
  return "rounded-full bg-fg-subtle/15 px-2 py-0.5 text-[11px] font-bold uppercase text-fg-muted";
}

function methodLabel(r: EnrollmentRow) {
  if (r.method === "pix_seller") return "Pix vendedor";
  if (r.method === "pix") return "Pix";
  if (r.method === "card") return "Cartão";
  return r.method || "—";
}

function shareEnrollment(row: EnrollmentRow) {
  const address = [
    row.street,
    row.number,
    row.complement,
    row.neighborhood,
    row.city,
    row.state,
    row.cep,
  ]
    .filter(Boolean)
    .join(", ");
  const text = [
    "*FICHA PARA CONTRATO*",
    `Status: ${statusLabel(row.status)}`,
    `Quando: ${when(row.created_at)}`,
    "",
    `*Nome:* ${row.name}`,
    `*CPF:* ${row.cpf || "—"}`,
    `*Nascimento:* ${row.birth_date || "—"}`,
    `*E-mail:* ${row.email || "—"}`,
    `*WhatsApp do aluno:* ${row.phone || "—"}`,
    `*Endereço:* ${address || "—"}`,
    "",
    `*Curso:* ${row.course_title || "Formação em Processos Imigratórios"}`,
    `*Plano:* ${row.plan_label || "—"}`,
    `*Valor:* ${brl(Number(row.amount))}`,
    `*Parcelas:* ${row.installments || "—"}`,
    `*Pagamento:* ${methodLabel(row)}`,
    `*ID:* ${row.payment_id || "—"}`,
    row.note ? `*Obs:* ${row.note}` : "",
    "",
    "Time: formalizar o contrato deste aluno.",
  ]
    .filter(Boolean)
    .join("\n");
  const url = getWhatsAppUrl(text);
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}

function exportCsv(rows: EnrollmentRow[]) {
  const headers = [
    "quando",
    "status",
    "nome",
    "cpf",
    "rg",
    "nascimento",
    "email",
    "telefone",
    "cep",
    "endereco",
    "numero",
    "complemento",
    "bairro",
    "cidade",
    "uf",
    "plano",
    "valor",
    "parcelas",
    "metodo",
    "pagamento_id",
    "origem",
    "obs",
  ];
  const lines = rows.map((r) =>
    [
      when(r.created_at),
      statusLabel(r.status),
      r.name,
      r.cpf,
      r.rg,
      r.birth_date,
      r.email,
      r.phone,
      r.cep,
      r.street,
      r.number,
      r.complement,
      r.neighborhood,
      r.city,
      r.state,
      r.plan_label,
      r.amount,
      r.installments,
      methodLabel(r),
      r.payment_id,
      r.source,
      r.note,
    ]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(","),
  );
  const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `govisa-matriculas-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
        {k}
      </p>
      <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-fg">
        {v}
      </p>
    </div>
  );
}

function ListCard({
  title,
  items,
}: {
  title: string;
  items: [string, number][];
}) {
  const max = items[0]?.[1] || 1;
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
        {title}
      </p>
      <ul className="mt-3 space-y-2.5 text-sm">
        {items.length === 0 && <li className="text-fg-muted">Sem dados ainda.</li>}
        {items.map(([k, n]) => (
          <li key={k}>
            <div className="mb-1 flex justify-between gap-3">
              <span className="truncate font-medium text-fg">{k}</span>
              <span className="tabular-nums text-fg-muted">{n}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-brand-red"
                style={{ width: `${Math.max(8, (n / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeadDetail({
  row,
  onClose,
  onDelete,
}: {
  row: EnrollmentRow;
  onClose: () => void;
  onDelete: () => void;
}) {
  const fields: [string, string][] = [
    ["Status", statusLabel(row.status)],
    ["Quando", when(row.created_at)],
    ["Pago em", when(row.paid_at)],
    ["Nome", row.name],
    ["CPF", row.cpf],
    ["RG", row.rg],
    ["Nascimento", row.birth_date],
    ["E-mail", row.email],
    ["WhatsApp", row.phone],
    ["CEP", row.cep],
    ["Endereço", [row.street, row.number, row.complement].filter(Boolean).join(", ")],
    ["Bairro", row.neighborhood],
    ["Cidade", row.city],
    ["UF", row.state],
    ["Curso", row.course_title],
    ["Plano", row.plan_label],
    ["Valor", brl(Number(row.amount))],
    ["Parcelas", String(row.installments || "—")],
    ["Método", methodLabel(row)],
    ["ID pagamento", row.payment_id || "—"],
    ["Origem", row.source || "—"],
    ["Obs", row.note || "—"],
  ];
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 px-3 py-4 sm:items-center">
      <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-2xl)] border border-border bg-bg-elevated p-5 shadow-[var(--shadow-soft)] md:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-line">
              Ficha completa
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold text-fg">
              {row.name || "Sem nome"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 items-center justify-center rounded-[var(--radius-md)] border border-border text-fg-muted"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {fields.map(([k, v]) => (
            <div key={k} className="rounded-[var(--radius-md)] border border-border px-3 py-2.5">
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
                {k}
              </dt>
              <dd className="mt-1 break-words text-sm text-fg">{v || "—"}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => shareEnrollment(row)}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-wa text-sm font-bold text-white"
          >
            <MessageCircle className="size-4" />
            Enviar no WhatsApp
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-border text-sm font-semibold"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-brand-red/40 px-4 text-sm font-semibold text-brand-red"
          >
            <Trash2 className="size-4" />
            Apagar
          </button>
        </div>
      </div>
    </div>
  );
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
  const [tab, setTab] = useState<Tab>("geral");
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [vq, setVq] = useState("");
  const [open, setOpen] = useState<EnrollmentRow | null>(null);

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
    const [enroll, traffic] = await Promise.all([
      listEnrollments({ data: { password: pass } }),
      listVisits({ data: { password: pass } }),
    ]);
    setLoading(false);
    if (!enroll.ok) {
      setError(enroll.error);
      setAuthed(false);
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }
    setRows(enroll.rows);
    setVisits(traffic.ok ? traffic.rows : []);
    setAuthed(true);
    sessionStorage.setItem(SESSION_KEY, pass);
  }

  async function onClear() {
    const pass = sessionStorage.getItem(SESSION_KEY) || "";
    setClearing(true);
    setError(null);
    if (tab === "acessos") {
      const res = await clearVisits({ data: { password: pass } });
      setClearing(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setVisits([]);
      setConfirmClear(false);
      return;
    }
    const res = await clearEnrollments({ data: { password: pass } });
    setClearing(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setRows([]);
    setOpen(null);
    setConfirmClear(false);
  }

  async function onDeleteOne(id: string) {
    const pass = sessionStorage.getItem(SESSION_KEY) || "";
    setError(null);
    const res = await deleteEnrollment({ data: { password: pass, id } });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    setOpen(null);
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    await load(password.trim());
  }

  const people = useMemo(
    () => new Set(visits.map((v) => v.session_id).filter(Boolean)).size,
    [visits],
  );
  const visitsToday = visits.filter((v) => isToday(v.created_at)).length;
  const peopleToday = new Set(
    visits.filter((v) => isToday(v.created_at)).map((v) => v.session_id),
  ).size;
  const matriculaHits = visits.filter((v) => v.path.startsWith("/matricula")).length;
  const paid = rows.filter((r) => r.status === "paid");
  const refused = rows.filter((r) => r.status === "refused" || r.status === "failed");
  const pix = rows.filter((r) => r.status === "pix_seller");
  const started = rows.filter((r) => r.status === "started" || r.status === "pending");
  const revenue = paid.reduce((acc, r) => acc + Number(r.amount || 0), 0);
  const conv =
    people > 0 ? `${((rows.length / people) * 100).toFixed(1)}%` : "0%";

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
        r.source,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [rows, q, status]);

  const visitRows = useMemo(() => {
    const term = vq.trim().toLowerCase();
    return visits.filter((v) => {
      if (!term) return true;
      return [
        v.path,
        v.source,
        v.referrer,
        v.utm_source,
        v.utm_campaign,
        v.utm_medium,
        v.landing,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [visits, vq]);

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
            Dashboard
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
            <p className="text-sm font-semibold text-fg">Dashboard completo</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void load(sessionStorage.getItem(SESSION_KEY) || "")}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-border px-3 text-xs font-semibold text-fg-muted hover:text-fg"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </button>
            {tab !== "geral" && (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-brand-red/40 px-3 text-xs font-semibold text-brand-red hover:bg-brand-red-soft"
              >
                <Trash2 className="size-3.5" />
                Limpar
              </button>
            )}
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
        {error && (
          <p className="mb-4 rounded-[var(--radius-md)] border border-brand-red/40 bg-brand-red-soft px-4 py-2 text-sm text-brand-red">
            {error}
          </p>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ["geral", "Visão geral"],
              ["matriculas", "Matrículas"],
              ["acessos", "Acessos"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={
                tab === id
                  ? "h-10 rounded-[var(--radius-md)] bg-brand-red px-4 text-sm font-bold text-white"
                  : "h-10 rounded-[var(--radius-md)] border border-border px-4 text-sm font-semibold text-fg-muted"
              }
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "geral" && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat k="Pessoas no site" v={String(people)} />
              <Stat k="Acessos hoje" v={`${visitsToday} · ${peopleToday} pessoas`} />
              <Stat k="Abriram matrícula" v={String(matriculaHits)} />
              <Stat k="Fichas / conversão" v={`${rows.length} · ${conv}`} />
              <Stat k="Pagas" v={String(paid.length)} />
              <Stat k="Recusadas" v={String(refused.length)} />
              <Stat k="Pix vendedor" v={String(pix.length)} />
              <Stat k="Faturado" v={brl(revenue)} />
            </div>

            <div className="mt-6 rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
                Funil
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {[
                  ["Visitou o site", people],
                  ["Abriu /matricula", matriculaHits],
                  ["Preencheu / tentou", rows.length],
                  ["Pagou", paid.length],
                ].map(([k, n]) => (
                  <div key={String(k)}>
                    <p className="text-xs text-fg-muted">{k}</p>
                    <p className="font-display text-2xl font-extrabold tabular-nums text-fg">
                      {n}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <ListCard title="Origem do tráfego" items={topCounts(visits.map((v) => v.source))} />
              <ListCard
                title="Campanha"
                items={topCounts(visits.map((v) => v.utm_campaign || "sem campanha"))}
              />
              <ListCard title="Páginas" items={topCounts(visits.map((v) => v.path))} />
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
                  Últimas fichas
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {rows.slice(0, 8).length === 0 && (
                    <li className="text-fg-muted">Nenhuma ficha ainda.</li>
                  )}
                  {rows.slice(0, 8).map((r) => (
                    <li key={r.id} className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setOpen(r)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="font-semibold text-fg">{r.name || "Sem nome"}</span>
                        <span className="mt-0.5 block text-xs text-fg-muted">
                          {r.phone || r.email} · {r.plan_label}
                        </span>
                      </button>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className={statusClass(r.status)}>{statusLabel(r.status)}</span>
                        <button
                          type="button"
                          onClick={() => shareEnrollment(r)}
                          className="inline-flex size-8 items-center justify-center rounded-full bg-wa text-white"
                          aria-label="Enviar no WhatsApp"
                        >
                          <MessageCircle className="size-3.5" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
                  Últimos acessos
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {visits.slice(0, 8).length === 0 && (
                    <li className="text-fg-muted">Nenhum acesso ainda.</li>
                  )}
                  {visits.slice(0, 8).map((v) => (
                    <li key={v.id} className="flex justify-between gap-3">
                      <span className="truncate">
                        <span className="font-medium text-fg">{v.path}</span>
                        <span className="mt-0.5 block text-xs text-fg-muted">
                          {v.source}
                          {v.utm_campaign ? ` · ${v.utm_campaign}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-fg-muted">{when(v.created_at)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        {tab === "matriculas" && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Stat k="Tentativas" v={String(rows.length)} />
              <Stat k="Pagas" v={String(paid.length)} />
              <Stat k="Recusadas" v={String(refused.length)} />
              <Stat k="Iniciadas" v={String(started.length)} />
              <Stat k="Faturado" v={brl(revenue)} />
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
              <button
                type="button"
                onClick={() => exportCsv(filtered)}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-border px-4 text-xs font-semibold text-fg-muted hover:text-fg"
              >
                <Download className="size-3.5" />
                CSV
              </button>
            </div>

            <div className="mt-5 overflow-x-auto rounded-[var(--radius-xl)] border border-border">
              <table className="min-w-[1100px] w-full text-left text-sm">
                <thead className="bg-bg-elevated text-[11px] uppercase tracking-[0.1em] text-fg-subtle">
                  <tr>
                    {["Quando", "Status", "Aluno", "Contato", "Endereço", "Plano", "Valor", "Pagamento", ""].map(
                      (h, i) => (
                        <th key={`${h}-${i}`} className="px-4 py-3 font-bold">
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-fg-muted">
                        {loading ? "Carregando…" : "Nenhuma matrícula ainda."}
                      </td>
                    </tr>
                  )}
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="cursor-pointer border-t border-border align-top hover:bg-bg-elevated/60"
                      onClick={() => setOpen(r)}
                    >
                      <td className="px-4 py-3 text-xs text-fg-muted">{when(r.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={statusClass(r.status)}>{statusLabel(r.status)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-fg">{r.name}</p>
                        <p className="text-xs text-fg-muted">CPF {r.cpf || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-fg-muted">
                        <p>{r.email}</p>
                        <p>{r.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-fg-muted">
                        {[r.city, r.state].filter(Boolean).join("/") || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-fg-muted">{r.plan_label || "—"}</td>
                      <td className="px-4 py-3 font-semibold text-fg">{brl(Number(r.amount))}</td>
                      <td className="px-4 py-3 text-xs text-fg-muted">
                        <p>{methodLabel(r)}</p>
                        <p>{r.payment_id || r.note || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareEnrollment(r);
                          }}
                          className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] bg-wa px-3 text-[11px] font-bold text-white"
                        >
                          <MessageCircle className="size-3.5" />
                          WhatsApp
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-fg-subtle">Clique na linha para ver a ficha completa.</p>
          </>
        )}

        {tab === "acessos" && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat k="Acessos" v={String(visits.length)} />
              <Stat k="Pessoas" v={String(people)} />
              <Stat k="Hoje" v={String(visitsToday)} />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <ListCard title="De onde veio" items={topCounts(visits.map((v) => v.source))} />
              <ListCard
                title="Campanha"
                items={topCounts(visits.map((v) => v.utm_campaign || "sem campanha"))}
              />
              <ListCard title="Páginas" items={topCounts(visits.map((v) => v.path))} />
            </div>
            <div className="relative mt-6">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
              <input
                value={vq}
                onChange={(e) => setVq(e.target.value)}
                placeholder="Buscar origem, campanha, página…"
                className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg-elevated pl-10 pr-4 text-sm text-fg outline-none"
              />
            </div>
            <div className="mt-5 overflow-x-auto rounded-[var(--radius-xl)] border border-border">
              <table className="min-w-[960px] w-full text-left text-sm">
                <thead className="bg-bg-elevated text-[11px] uppercase tracking-[0.1em] text-fg-subtle">
                  <tr>
                    {["Quando", "Página", "Origem", "Campanha", "Mídia", "Primeira página", "Veio de"].map(
                      (h) => (
                        <th key={h} className="px-4 py-3 font-bold">
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visitRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-fg-muted">
                        Nenhum acesso ainda.
                      </td>
                    </tr>
                  )}
                  {visitRows.map((v) => (
                    <tr key={v.id} className="border-t border-border align-top">
                      <td className="px-4 py-3 text-xs text-fg-muted">{when(v.created_at)}</td>
                      <td className="px-4 py-3 font-medium text-fg">{v.path}</td>
                      <td className="px-4 py-3 font-semibold text-fg">{v.source}</td>
                      <td className="px-4 py-3 text-xs text-fg-muted">{v.utm_campaign || "—"}</td>
                      <td className="px-4 py-3 text-xs text-fg-muted">{v.utm_medium || "—"}</td>
                      <td className="px-4 py-3 text-xs text-fg-muted">{v.landing || "—"}</td>
                      <td className="px-4 py-3 text-xs text-fg-muted">
                        {v.referrer_host || (v.referrer ? v.referrer : "direto")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {open && (
        <LeadDetail
          row={open}
          onClose={() => setOpen(null)}
          onDelete={() => {
            if (window.confirm(`Apagar ${open.name || "este registro"}?`)) {
              void onDeleteOne(open.id);
            }
          }}
        />
      )}

      {confirmClear && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-[var(--radius-2xl)] border border-border bg-bg-elevated p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-xl font-extrabold text-fg">
              {tab === "acessos" ? "Zerar os acessos?" : "Limpar matrículas?"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {tab === "acessos"
                ? "Isso apaga todos os acessos rastreados. Não dá para desfazer."
                : "Isso apaga todas as tentativas e matrículas. Não dá para desfazer."}
            </p>
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
