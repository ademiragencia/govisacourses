import { COURSE_LIVE } from "./config";

export type CardInstallment = {
  count: number;
  value: number;
  total: number;
  interest: boolean;
  label: string;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Tabela Price no cartão. 1× sem juros; 2× a 10× com juros compostos. */
export function cardInstallment(
  count: number,
  principal = COURSE_LIVE.price,
  rate = COURSE_LIVE.cardInterestMonthly,
): CardInstallment {
  const n = Math.min(COURSE_LIVE.cardMaxInstallments, Math.max(1, Math.round(count)));
  if (n === 1) {
    return {
      count: 1,
      value: principal,
      total: principal,
      interest: false,
      label: `1× de ${brl(principal)}`,
    };
  }
  const factor = (1 + rate) ** n;
  const value = round2((principal * (rate * factor)) / (factor - 1));
  const total = round2(value * n);
  return {
    count: n,
    value,
    total,
    interest: true,
    label: `${n}× de ${brl(value)}`,
  };
}

export function cardInstallmentOptions() {
  return Array.from({ length: COURSE_LIVE.cardMaxInstallments }, (_, i) =>
    cardInstallment(i + 1),
  );
}
