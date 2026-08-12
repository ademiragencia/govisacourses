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
  const mp = await getMpClient();
  const year = input.cardExpirationYear.length === 2
    ? `20${input.cardExpirationYear}`
    : input.cardExpirationYear;
  const token = await mp.createCardToken({
    cardNumber: input.cardNumber.replace(/\D/g, ""),
    cardholderName: input.cardholderName.trim(),
    cardExpirationMonth: input.cardExpirationMonth.padStart(2, "0"),
    cardExpirationYear: year,
    securityCode: input.securityCode,
    identificationType: "CPF",
    identificationNumber: input.identificationNumber.replace(/\D/g, ""),
  });
  if (!token?.id) {
    const msg =
      token?.cause?.[0]?.description ||
      token?.error ||
      "Não foi possível validar o cartão";
    throw new Error(msg);
  }
  let paymentMethodId = "";
  let issuerId = "";
  try {
    const methods = await mp.getPaymentMethods({
      bin: input.cardNumber.replace(/\D/g, "").slice(0, 6),
    });
    const first = methods.results?.[0];
    paymentMethodId = first?.id || "";
    issuerId = first?.issuer?.id != null ? String(first.issuer.id) : "";
  } catch {
    /* optional */
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
