import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { ASAAS_ACCESS_TOKEN, ASAAS_API } from "./asaas-credentials";
import { COURSE_LIVE } from "./config";

function token() {
  return ASAAS_ACCESS_TOKEN.trim();
}

function todayBr() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

function digitsPhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
  return d.slice(0, 11);
}

function clientIp() {
  try {
    const req = getRequest();
    const fwd = req.headers.get("x-forwarded-for") || "";
    return (
      fwd.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1"
    );
  } catch {
    return "127.0.0.1";
  }
}

type AsaasErr = { errors?: { description?: string; code?: string }[] };

async function asaas<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${ASAAS_API}${path}`, {
    ...init,
    headers: {
      access_token: token(),
      "Content-Type": "application/json",
      "User-Agent": "GoVisaCourses/1.0",
      ...(init?.headers || {}),
    },
  });
  const json = (await res.json().catch(() => ({}))) as T & AsaasErr;
  if (!res.ok) {
    const msg =
      json.errors?.[0]?.description ||
      `Falha no pagamento (${res.status})`;
    throw new Error(msg);
  }
  return json;
}

async function findOrCreateCustomer(input: {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  zip: string;
  number: string;
  complement: string;
}) {
  const list = await asaas<{ data?: { id?: string }[] }>(
    `/customers?cpfCnpj=${encodeURIComponent(input.cpf)}`,
  );
  const existing = list.data?.[0]?.id;
  if (existing) return existing;
  const created = await asaas<{ id?: string }>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      cpfCnpj: input.cpf,
      mobilePhone: digitsPhone(input.phone),
      postalCode: input.zip || undefined,
      addressNumber: input.number || undefined,
      complement: input.complement || undefined,
      notificationDisabled: true,
      externalReference: input.cpf,
    }),
  });
  if (!created.id) throw new Error("Não foi possível cadastrar o pagador.");
  return created.id;
}

function nextMonthBr() {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
  );
  now.setMonth(now.getMonth() + 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isPaid(status?: string) {
  return status === "CONFIRMED" || status === "RECEIVED" || status === "RECEIVED_IN_CASH";
}

export const createSitePayment = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as {
      method?: string;
      amount?: number;
      installments?: number;
      title?: string;
      email?: string;
      name?: string;
      cpf?: string;
      phone?: string;
      cardNumber?: string;
      cardHolder?: string;
      cardMonth?: string;
      cardYear?: string;
      cardCvv?: string;
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zip?: string;
      leadId?: string;
      plan?: string;
    };
    if (d.method !== "card" && d.method !== "pix") {
      throw new Error("Forma de pagamento inválida");
    }
    const amount = Number(d.amount);
    if (!Number.isFinite(amount) || amount < 1) throw new Error("Valor inválido");
    if (!d.email || !d.name || !d.cpf) throw new Error("Dados incompletos");
    const method = d.method as "card" | "pix";
    const cardNumber = String(d.cardNumber || "").replace(/\D/g, "");
    const month = String(d.cardMonth || "").padStart(2, "0");
    let year = String(d.cardYear || "").replace(/\D/g, "");
    if (year.length === 2) year = `20${year}`;
    if (method === "card") {
      if (cardNumber.length < 13) throw new Error("Número do cartão inválido");
      if (!month || !year || String(d.cardCvv || "").length < 3) {
        throw new Error("Validade ou CVV inválido");
      }
    }
    return {
      method,
      plan: String(d.plan || ""),
      amount,
      installments: Math.max(1, Number(d.installments) || 1),
      title: String(d.title || "Formação Go Visa Courses"),
      email: d.email.trim(),
      name: d.name.trim(),
      cpf: String(d.cpf).replace(/\D/g, ""),
      phone: String(d.phone || ""),
      cardNumber,
      cardHolder: String(d.cardHolder || d.name).trim(),
      cardMonth: month,
      cardYear: year,
      cardCvv: String(d.cardCvv || "").replace(/\D/g, ""),
      street: String(d.street || "").trim(),
      number: String(d.number || "").trim(),
      complement: String(d.complement || "").trim(),
      city: String(d.city || "").trim(),
      zip: String(d.zip || "").replace(/\D/g, ""),
      leadId: String(d.leadId || ""),
    };
  })
  .handler(async ({ data }) => {
    if (!token()) {
      return { ok: false as const, error: "Pagamento ainda não configurado." };
    }
    try {
      const customer = await findOrCreateCustomer({
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        phone: data.phone,
        zip: data.zip,
        number: data.number,
        complement: data.complement,
      });

      if (data.method === "pix") {
        const pay = await asaas<{ id?: string; status?: string }>("/payments", {
          method: "POST",
          body: JSON.stringify({
            customer,
            billingType: "PIX",
            value: Number(data.amount.toFixed(2)),
            dueDate: todayBr(),
            description: data.title.slice(0, 480),
            externalReference: data.leadId,
          }),
        });
        if (!pay.id) {
          return { ok: false as const, error: "Não foi possível gerar o Pix." };
        }
        const qr = await asaas<{
          encodedImage?: string;
          payload?: string;
          expirationDate?: string;
        }>(`/payments/${encodeURIComponent(pay.id)}/pixQrCode`);

        let subscriptionId = "";
        if (data.plan === "entry") {
          try {
            const sub = await asaas<{ id?: string }>("/subscriptions", {
              method: "POST",
              body: JSON.stringify({
                customer,
                billingType: "PIX",
                value: COURSE_LIVE.installmentValue,
                nextDueDate: nextMonthBr(),
                cycle: "MONTHLY",
                maxPayments: COURSE_LIVE.installments,
                description: "5 parcelas da Formação Go Visa Courses",
                externalReference: data.leadId,
              }),
            });
            subscriptionId = sub.id || "";
          } catch {
            /* entrada no Pix; parcelas ficam para a equipe se a assinatura falhar */
          }
        }

        return {
          ok: true as const,
          paymentId: pay.id,
          status: isPaid(pay.status) ? "approved" : "pending",
          statusDetail: pay.status || "PENDING",
          qrImage: qr.encodedImage || "",
          qrPayload: qr.payload || "",
          subscriptionId,
        };
      }

      const payload: Record<string, unknown> = {
        customer,
        billingType: "CREDIT_CARD",
        value: Number(data.amount.toFixed(2)),
        dueDate: todayBr(),
        description: data.title.slice(0, 480),
        externalReference: data.leadId,
        postalService: false,
        remoteIp: clientIp(),
        creditCard: {
          holderName: data.cardHolder,
          number: data.cardNumber,
          expiryMonth: data.cardMonth,
          expiryYear: data.cardYear,
          ccv: data.cardCvv,
        },
        creditCardHolderInfo: {
          name: data.name,
          email: data.email,
          cpfCnpj: data.cpf,
          postalCode: data.zip || "01310100",
          addressNumber: data.number || "0",
          addressComplement: data.complement || undefined,
          phone: digitsPhone(data.phone),
          mobilePhone: digitsPhone(data.phone),
        },
      };

      if (data.installments > 1) {
        payload.installmentCount = data.installments;
        payload.installmentValue = Number(
          (data.amount / data.installments).toFixed(2),
        );
      }

      const pay = await asaas<{
        id?: string;
        status?: string;
        invoiceUrl?: string;
      }>("/payments", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!pay.id) {
        return { ok: false as const, error: "Não foi possível processar o pagamento." };
      }

      if (pay.status === "PENDING" || pay.status === "AWAITING_RISK_ANALYSIS") {
        return {
          ok: true as const,
          paymentId: pay.id,
          status: "pending",
          statusDetail: pay.status,
          qrImage: "",
          qrPayload: "",
        };
      }

      if (!isPaid(pay.status)) {
        return {
          ok: false as const,
          error: "Pagamento não autorizado. Tente outro cartão de crédito.",
          paymentId: pay.id,
        };
      }

      return {
        ok: true as const,
        paymentId: pay.id,
        status: "approved",
        statusDetail: pay.status || "",
        qrImage: "",
        qrPayload: "",
      };
    } catch (err) {
      return {
        ok: false as const,
        error:
          err instanceof Error
            ? err.message
            : "Não foi possível processar o pagamento.",
      };
    }
  });

export const verifyAsaasPayment = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { paymentId?: string };
    if (!d?.paymentId) throw new Error("pagamento ausente");
    return { paymentId: String(d.paymentId) };
  })
  .handler(async ({ data }) => {
    if (!token()) {
      return { ok: false as const, status: "unknown", error: "sem token" };
    }
    try {
      const json = await asaas<{
        id?: string;
        status?: string;
        value?: number;
        externalReference?: string;
      }>(`/payments/${encodeURIComponent(data.paymentId)}`);
      return {
        ok: true as const,
        status: isPaid(json.status) ? "approved" : (json.status || "unknown").toLowerCase(),
        statusDetail: json.status || "",
        amount: json.value || 0,
        externalReference: json.externalReference || "",
        paymentId: String(json.id || data.paymentId),
      };
    } catch (err) {
      return {
        ok: false as const,
        status: "unknown",
        error: err instanceof Error ? err.message : "falha ao consultar",
      };
    }
  });

export const verifyMpPayment = verifyAsaasPayment;
