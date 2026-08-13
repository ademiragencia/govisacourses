/** Fim da oferta de hoje (meia-noite local). */
export function offerEndsAt(now = Date.now()) {
  const d = new Date(now);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function offerParts(now = Date.now()) {
  const ms = Math.max(0, offerEndsAt(now) - now);
  const s = Math.floor(ms / 1000);
  return {
    h: Math.floor(s / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export const OFFER_TODAY = {
  badge: "Somente hoje",
  bar: "Oferta somente hoje",
  headline: "Este preço vale só hoje",
  detail: "De R$ 14.997 por R$ 3.000. Depois volta o valor cheio.",
  cta: "Garantir o valor de hoje",
} as const;
