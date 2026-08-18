import { createServerFn } from "@tanstack/react-start";
import { ASAAS_ACCESS_TOKEN, ASAAS_API } from "./asaas-credentials";
import { MP_ACCESS_TOKEN } from "./mp-credentials";
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

function isCoursePay(description: string, extra = "") {
  const t = `${description} ${extra}`.toLowerCase();
  if (/mega\s*sdr|megasdr/.test(t)) return false;
  return /govisa|forma[cç][aã]o|imigrat/.test(t);
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

      const mpToken = MP_ACCESS_TOKEN.trim();
      if (mpToken) {
        try {
          const mpRes = await fetch(
            "https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=30",
            { headers: { Authorization: `Bearer ${mpToken}` } },
          );
          const mpJson = (await mpRes.json().catch(() => ({}))) as {
            results?: Record<string, unknown>[];
          };
          for (const p of mpJson.results || []) {
            const statusRaw = String(p.status || "");
            const status =
              statusRaw === "approved"
                ? "RECEIVED"
                : statusRaw === "rejected"
                  ? "REJECTED"
                  : "PENDING";
            payments.push({
              id: String(p.id || ""),
              status,
              value: Number(p.transaction_amount || 0),
              netValue: Number(
                (p.transaction_details as { net_received_amount?: number } | undefined)
                  ?.net_received_amount || p.transaction_amount || 0,
              ),
              billingType: "CREDIT_CARD",
              description: String(p.description || "Cartão"),
              dateCreated: String(p.date_created || "").slice(0, 10),
              dueDate: String(p.date_created || "").slice(0, 10),
              clientPaymentDate: String(p.date_approved || ""),
              externalReference: String(p.external_reference || ""),
              installment: String(p.installments || ""),
              subscription: "",
              customer: "",
              customerName:
                String(
                  (p.payer as { first_name?: string; last_name?: string } | undefined)
                    ?.first_name || "",
                ) +
                " " +
                String(
                  (p.payer as { last_name?: string } | undefined)?.last_name || "",
                ),
            });
          }
        } catch {
          /* Asaas continua mesmo se o cartão falhar */
        }
      }

      const coursePays = payments.filter((p) =>
        isCoursePay(p.description, `${p.externalReference} ${p.customerName}`),
      );

      const received = coursePays.filter(
        (p) => p.status === "CONFIRMED" || p.status === "RECEIVED",
      );
      const pending = coursePays.filter((p) => {
        if (p.status !== "PENDING" && p.status !== "AWAITING_RISK_ANALYSIS") {
          return false;
        }
        const type = p.billingType.toUpperCase();
        if (type === "BOLETO" || type === "TICKET") return false;
        return Boolean(p.subscription) || type === "PIX";
      });
      const overdue = coursePays.filter((p) => p.status === "OVERDUE");

      const subscriptions: SubscriptionRow[] = [];
      for (const s of subJson.data || []) {
        if (!isCoursePay(String(s.description || ""))) continue;
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

      const toReceive = subscriptions.reduce((a, s) => a + s.remainingValue, 0);

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
        toReceive,
        payments: coursePays.filter((p) => {
          if (p.status === "CONFIRMED" || p.status === "RECEIVED") return true;
          if (p.status === "PENDING" || p.status === "AWAITING_RISK_ANALYSIS") {
            const type = p.billingType.toUpperCase();
            if (type === "BOLETO" || type === "TICKET") return false;
            return Boolean(p.subscription) || type === "PIX";
          }
          return false;
        }),
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
