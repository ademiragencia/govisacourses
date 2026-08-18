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

/**
 * Tabela do Mercado Pago para R$ 3.000 (Visa/Master/Elo/Amex, conta GOVISACOURSES).
 * 1× sem acréscimo. 2×–10× com a taxa deles.
 * transaction_amount na cobrança continua R$ 3.000; o juros cai no cliente.
 */
export const MP_CARD_TABLE: { count: number; value: number; total: number }[] = [
  { count: 1, value: 3000, total: 3000 },
  { count: 2, value: 1644.6, total: 3289.2 },
  { count: 3, value: 1112.3, total: 3336.9 },
  { count: 4, value: 835.2, total: 3340.8 },
  { count: 5, value: 685.86, total: 3429.3 },
  { count: 6, value: 571.6, total: 3429.6 },
  { count: 7, value: 500.23, total: 3501.6 },
  { count: 8, value: 437.74, total: 3501.9 },
  { count: 9, value: 398.97, total: 3590.7 },
  { count: 10, value: 361.95, total: 3619.5 },
];

function toOption(row: { count: number; value: number; total: number }): CardInstallment {
  return {
    count: row.count,
    value: round2(row.value),
    total: round2(row.total),
    interest: row.count > 1,
    label:
      row.count === 1
        ? `1× de ${brl(row.total)}`
        : `${row.count}× de ${brl(row.value)} · total ${brl(row.total)}`,
  };
}

export function cardInstallment(
  count: number,
  _principal = COURSE_LIVE.price,
  _rate = COURSE_LIVE.cardInterestMonthly,
): CardInstallment {
  const n = Math.min(10, Math.max(1, Math.round(count)));
  const row = MP_CARD_TABLE.find((r) => r.count === n) || MP_CARD_TABLE[0];
  return toOption(row);
}

export function cardInstallmentOptions(rows?: { count: number; value: number; total: number }[]) {
  const list = (rows && rows.length ? rows : MP_CARD_TABLE).filter((r) => r.count <= 10);
  return list.map(toOption);
}
