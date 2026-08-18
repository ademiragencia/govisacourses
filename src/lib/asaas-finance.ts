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
};

export type FinanceSummary = {
  received: number;
  pending: number;
  overdue: number;
  pixPending: number;
  cardConfirmed: number;
  countReceived: number;
  countPending: number;
  payments: FinancePayment[];
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
      const json = await asaas<{ data?: Record<string, unknown>[] }>(
        "/payments?limit=50",
      );
      const payments: FinancePayment[] = (json.data || []).map((p) => ({
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
      }));
      const received = payments.filter(
        (p) => p.status === "CONFIRMED" || p.status === "RECEIVED",
      );
      const pending = payments.filter(
        (p) => p.status === "PENDING" || p.status === "AWAITING_RISK_ANALYSIS",
      );
      const overdue = payments.filter((p) => p.status === "OVERDUE");
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
        payments,
      };
      return { ok: true as const, summary };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Falha no financeiro",
      };
    }
  });
