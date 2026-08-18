import { createServerFn } from "@tanstack/react-start";
import { ASAAS_ACCESS_TOKEN, ASAAS_API } from "./asaas-credentials";
import { resolvePanelUser } from "./panel-auth";

export type FinancePayment = {
  id: string;
  status: string;
  value: number;
  netValue: number;
  billingType: string;
  description: string;
  dateCreated: string;
  dueDate: string;
  clientPaymentDate: string;
  externalReference: string;
  installment: string;
  subscription: string;
  customer: string;
  customerName: string;
};

export type ParcelRow = {
  date: string;
  value: number;
  status: string;
  billingType: string;
  customerName: string;
  description: string;
  paymentId: string;
};

export type SubscriptionRow = {
  id: string;
  customerName: string;
  value: number;
  cycle: string;
  status: string;
  nextDueDate: string;
  maxPayments: number;
  generated: number;
  remaining: number;
  remainingValue: number;
  parcels: ParcelRow[];
};

export type FinanceSummary = {
  received: number;
  pending: number;
  overdue: number;
  pixPending: number;
  cardConfirmed: number;
  countReceived: number;
  countPending: number;
  toReceive: number;
  payments: FinancePayment[];
  subscriptions: SubscriptionRow[];
  calendar: ParcelRow[];
};

async function asaas<T>(path: string): Promise<T> {
  const res = await fetch(`${ASAAS_API}${path}`, {
    headers: {
      access_token: ASAAS_ACCESS_TOKEN.trim(),
      "User-Agent": "GoVisaCourses/1.0",
    },
  });
  const json = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) throw new Error("Falha ao ler o Asaas");
  return json;
}

function addMonths(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + n, d));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function mapPay(p: Record<string, unknown>, name = ""): FinancePayment {
  return {
    id: String(p.id || ""),
    status: String(p.status || ""),
    value: Number(p.value || 0),
    netValue: Number(p.netValue || p.value || 0),
    billingType: String(p.billingType || ""),
    description: String(p.description || ""),
    dateCreated: String(p.dateCreated || ""),
    dueDate: String(p.dueDate || ""),
    clientPaymentDate: String(p.clientPaymentDate || ""),
    externalReference: String(p.externalReference || ""),
    installment: String(p.installment || ""),
    subscription: String(p.subscription || ""),
    customer: String(p.customer || ""),
    customerName: name,
  };
}

export const listFinance = createServerFn({ method: "POST" })
  .validator((data: unknown) => ({
    password: String((data as { password?: string })?.password || ""),
  }))
  .handler(async ({ data }) => {
    const user = await resolvePanelUser(data.password);
    if (!user) return { ok: false as const, error: "Senha incorreta" };
    if (!ASAAS_ACCESS_TOKEN.trim()) {
      return { ok: false as const, error: "Asaas ainda não configurado" };
    }
    try {
      const [payJson, subJson] = await Promise.all([
        asaas<{ data?: Record<string, unknown>[] }>("/payments?limit=50"),
        asaas<{ data?: Record<string, unknown>[] }>("/subscriptions?limit=20"),
      ]);
      const names = new Map<string, string>();
      const customerIds = [
        ...new Set(
          [
            ...(payJson.data || []).map((p) => String(p.customer || "")),
            ...(subJson.data || []).map((s) => String(s.customer || "")),
          ].filter(Boolean),
        ),
      ];
      await Promise.all(
        customerIds.map(async (id) => {
          try {
            const c = await asaas<{ name?: string }>(`/customers/${id}`);
            names.set(id, c.name || id);
          } catch {
            names.set(id, id);
          }
        }),
      );

      const payments = (payJson.data || []).map((p) =>
        mapPay(p, names.get(String(p.customer || "")) || ""),
      );
      const received = payments.filter(
        (p) => p.status === "CONFIRMED" || p.status === "RECEIVED",
      );
      const pending = payments.filter(
        (p) => p.status === "PENDING" || p.status === "AWAITING_RISK_ANALYSIS",
      );
      const overdue = payments.filter((p) => p.status === "OVERDUE");

      const subscriptions: SubscriptionRow[] = [];
      for (const s of subJson.data || []) {
        const id = String(s.id || "");
        const customer = String(s.customer || "");
        const customerName = names.get(customer) || customer;
        const value = Number(s.value || 0);
        const maxPayments = Number(s.maxPayments || 0);
        const nextDueDate = String(s.nextDueDate || "");
        let generatedPays: Record<string, unknown>[] = [];
        try {
          const sp = await asaas<{ data?: Record<string, unknown>[] }>(
            `/subscriptions/${id}/payments`,
          );
          generatedPays = sp.data || [];
        } catch {
          generatedPays = [];
        }
        const parcels: ParcelRow[] = generatedPays.map((p) => ({
          date: String(p.dueDate || p.dateCreated || ""),
          value: Number(p.value || value),
          status: String(p.status || "PENDING"),
          billingType: String(p.billingType || s.billingType || "PIX"),
          customerName,
          description: String(p.description || s.description || ""),
          paymentId: String(p.id || ""),
        }));
        const remaining = Math.max(0, (maxPayments || parcels.length) - parcels.length);
        let cursor = nextDueDate;
        for (let i = 0; i < remaining; i += 1) {
          parcels.push({
            date: cursor || addMonths(nextDueDate || new Date().toISOString().slice(0, 10), i),
            value,
            status: "SCHEDULED",
            billingType: String(s.billingType || "PIX"),
            customerName,
            description: String(s.description || "Parcela"),
            paymentId: "",
          });
          cursor = cursor ? addMonths(cursor, 1) : cursor;
        }
        parcels.sort((a, b) => a.date.localeCompare(b.date));
        subscriptions.push({
          id,
          customerName,
          value,
          cycle: String(s.cycle || "MONTHLY"),
          status: String(s.status || ""),
          nextDueDate,
          maxPayments: maxPayments || parcels.length,
          generated: generatedPays.length,
          remaining,
          remainingValue: parcels
            .filter((p) => p.status !== "RECEIVED" && p.status !== "CONFIRMED")
            .reduce((a, p) => a + p.value, 0),
          parcels,
        });
      }

      const calendar = [
        ...pending.map((p) => ({
          date: p.dueDate,
          value: p.value,
          status: p.status,
          billingType: p.billingType,
          customerName: p.customerName,
          description: p.description,
          paymentId: p.id,
        })),
        ...subscriptions.flatMap((s) =>
          s.parcels.filter((p) => p.status === "SCHEDULED"),
        ),
      ].sort((a, b) => a.date.localeCompare(b.date));

      const summary: FinanceSummary = {
        received: received.reduce((a, p) => a + p.netValue, 0),
        pending: pending.reduce((a, p) => a + p.value, 0),
        overdue: overdue.reduce((a, p) => a + p.value, 0),
        pixPending: pending
          .filter((p) => p.billingType === "PIX")
          .reduce((a, p) => a + p.value, 0),
        cardConfirmed: received
          .filter((p) => p.billingType === "CREDIT_CARD")
          .reduce((a, p) => a + p.netValue, 0),
        countReceived: received.length,
        countPending: pending.length,
        toReceive: calendar.reduce((a, p) => a + p.value, 0),
        payments,
        subscriptions,
        calendar,
      };
      return { ok: true as const, summary };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha no financeiro",
      };
    }
  });
