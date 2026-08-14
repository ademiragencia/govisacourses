/** Somente servidor. Token vem do ambiente — nunca no código. */
export const ASAAS_ACCESS_TOKEN =
  process.env.ASAAS_ACCESS_TOKEN || process.env.ASAAS_API_KEY || "";

export const ASAAS_API = "https://api.asaas.com/v3";
