import { MP_PUBLIC_KEY } from "./mp-public";

type CardTokenInput = {
  cardNumber: string;
  cardholderName: string;
  cardExpirationMonth: string;
  cardExpirationYear: string;
  securityCode: string;
  identificationNumber: string;
};

type MpClient = {
  createCardToken: (data: Record<string, string>) => Promise<{
    id?: string;
    error?: string;
    cause?: { description?: string }[];
  }>;
  getPaymentMethods: (opts: { bin: string }) => Promise<{
    results?: {
      id?: string;
      payment_type_id?: string;
      issuer?: { id?: number | string };
    }[];
  }>;
};

declare global {
  interface Window {
    MercadoPago?: new (
      key: string,
      opts?: { locale: string },
    ) => MpClient;
  }
}

let client: MpClient | null = null;

export async function getMpClient(): Promise<MpClient> {
  if (client) return client;
  if (typeof window === "undefined") throw new Error("somente no navegador");
  if (!window.MercadoPago) {
    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        "script[data-mp-sdk]",
      );
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("sdk")), {
          once: true,
        });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;
      script.dataset.mpSdk = "1";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Não foi possível carregar o pagamento"));
      document.head.appendChild(script);
    });
  }
  if (!window.MercadoPago) throw new Error("SDK indisponível");
  client = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });
  return client;
}

export async function tokenizeCard(input: CardTokenInput) {
  const cardNumber = input.cardNumber.replace(/\D/g, "");
  const year =
    input.cardExpirationYear.length === 2
      ? `20${input.cardExpirationYear}`
      : input.cardExpirationYear;
  const month = input.cardExpirationMonth.padStart(2, "0");
  const cpf = input.identificationNumber.replace(/\D/g, "");

  const res = await fetch(
    `https://api.mercadopago.com/v1/card_tokens?public_key=${encodeURIComponent(MP_PUBLIC_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        card_number: cardNumber,
        expiration_year: year,
        expiration_month: month,
        security_code: input.securityCode,
        cardholder: {
          name: input.cardholderName.trim(),
          identification: { type: "CPF", number: cpf },
        },
      }),
    },
  );
  const token = (await res.json().catch(() => ({}))) as {
    id?: string;
    payment_method_id?: string;
    issuer_id?: number | string;
    message?: string;
    cause?: { description?: string }[];
  };
  if (!res.ok || !token.id) {
    throw new Error(
      token.cause?.[0]?.description ||
        token.message ||
        "Não foi possível validar o cartão",
    );
  }

  let paymentMethodId = token.payment_method_id || "";
  let issuerId = token.issuer_id != null ? String(token.issuer_id) : "";
  if (!paymentMethodId) {
    try {
      const mp = await getMpClient();
      const methods = await mp.getPaymentMethods({ bin: cardNumber.slice(0, 6) });
      paymentMethodId = methods.results?.[0]?.id || "";
      if (!issuerId && methods.results?.[0]?.issuer?.id != null) {
        issuerId = String(methods.results[0].issuer.id);
      }
    } catch {
      /* optional */
    }
  }
  return { token: token.id, paymentMethodId, issuerId };
}

export function formatCardNumber(raw: string) {
  return raw
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

export function formatExpiry(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}
