import { createServerFn } from "@tanstack/react-start";
import { MP_ACCESS_TOKEN } from "./mp-credentials";
import { supabaseRpc } from "./supabase";

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

export const createMpCardPayment = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as {
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
      city?: string;
      zip?: string;
      leadId?: string;
      coupon?: string;
    };
    const amount = Number(d.amount);
    if (!Number.isFinite(amount) || amount < 1) throw new Error("Valor inválido");
    if (!d.email || !d.name || !d.cpf) throw new Error("Dados incompletos");
    if (!d.cardToken) throw new Error("Cartão inválido");
    return {
      amount,
      installments: Math.max(1, Number(d.installments) || 1),
      title: String(d.title || "Formação Go Visa Courses"),
      email: d.email.trim(),
      name: d.name.trim(),
      cpf: String(d.cpf).replace(/\D/g, ""),
      phone: String(d.phone || "").replace(/\D/g, ""),
      cardToken: d.cardToken,
      paymentMethodId: d.paymentMethodId || "",
      issuerId: d.issuerId || "",
      street: String(d.street || "").trim(),
      number: String(d.number || "").trim(),
      city: String(d.city || "").trim(),
      zip: String(d.zip || "").replace(/\D/g, ""),
      leadId: String(d.leadId || ""),
      coupon: String(d.coupon || "").trim().toUpperCase(),
    };
  })
  .handler(async ({ data }) => {
    const access = token();
    if (!access) {
      return { ok: false as const, error: "Pagamento ainda não configurado." };
    }

    let amount = data.amount;
    let couponCode = "";
    if (data.coupon) {
      try {
        const preview = await supabaseRpc<{
          code?: string;
          total?: number;
        }>("redeem_coupon", {
          p_code: data.coupon,
          p_method: "card",
          p_plan: "card",
          p_amount: amount,
        });
        if (preview?.total && Number(preview.total) >= 1) {
          amount = Number(preview.total);
          couponCode = String(preview.code || data.coupon);
        }
      } catch (err) {
        return {
          ok: false as const,
          error: err instanceof Error ? err.message : "Cupom inválido",
        };
      }
    }

    const { first, last } = splitName(data.name);
    const body: Record<string, unknown> = {
      transaction_amount: Number(amount.toFixed(2)),
      token: data.cardToken,
      installments: data.installments,
      payment_method_id: data.paymentMethodId || undefined,
      issuer_id: data.issuerId || undefined,
      description: `${data.title}${couponCode ? ` · cupom ${couponCode}` : ""}`.slice(0, 250),
      external_reference: data.leadId,
      binary_mode: true,
      notification_url: "https://www.govisacourses.com.br/api/mp/webhook",
      metadata: { lead_id: data.leadId, method: "card", coupon: couponCode },
      payer: {
        email: data.email,
        first_name: first,
        last_name: last,
        identification: { type: "CPF", number: data.cpf },
      },
      additional_info: {
        items: [
          {
            id: "govisa-formacao",
            title: data.title.slice(0, 250),
            quantity: 1,
            unit_price: Number(amount.toFixed(2)),
          },
        ],
        payer: {
          first_name: first,
          last_name: last,
        },
      },
    };

    try {
      const res = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": `${data.leadId}-card-${Date.now()}`,
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
      };

      if (!res.ok || !json.id) {
        const raw =
          json.cause?.[0]?.description || json.message || json.error || "";
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
          paymentId: String(json.id),
        };
      }

      if (couponCode) {
        await supabaseRpc("bump_coupon_use", { p_code: couponCode }).catch(() => null);
      }

      const approved = json.status === "approved";
      return {
        ok: true as const,
        paymentId: String(json.id),
        status: approved ? "approved" : "pending",
        statusDetail: json.status_detail || json.status || "",
        amount,
        coupon: couponCode,
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
    const approved = json.status === "approved";
    return {
      ok: true as const,
      status: approved ? "approved" : json.status || "unknown",
      statusDetail: json.status_detail || "",
      amount: json.transaction_amount || 0,
      externalReference: json.external_reference || "",
      paymentId: String(json.id || data.paymentId),
    };
  });
