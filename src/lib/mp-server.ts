import { createServerFn } from "@tanstack/react-start";
import { MP_ACCESS_TOKEN } from "./mp-credentials";

function token() {
  return MP_ACCESS_TOKEN.trim();
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  return {
    first: parts[0] || "Aluno",
    last: parts.slice(1).join(" ") || parts[0] || "GoVisa",
  };
}

const REJECT: Record<string, string> = {
  cc_rejected_insufficient_amount: "Cartão sem limite suficiente.",
  cc_rejected_bad_filled_security_code: "Código de segurança inválido.",
  cc_rejected_bad_filled_date: "Validade do cartão inválida.",
  cc_rejected_bad_filled_card_number: "Número do cartão inválido.",
  cc_rejected_bad_filled_other: "Revise os dados do cartão.",
  cc_rejected_blacklist: "Este cartão não pôde ser autorizado.",
  cc_rejected_call_for_authorize: "Autorize a compra com o banco e tente de novo.",
  cc_rejected_card_disabled: "Cartão desabilitado. Fale com o banco.",
  cc_rejected_duplicated_payment: "Pagamento já registrado.",
  cc_rejected_high_risk: "Pagamento não autorizado.",
  cc_rejected_invalid_installments: "Parcelamento não disponível neste cartão.",
  cc_rejected_max_attempts: "Muitas tentativas. Use outro cartão.",
  cc_rejected_other_reason: "Pagamento não autorizado pelo banco.",
};

export type PayMethod = "pix" | "card" | "boleto";

export const createSitePayment = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as {
      method?: PayMethod;
      amount?: number;
      installments?: number;
      title?: string;
      email?: string;
      name?: string;
      cpf?: string;
      phone?: string;
      cardToken?: string;
      paymentMethodId?: string;
      issuerId?: string;
      street?: string;
      number?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zip?: string;
      leadId?: string;
    };
    if (d.method !== "pix" && d.method !== "card" && d.method !== "boleto") {
      throw new Error("Forma de pagamento inválida");
    }
    const amount = Number(d.amount);
    if (!Number.isFinite(amount) || amount < 1) throw new Error("Valor inválido");
    if (!d.email || !d.name || !d.cpf) throw new Error("Dados incompletos");
    if (d.method === "card" && !d.cardToken) throw new Error("Cartão inválido");
    return {
      method: d.method,
      amount,
      installments: Math.max(1, Number(d.installments) || 1),
      title: String(d.title || "Formação Go Visa Courses"),
      email: d.email.trim(),
      name: d.name.trim(),
      cpf: String(d.cpf).replace(/\D/g, ""),
      phone: String(d.phone || "").replace(/\D/g, ""),
      cardToken: d.cardToken || "",
      paymentMethodId: d.paymentMethodId || "",
      issuerId: d.issuerId || "",
      street: String(d.street || "").trim(),
      number: String(d.number || "").trim(),
      neighborhood: String(d.neighborhood || "").trim(),
      city: String(d.city || "").trim(),
      state: String(d.state || "").trim(),
      zip: String(d.zip || "").replace(/\D/g, ""),
      leadId: String(d.leadId || ""),
    };
  })
  .handler(async ({ data }) => {
    const access = token();
    if (!access) {
      return { ok: false as const, error: "Pagamento ainda não configurado." };
    }

    const { first, last } = splitName(data.name);
    const payerBase = {
      email: data.email,
      first_name: first,
      last_name: last,
      identification: { type: "CPF", number: data.cpf },
    };

    let body: Record<string, unknown> = {
      transaction_amount: Number(data.amount.toFixed(2)),
      description: data.title,
      external_reference: data.leadId,
      metadata: { lead_id: data.leadId, method: data.method },
    };

    if (data.method === "pix") {
      body = {
        ...body,
        payment_method_id: "pix",
        payer: payerBase,
      };
    } else if (data.method === "card") {
      body = {
        ...body,
        token: data.cardToken,
        installments: data.installments,
        payment_method_id: data.paymentMethodId || undefined,
        issuer_id: data.issuerId || undefined,
        payer: payerBase,
      };
    } else {
      body = {
        ...body,
        payment_method_id: "bolbradesco",
        payer: {
          ...payerBase,
          address: {
            zip_code: data.zip,
            street_name: data.street,
            street_number: data.number,
            neighborhood: data.neighborhood,
            city: data.city,
            federal_unit: data.state,
          },
        },
      };
    }

    const res = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${data.leadId}-${data.method}-${Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    const json = (await res.json().catch(() => ({}))) as {
      id?: number;
      status?: string;
      status_detail?: string;
      message?: string;
      error?: string;
      cause?: { description?: string }[];
      point_of_interaction?: {
        transaction_data?: {
          qr_code?: string;
          qr_code_base64?: string;
        };
      };
      barcode?: { content?: string };
      transaction_details?: {
        digitable_line?: string;
        external_resource_url?: string;
      };
    };

    if (!res.ok || !json.id) {
      const raw =
        json.cause?.[0]?.description ||
        json.message ||
        json.error ||
        "";
      return {
        ok: false as const,
        error: raw || "Não foi possível processar o pagamento.",
      };
    }

    if (json.status === "rejected") {
      return {
        ok: false as const,
        error:
          REJECT[json.status_detail || ""] ||
          "Pagamento não autorizado. Tente outro cartão de crédito.",
      };
    }

    return {
      ok: true as const,
      paymentId: String(json.id),
      status: json.status || "pending",
      statusDetail: json.status_detail || "",
      qrCode: json.point_of_interaction?.transaction_data?.qr_code || "",
      qrBase64:
        json.point_of_interaction?.transaction_data?.qr_code_base64 || "",
      barcode:
        json.barcode?.content ||
        json.transaction_details?.digitable_line ||
        "",
    };
  });

export const verifyMpPayment = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { paymentId?: string };
    if (!d?.paymentId) throw new Error("pagamento ausente");
    return { paymentId: String(d.paymentId) };
  })
  .handler(async ({ data }) => {
    const access = token();
    if (!access) {
      return { ok: false as const, status: "unknown", error: "sem token" };
    }
    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(data.paymentId)}`,
      { headers: { Authorization: `Bearer ${access}` } },
    );
    const json = (await res.json().catch(() => ({}))) as {
      id?: number;
      status?: string;
      status_detail?: string;
      transaction_amount?: number;
      external_reference?: string;
    };
    if (!res.ok) {
      return { ok: false as const, status: "unknown", error: "falha ao consultar" };
    }
    return {
      ok: true as const,
      status: json.status || "unknown",
      statusDetail: json.status_detail || "",
      amount: json.transaction_amount || 0,
      externalReference: json.external_reference || "",
      paymentId: String(json.id || data.paymentId),
    };
  });
