import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Copy,
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
  setEnrollmentOps,
  type EnrollmentRow,
} from "@/lib/enrollments";
import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  setCouponActive,
  type CouponRow,
} from "@/lib/coupons";
import { listFinance, type FinanceSummary } from "@/lib/asaas-finance";
import { createTeamUser, deleteTeamUser, listTeam, type TeamRow } from "@/lib/team";
import { type PanelUser } from "@/lib/panel-auth";
import { clearVisits, listVisits, type VisitRow } from "@/lib/visits";
import { getWhatsAppUrl } from "@/lib/config";
import { SITE_URL } from "@/lib/seo";
import {
  adRanking,
  dailyReport,
  isAbandoned,
  needsRecovery,
  PIPELINE,
  pipelineLabel,
  recoveryMessage,
  waLead,
} from "@/lib/panel-helpers";

const SESSION_KEY = "gv_painel_session";

function sessionPass() {
  const raw = sessionStorage.getItem(SESSION_KEY) || "";
  try {
    return String((JSON.parse(raw) as { password?: string }).password || "");
  } catch {
    return raw;
  }
}

type Tab =
  | "geral"
  | "financeiro"
  | "matriculas"
  | "abandono"
  | "anuncios"
  | "acessos"
  | "cupons"
  | "equipe";

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

function dateBr(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
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
  onPipeline,
  onContact,
}: {
  row: EnrollmentRow;
  onClose: () => void;
  onDelete: () => void;
  onPipeline?: (pipeline: string) => void;
  onContact?: (note: string) => void;
}) {
  const [note, setNote] = useState(row.follow_up || "");
  const leadWa = waLead(row.phone, recoveryMessage(row));
  const fields: [string, string][] = [
    ["Status", statusLabel(row.status)],
    ["Comercial", pipelineLabel(row.pipeline || (row.status === "paid" ? "pago" : ""))],
    ["Atendido por", row.owner || "—"],
    ["Quando", when(row.created_at)],
    ["Pago em", when(row.paid_at)],
    ["Nome", row.name],
    ["CPF", row.cpf],
    ["Nascimento", row.birth_date],
    ["E-mail", row.email],
    ["WhatsApp", row.phone],
    [
      "Endereço",
      [row.street, row.number, row.city, row.state].filter(Boolean).join(", "),
    ],
    ["Plano", row.plan_label],
    ["Valor", brl(Number(row.amount))],
    ["Cupom", row.coupon_code || "—"],
    ["Método", methodLabel(row)],
    ["ID pagamento", row.payment_id || "—"],
    ["Origem", row.source || "—"],
    ["Último contato", when(row.contacted_at)],
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
        {row.status === "paid" && onPipeline && (
          <div className="mt-4 flex flex-wrap gap-2">
            {PIPELINE.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPipeline(p.id)}
                className={
                  (row.pipeline || "pago") === p.id
                    ? "h-8 rounded-full bg-wa px-3 text-[11px] font-bold text-white"
                    : "h-8 rounded-full border border-border px-3 text-[11px] font-semibold text-fg-muted"
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
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
        {onContact && (
          <label className="mt-4 block text-xs font-bold uppercase tracking-[0.12em] text-fg-subtle">
            Anotação do time
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm font-normal normal-case tracking-normal text-fg"
              placeholder="Ex.: pediu para ligar amanhã, ficou de pagar o Pix..."
            />
          </label>
        )}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => shareEnrollment(row)}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-wa text-sm font-bold text-white"
          >
            <MessageCircle className="size-4" />
            Ficha pro time
          </button>
          {leadWa && (
            <a
              href={leadWa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-wa/40 text-sm font-bold text-wa"
            >
              Chamar aluno
            </a>
          )}
          {onContact && (
            <button
              type="button"
              onClick={() => onContact(note)}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-border text-sm font-semibold"
            >
              Salvar contato
            </button>
          )}
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
  const [me, setMe] = useState<PanelUser | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [q, setQ] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [tab, setTab] = useState<Tab>("geral");
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [vq, setVq] = useState("");
  const [open, setOpen] = useState<EnrollmentRow | null>(null);
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [couponForm, setCouponForm] = useState({
    code: "",
    kind: "fixed",
    amount: "500",
    applies_to: "pix_cash",
    note: "",
    max_uses: "",
  });
  const [couponBusy, setCouponBusy] = useState(false);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [teamForm, setTeamForm] = useState({ name: "", userPassword: "", role: "sdr" });
  const [reportCopied, setReportCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as { password?: string };
      if (saved.password) {
        setAuthed(true);
        void load(saved.password);
        return;
      }
    } catch {
      setAuthed(true);
      void load(raw);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    const id = window.setInterval(() => void load(sessionPass()), 45000);
    return () => window.clearInterval(id);
  }, [authed]);

  async function load(pass: string) {
    setLoading(true);
    setError(null);
    const [enroll, traffic, cupons, money, peopleTeam] = await Promise.all([
      listEnrollments({ data: { password: pass } }),
      listVisits({ data: { password: pass } }),
      listCoupons({ data: { password: pass } }),
      listFinance({ data: { password: pass } }),
      listTeam({ data: { password: pass } }),
    ]);
    setLoading(false);
    if (!enroll.ok) {
      setError(enroll.error);
      setAuthed(false);
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }
    setRows(enroll.rows);
    setMe(enroll.user);
    setVisits(traffic.ok ? traffic.rows : []);
    setCoupons(cupons.ok ? cupons.rows : []);
    setFinance(money.ok ? money.summary : null);
    setTeam(peopleTeam.ok ? peopleTeam.rows : []);
    setAuthed(true);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ password: pass }));
  }

  async function onClear() {
    const pass = sessionPass();
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
    const pass = sessionPass();
    setError(null);
    const res = await deleteEnrollment({ data: { password: pass, id } });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    setOpen(null);
  }

  async function onCreateCoupon(e: FormEvent) {
    e.preventDefault();
    const pass = sessionPass();
    setCouponBusy(true);
    setError(null);
    const res = await createCoupon({
      data: {
        password: pass,
        code: couponForm.code,
        kind: couponForm.kind,
        amount: Number(couponForm.amount),
        applies_to: couponForm.applies_to,
        note: couponForm.note,
        max_uses: couponForm.max_uses,
        active: true,
      },
    });
    setCouponBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCoupons((prev) => [res.row, ...prev.filter((c) => c.id !== res.row.id)]);
    setCouponForm({
      code: "",
      kind: "fixed",
      amount: "500",
      applies_to: "pix_cash",
      note: "",
      max_uses: "",
    });
  }

  async function onToggleCoupon(row: CouponRow) {
    const pass = sessionPass();
    const res = await setCouponActive({
      data: { password: pass, id: row.id, active: !row.active },
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCoupons((prev) => prev.map((c) => (c.id === res.row.id ? res.row : c)));
  }

  async function onDeleteCoupon(id: string) {
    const pass = sessionPass();
    const res = await deleteCoupon({ data: { password: pass, id } });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  async function onPipeline(id: string, pipeline: string) {
    const pass = sessionPass();
    const res = await setEnrollmentOps({
      data: { password: pass, id, pipeline, owner: me?.name || "" },
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === res.row.id ? res.row : r)));
    setOpen(res.row);
  }

  async function onContact(id: string, followUp?: string) {
    const pass = sessionPass();
    const res = await setEnrollmentOps({
      data: {
        password: pass,
        id,
        owner: me?.name || "",
        contacted: true,
        follow_up: followUp,
      },
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === res.row.id ? res.row : r)));
    setOpen((cur) => (cur?.id === res.row.id ? res.row : cur));
  }

  async function onCreateTeam(e: FormEvent) {
    e.preventDefault();
    const pass = sessionPass();
    const res = await createTeamUser({
      data: {
        password: pass,
        name: teamForm.name,
        userPassword: teamForm.userPassword,
        role: teamForm.role,
      },
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setTeam((prev) => [res.row, ...prev]);
    setTeamForm({ name: "", userPassword: "", role: "sdr" });
  }

  async function onDeleteTeam(id: string) {
    const pass = sessionPass();
    const res = await deleteTeamUser({ data: { password: pass, id } });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setTeam((prev) => prev.filter((t) => t.id !== id));
  }

  async function copyReport() {
    const paidNow = rows.filter((r) => r.status === "paid");
    const text = dailyReport({
      visits,
      paid: paidNow,
      abandoned: rows.filter(isAbandoned),
      revenue: paidNow.reduce((a, r) => a + Number(r.amount || 0), 0),
      pixPending: finance?.pixPending || 0,
    });
    try {
      await navigator.clipboard.writeText(text);
      setReportCopied(true);
      window.setTimeout(() => setReportCopied(false), 2000);
    } catch {
      setError("Não deu para copiar o relatório.");
    }
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
      if (r.status !== "paid") return false;
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
  }, [rows, q]);

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
            <p className="text-sm font-semibold text-fg">
              {me ? me.name : "Dashboard"}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => void copyReport()}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-border px-3 text-xs font-semibold text-fg-muted hover:text-fg"
            >
              <Copy className="size-3.5" />
              {reportCopied ? "Copiado" : "Relatório do dia"}
            </button>
            <button
              type="button"
              onClick={() => void load(sessionPass())}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-border px-3 text-xs font-semibold text-fg-muted hover:text-fg"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </button>
            {me?.role === "admin" && tab !== "geral" && tab !== "cupons" && tab !== "financeiro" && tab !== "equipe" && tab !== "anuncios" && (
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
              ["financeiro", "Financeiro"],
              ["matriculas", "Matrículas"],
              ["abandono", "Abandono"],
              ["anuncios", "Anúncios"],
              ["acessos", "Acessos"],
              ["cupons", "Cupons"],
              ["equipe", "Equipe"],
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

            <div className="mt-4 rounded-[var(--radius-lg)] border border-brand-red/30 bg-brand-red-soft p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-red">
                Precisa de ação
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  {rows.filter((r) => needsRecovery(r) && !r.contacted_at).length} abandono
                  {rows.filter((r) => needsRecovery(r) && !r.contacted_at).length === 1 ? "" : "s"} sem contato
                </li>
                <li>
                  {paid.filter((r) => !r.pipeline || r.pipeline === "pago").length} pago
                  {paid.filter((r) => !r.pipeline || r.pipeline === "pago").length === 1 ? "" : "s"} sem contrato enviado
                </li>
                <li>
                  A receber: {brl(finance?.toReceive || 0)}
                  {finance?.calendar[0]
                    ? ` · próximo ${dateBr(finance.calendar[0].date)} (${finance.calendar[0].customerName})`
                    : ""}
                </li>
              </ul>
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

        {tab === "financeiro" && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat k="Recebido (líquido)" v={brl(finance?.received || 0)} />
              <Stat k="Pendente" v={brl(finance?.pending || 0)} />
              <Stat k="Pix pendente" v={brl(finance?.pixPending || 0)} />
              <Stat k="Cartão confirmado" v={brl(finance?.cardConfirmed || 0)} />
              <Stat k="A receber" v={brl(finance?.toReceive || 0)} />
            </div>

            {(finance?.subscriptions || []).length > 0 && (
              <div className="mt-5 space-y-4">
                {finance?.subscriptions.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold-line">
                          Pix recorrente
                        </p>
                        <p className="mt-1 font-display text-xl font-extrabold text-fg">
                          {s.customerName}
                        </p>
                        <p className="text-sm text-fg-muted">
                          {s.maxPayments}× {brl(s.value)} · falta {s.remaining} · {brl(s.remainingValue)}
                        </p>
                      </div>
                      <span className={statusClass(s.status === "ACTIVE" ? "paid" : "pending")}>
                        {s.status}
                      </span>
                    </div>
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-[520px] w-full text-left text-sm">
                        <thead className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle">
                          <tr>
                            <th className="py-2 pr-3">Parcela</th>
                            <th className="py-2 pr-3">Data</th>
                            <th className="py-2 pr-3">Valor</th>
                            <th className="py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.parcels.map((p, i) => (
                            <tr key={`${s.id}-${p.date}-${i}`} className="border-t border-border">
                              <td className="py-2 pr-3">{i + 1}/{s.parcels.length}</td>
                              <td className="py-2 pr-3">{dateBr(p.date)}</td>
                              <td className="py-2 pr-3 font-semibold">{brl(p.value)}</td>
                              <td className="py-2">
                                <span
                                  className={statusClass(
                                    p.status === "RECEIVED" || p.status === "CONFIRMED"
                                      ? "paid"
                                      : p.status === "SCHEDULED"
                                        ? "started"
                                        : "pending",
                                  )}
                                >
                                  {p.status === "SCHEDULED"
                                    ? "A gerar"
                                    : p.status === "PENDING"
                                      ? "A receber"
                                      : p.status === "RECEIVED" || p.status === "CONFIRMED"
                                        ? "Pago"
                                        : p.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 overflow-x-auto rounded-[var(--radius-xl)] border border-border">
              <table className="min-w-[860px] w-full text-left text-sm">
                <thead className="bg-bg-elevated text-[11px] uppercase tracking-[0.1em] text-fg-subtle">
                  <tr>
                    {["Quando", "Tipo", "Status", "Valor", "Líquido", "Descrição"].map((h) => (
                      <th key={h} className="px-4 py-3 font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(finance?.payments || []).length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-fg-muted">
                        Nenhuma cobrança no Asaas ainda.
                      </td>
                    </tr>
                  )}
                  {(finance?.payments || []).map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-4 py-3 text-xs text-fg-muted">{p.dateCreated}</td>
                      <td className="px-4 py-3">{p.billingType === "PIX" ? "Pix" : "Cartão"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={statusClass(
                            p.status === "CONFIRMED" || p.status === "RECEIVED"
                              ? "paid"
                              : p.status === "OVERDUE"
                                ? "refused"
                                : "pending",
                          )}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{brl(p.value)}</td>
                      <td className="px-4 py-3">{brl(p.netValue)}</td>
                      <td className="px-4 py-3 text-xs text-fg-muted">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "matriculas" && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat k="Pagas" v={String(paid.length)} />
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
                        {loading ? "Carregando…" : "Nenhuma matrícula paga ainda."}
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

        {tab === "abandono" && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat k="Abandonos" v={String(rows.filter(isAbandoned).length)} />
              <Stat k="Recuperar agora" v={String(rows.filter(needsRecovery).length)} />
              <Stat k="Com WhatsApp" v={String(rows.filter((r) => isAbandoned(r) && r.phone).length)} />
            </div>
            <div className="mt-5 overflow-x-auto rounded-[var(--radius-xl)] border border-border">
              <table className="min-w-[820px] w-full text-left text-sm">
                <thead className="bg-bg-elevated text-[11px] uppercase tracking-[0.1em] text-fg-subtle">
                  <tr>
                    {["Quando", "Aluno", "WhatsApp", "Plano", "Status", ""].map((h) => (
                      <th key={h} className="px-4 py-3 font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.filter(isAbandoned).length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-fg-muted">
                        Ninguém abandonou a matrícula.
                      </td>
                    </tr>
                  )}
                  {rows.filter(isAbandoned).map((r) => {
                    const href = waLead(r.phone, recoveryMessage(r));
                    return (
                      <tr key={r.id} className="border-t border-border">
                        <td className="px-4 py-3 text-xs text-fg-muted">{when(r.created_at)}</td>
                        <td className="px-4 py-3 font-semibold">{r.name || "Sem nome"}</td>
                        <td className="px-4 py-3">{r.phone || "—"}</td>
                        <td className="px-4 py-3 text-xs text-fg-muted">{r.plan_label}</td>
                        <td className="px-4 py-3">
                          <span className={statusClass(r.status)}>{statusLabel(r.status)}</span>
                          {needsRecovery(r) && (
                            <span className="ml-2 text-[11px] font-bold uppercase text-brand-red">
                              +30 min
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {href ? (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-wa px-3 text-xs font-bold text-white"
                              >
                                <MessageCircle className="size-3.5" />
                                Chamar agora
                              </a>
                            ) : (
                              <span className="text-xs text-fg-subtle">Sem número</span>
                            )}
                            <button
                              type="button"
                              onClick={() => void onContact(r.id)}
                              className="inline-flex h-9 items-center rounded-full border border-border px-3 text-xs font-semibold text-fg-muted"
                            >
                              {r.contacted_at ? "Chamado" : "Já chamei"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "anuncios" && (
          <>
            <p className="mb-4 text-sm text-fg-muted">
              Quem gerou pagamento de verdade, não só clique.
            </p>
            <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-border">
              <table className="min-w-[640px] w-full text-left text-sm">
                <thead className="bg-bg-elevated text-[11px] uppercase tracking-[0.1em] text-fg-subtle">
                  <tr>
                    {["Origem / campanha", "Acessos", "Pagos", "Faturado"].map((h) => (
                      <th key={h} className="px-4 py-3 font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {adRanking(visits, paid).length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-fg-muted">
                        Sem tráfego ainda.
                      </td>
                    </tr>
                  )}
                  {adRanking(visits, paid).map((a) => (
                    <tr key={a.source} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold">{a.source}</td>
                      <td className="px-4 py-3">{a.visits}</td>
                      <td className="px-4 py-3">{a.paid}</td>
                      <td className="px-4 py-3 font-semibold">{brl(a.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

        {tab === "cupons" && (
          <>
            <form
              onSubmit={(e) => void onCreateCoupon(e)}
              className="rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold-line">
                Novo cupom
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-fg-subtle">
                  Código
                  <input
                    required
                    value={couponForm.code}
                    onChange={(e) =>
                      setCouponForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                    }
                    className="mt-1.5 h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 text-sm font-semibold uppercase text-fg"
                    placeholder="DESC500"
                  />
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-fg-subtle">
                  Tipo
                  <select
                    value={couponForm.kind}
                    onChange={(e) => setCouponForm((f) => ({ ...f, kind: e.target.value }))}
                    className="mt-1.5 h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 text-sm text-fg"
                  >
                    <option value="fixed">Reais (R$)</option>
                    <option value="percent">Porcentagem (%)</option>
                  </select>
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-fg-subtle">
                  Valor
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={couponForm.amount}
                    onChange={(e) => setCouponForm((f) => ({ ...f, amount: e.target.value }))}
                    className="mt-1.5 h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 text-sm text-fg"
                  />
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-fg-subtle">
                  Vale para
                  <select
                    value={couponForm.applies_to}
                    onChange={(e) =>
                      setCouponForm((f) => ({ ...f, applies_to: e.target.value }))
                    }
                    className="mt-1.5 h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 text-sm text-fg"
                  >
                    <option value="pix_cash">Só Pix à vista</option>
                    <option value="pix">Qualquer Pix</option>
                    <option value="card">Cartão</option>
                    <option value="all">Tudo</option>
                  </select>
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-fg-subtle">
                  Limite de usos
                  <input
                    type="number"
                    min="1"
                    value={couponForm.max_uses}
                    onChange={(e) => setCouponForm((f) => ({ ...f, max_uses: e.target.value }))}
                    className="mt-1.5 h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 text-sm text-fg"
                    placeholder="Ilimitado"
                  />
                </label>
                <label className="block text-xs font-bold uppercase tracking-[0.1em] text-fg-subtle">
                  Observação
                  <input
                    value={couponForm.note}
                    onChange={(e) => setCouponForm((f) => ({ ...f, note: e.target.value }))}
                    className="mt-1.5 h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 text-sm text-fg"
                    placeholder="R$ 500 off no Pix"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={couponBusy}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-brand-red px-5 text-sm font-bold uppercase tracking-[0.04em] text-white disabled:opacity-70"
              >
                {couponBusy ? "Salvando…" : "Criar cupom"}
              </button>
            </form>

            <div className="mt-5 overflow-x-auto rounded-[var(--radius-xl)] border border-border">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="bg-bg-elevated text-[11px] uppercase tracking-[0.1em] text-fg-subtle">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Desconto</th>
                    <th className="px-4 py-3">Vale para</th>
                    <th className="px-4 py-3">Usos</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-fg-muted">
                        Nenhum cupom ainda.
                      </td>
                    </tr>
                  )}
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-4 py-3 font-bold text-fg">{c.code}</td>
                      <td className="px-4 py-3 text-fg">
                        {c.kind === "percent"
                          ? `${Number(c.amount)}%`
                          : brl(Number(c.amount))}
                      </td>
                      <td className="px-4 py-3 text-xs text-fg-muted">
                        {c.applies_to === "pix_cash"
                          ? "Pix à vista"
                          : c.applies_to === "pix"
                            ? "Pix"
                            : c.applies_to === "card"
                              ? "Cartão"
                              : "Tudo"}
                      </td>
                      <td className="px-4 py-3 text-fg-muted">
                        {c.uses}
                        {c.max_uses ? ` / ${c.max_uses}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <span className={c.active ? statusClass("paid") : statusClass("refused")}>
                          {c.active ? "Ativo" : "Off"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => void onToggleCoupon(c)}
                          className="mr-2 text-xs font-semibold text-fg-muted hover:text-fg"
                        >
                          {c.active ? "Desligar" : "Ligar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Apagar ${c.code}?`)) void onDeleteCoupon(c.id);
                          }}
                          className="text-xs font-semibold text-brand-red"
                        >
                          Apagar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "equipe" && (
          <>
            {me?.role !== "admin" ? (
              <p className="text-sm text-fg-muted">Só o admin gerencia acessos.</p>
            ) : (
              <>
                <form
                  onSubmit={(e) => void onCreateTeam(e)}
                  className="rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold-line">
                    Novo acesso
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <input
                      required
                      value={teamForm.name}
                      onChange={(e) => setTeamForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Nome"
                      className="h-11 rounded-[var(--radius-md)] border border-border bg-bg px-3 text-sm text-fg"
                    />
                    <input
                      required
                      value={teamForm.userPassword}
                      onChange={(e) =>
                        setTeamForm((f) => ({ ...f, userPassword: e.target.value }))
                      }
                      placeholder="Senha de entrada"
                      className="h-11 rounded-[var(--radius-md)] border border-border bg-bg px-3 text-sm text-fg"
                    />
                    <select
                      value={teamForm.role}
                      onChange={(e) => setTeamForm((f) => ({ ...f, role: e.target.value }))}
                      className="h-11 rounded-[var(--radius-md)] border border-border bg-bg px-3 text-sm text-fg"
                    >
                      <option value="sdr">SDR / comercial</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="mt-4 inline-flex h-11 items-center rounded-[var(--radius-md)] bg-brand-red px-5 text-sm font-bold uppercase tracking-[0.04em] text-white"
                  >
                    Criar acesso
                  </button>
                  <p className="mt-3 text-xs text-fg-subtle">
                    A senha mestra 386510 continua valendo para você.
                  </p>
                </form>
                <div className="mt-5 overflow-x-auto rounded-[var(--radius-xl)] border border-border">
                  <table className="min-w-[560px] w-full text-left text-sm">
                    <thead className="bg-bg-elevated text-[11px] uppercase tracking-[0.1em] text-fg-subtle">
                      <tr>
                        {["Nome", "Senha", "Função", ""].map((h) => (
                          <th key={h || "x"} className="px-4 py-3 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {team.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-fg-muted">
                            Ninguém da equipe ainda. Só a senha mestra.
                          </td>
                        </tr>
                      )}
                      {team.map((t) => (
                        <tr key={t.id} className="border-t border-border">
                          <td className="px-4 py-3 font-semibold">{t.name}</td>
                          <td className="px-4 py-3 font-mono text-xs">{t.password}</td>
                          <td className="px-4 py-3">{t.role === "admin" ? "Admin" : "SDR"}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Remover ${t.name}?`)) void onDeleteTeam(t.id);
                              }}
                              className="text-xs font-semibold text-brand-red"
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {open && (
        <LeadDetail
          row={open}
          onClose={() => setOpen(null)}
          onPipeline={(pipeline) => void onPipeline(open.id, pipeline)}
          onContact={(note) => void onContact(open.id, note)}
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
