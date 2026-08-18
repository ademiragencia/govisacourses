import type { EnrollmentRow } from "./enrollments";
import type { VisitRow } from "./visits";

export function waLead(phone: string, text: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length < 10) return null;
  const n = d.startsWith("55") ? d : `55${d}`;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

export function recoveryMessage(row: EnrollmentRow) {
  const first = (row.name || "tudo bem").split(" ")[0];
  if (row.status === "pending" && row.method === "pix") {
    return `Oi ${first}, sou da Go Visa Courses. Vi que você gerou o Pix da formação e ainda não caiu. Seu valor de hoje continua ativo. Quer que eu te envie o código de novo agora?`;
  }
  return `Oi ${first}, sou da Go Visa Courses. Vi que você começou a matrícula da Formação em Processos Imigratórios e não concluiu. Ainda tem vaga na turma. Posso te ajudar a garantir agora?`;
}

export function minutesAgo(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / 60000;
}

export function isAbandoned(row: EnrollmentRow) {
  return row.status === "started" || row.status === "pending" || row.status === "pix_seller";
}

export function needsRecovery(row: EnrollmentRow) {
  return isAbandoned(row) && minutesAgo(row.created_at) >= 30 && Boolean(row.phone);
}

export const PIPELINE = [
  { id: "pago", label: "Pago" },
  { id: "contrato_enviado", label: "Contrato enviado" },
  { id: "assinado", label: "Assinado" },
  { id: "acesso_liberado", label: "Acesso liberado" },
] as const;

export function pipelineLabel(id: string) {
  return PIPELINE.find((p) => p.id === id)?.label || "Pago";
}

export function dailyReport(input: {
  visits: VisitRow[];
  paid: EnrollmentRow[];
  abandoned: EnrollmentRow[];
  revenue: number;
  pixPending: number;
}) {
  const today = new Date().toLocaleDateString("pt-BR");
  const visitsToday = input.visits.filter(
    (v) => new Date(v.created_at).toDateString() === new Date().toDateString(),
  ).length;
  const paidToday = input.paid.filter(
    (r) => r.paid_at && new Date(r.paid_at).toDateString() === new Date().toDateString(),
  );
  const revToday = paidToday.reduce((a, r) => a + Number(r.amount || 0), 0);
  return [
    `*GO VISA — RELATÓRIO ${today}*`,
    `Acessos hoje: ${visitsToday}`,
    `Pagas hoje: ${paidToday.length}`,
    `Faturado hoje: ${revToday.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    `Pagas no total: ${input.paid.length}`,
    `Faturado no total: ${input.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    `Abandonos: ${input.abandoned.length}`,
    `Pix pendente no Asaas: ${input.pixPending.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
  ].join("\n");
}

export function adRanking(visits: VisitRow[], paid: EnrollmentRow[]) {
  const map = new Map<
    string,
    { source: string; visits: number; paid: number; revenue: number }
  >();
  const keyOf = (source: string, campaign?: string) => {
    const s = source.trim() || "direto";
    const c = (campaign || "").trim();
    return c ? `${s} · ${c}` : s;
  };
  for (const v of visits) {
    const k = keyOf(v.source, v.utm_campaign);
    const cur = map.get(k) || { source: k, visits: 0, paid: 0, revenue: 0 };
    cur.visits += 1;
    map.set(k, cur);
  }
  for (const r of paid) {
    const k = keyOf(r.source || "direto");
    const cur = map.get(k) || { source: k, visits: 0, paid: 0, revenue: 0 };
    cur.paid += 1;
    cur.revenue += Number(r.amount || 0);
    map.set(k, cur);
  }
  return [...map.values()].sort((a, b) => b.paid - a.paid || b.visits - a.visits);
}

export function parcelChargeMessage(name: string, value: number, date: string) {
  const first = (name || "tudo bem").split(" ")[0];
  const money = value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return `Oi ${first}, passando pra lembrar da parcela da formação Go Visa: ${money} no Pix, vencimento ${date}. Se preferir, te mando o código agora.`;
}

export function accessMessage(row: EnrollmentRow) {
  const first = (row.name || "tudo bem").split(" ")[0];
  return `Oi ${first}, sua matrícula na Formação em Processos Imigratórios está confirmada e o acesso vai ser liberado. Qualquer dúvida é só responder aqui.`;
}

export function beep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = 0.06;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.2);
  } catch {
    /* sem áudio */
  }
}

export function findLeadByName(rows: EnrollmentRow[], name: string) {
  const n = name.toLowerCase().trim();
  if (!n) return undefined;
  return (
    rows.find((r) => r.name.toLowerCase() === n) ||
    rows.find(
      (r) =>
        n.includes(r.name.toLowerCase()) ||
        r.name.toLowerCase().includes(n.split(" ")[0]),
    )
  );
}
