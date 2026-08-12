/**
 * Credenciais Mercado Pago (conta de produção).
 * Preferência: variáveis de ambiente. Fallback: valores da conta.
 */
export const MP_PUBLIC_KEY =
  process.env.MERCADOPAGO_PUBLIC_KEY ||
  "APP_USR-01928923-2250-4c89-aca0-35e3b78777c1";

export const MP_ACCESS_TOKEN =
  process.env.MERCADOPAGO_ACCESS_TOKEN ||
  process.env.MP_ACCESS_TOKEN ||
  "APP_USR-8065433526377994-081215-aa19fde6b22a302ee96587fb90124f05-1818407031";
