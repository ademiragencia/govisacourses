import { createServerFn } from "@tanstack/react-start";
import { COURSE_LIVE, COURSE_SELF } from "./config";
import { SITE_URL } from "./seo";

function mpToken() {
  return (
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    process.env.MP_ACCESS_TOKEN ||
    ""
  ).trim();
}

function offer(modality: "self" | "live") {
  const course = modality === "live" ? COURSE_LIVE : COURSE_SELF;
  return {
    title: `${course.name} — ${course.shortName}`,
    amount: course.price,
  };
}

function originFrom(raw?: string) {
  const fallback = SITE_URL;
  if (!raw) return fallback;
  try {
    const u = new URL(raw);
    if (u.protocol === "http:" || u.protocol === "https:") {
      return `${u.protocol}//${u.host}`;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

export const createMpCheckout = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as {
      name?: string;
      email?: string;
      phone?: string;
      city?: string;
      modality?: string;
      leadId?: string;
      origin?: string;
    };
    if (!d?.name || d.name.trim().length < 2) throw new Error("Nome inválido");
    if (!d.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
      throw new Error("E-mail inválido");
    if (d.modality !== "self" && d.modality !== "live")
      throw new Error("Modalidade inválida");
    if (!d.leadId) throw new Error("leadId ausente");
    return {
      name: d.name.trim(),
      email: d.email.trim(),
      phone: String(d.phone || "").trim(),
      city: String(d.city || "").trim(),
      modality: d.modality as "self" | "live",
      leadId: d.leadId,
      origin: d.origin,
    };
  })
  .handler(async ({ data }) => {
    const token = mpToken();
    if (!token) {
      return {
        ok: false as const,
        error:
          "Mercado Pago ainda não está configurado. Envie o Access Token da conta.",
      };
    }

    const item = offer(data.modality);
    const origin = originFrom(data.origin);
    const digits = data.phone.replace(/\D/g, "");

    const body = {
      items: [
        {
          id: data.modality,
          title: item.title,
          description: "Matrícula Go Visa Courses",
          quantity: 1,
          currency_id: "BRL",
          unit_price: item.amount,
        },
      ],
      payer: {
        name: data.name,
        email: data.email,
        phone: digits
          ? {
              area_code: digits.length >= 10 ? digits.slice(0, 2) : "",
              number: digits.length >= 10 ? digits.slice(2) : digits,
            }
          : undefined,
      },
      back_urls: {
        success: `${origin}/matricula/sucesso`,
        failure: `${origin}/matricula/falhou`,
        pending: `${origin}/matricula/pendente`,
      },
      auto_return: "approved",
      external_reference: data.leadId,
      notification_url: `${SITE_URL}/api/mp/webhook`,
      statement_descriptor: "GOVISA CURSOS",
      metadata: {
        lead_id: data.leadId,
        modality: data.modality,
        city: data.city,
        phone: data.phone,
      },
      payment_methods: {
        installments: 12,
      },
    };

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": data.leadId,
      },
      body: JSON.stringify(body),
    });

    const json = (await res.json().catch(() => ({}))) as {
      id?: string;
      init_point?: string;
      sandbox_init_point?: string;
      message?: string;
      error?: string;
    };

    if (!res.ok || !json.init_point) {
      return {
        ok: false as const,
        error:
          json.message ||
          json.error ||
          `Mercado Pago recusou o checkout (HTTP ${res.status})`,
      };
    }

    return {
      ok: true as const,
      preferenceId: json.id || "",
      initPoint: json.init_point,
      sandboxInitPoint: json.sandbox_init_point || json.init_point,
    };
  });

export const verifyMpPayment = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { paymentId?: string };
    if (!d?.paymentId) throw new Error("paymentId ausente");
    return { paymentId: String(d.paymentId) };
  })
  .handler(async ({ data }) => {
    const token = mpToken();
    if (!token) {
      return { ok: false as const, status: "unknown", error: "sem token" };
    }

    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${encodeURIComponent(data.paymentId)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const json = (await res.json().catch(() => ({}))) as {
      id?: number;
      status?: string;
      status_detail?: string;
      transaction_amount?: number;
      external_reference?: string;
      payer?: { email?: string };
    };
    if (!res.ok) {
      return {
        ok: false as const,
        status: "unknown",
        error: "falha ao consultar",
      };
    }
    return {
      ok: true as const,
      status: json.status || "unknown",
      statusDetail: json.status_detail || "",
      amount: json.transaction_amount || 0,
      externalReference: json.external_reference || "",
      email: json.payer?.email || "",
      paymentId: String(json.id || data.paymentId),
    };
  });
