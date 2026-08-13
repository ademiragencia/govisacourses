import { useEffect, useState } from "react";
import { COURSE_LIVE } from "@/lib/config";

function parts(ms: number) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

function Cell({ n, label }: { n: number; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="tabular-nums">{String(n).padStart(2, "0")}</span>
      <span className="text-[10px] font-semibold opacity-80">{label}</span>
    </span>
  );
}

export function UrgencyBar() {
  const [t, setT] = useState(() =>
    parts(new Date(COURSE_LIVE.startIso).getTime() - Date.now()),
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setT(parts(new Date(COURSE_LIVE.startIso).getTime() - Date.now()));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="bg-brand-red px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-white sm:text-xs">
      <span className="mr-2">Turma 30/08 · últimas vagas</span>
      <span className="mr-2 hidden sm:inline">
        De {COURSE_LIVE.listPriceLabel} por {COURSE_LIVE.priceLabel}
      </span>
      <span className="inline-flex items-center gap-2 tabular-nums">
        <Cell n={t.d} label="d" />
        <Cell n={t.h} label="h" />
        <Cell n={t.m} label="m" />
        <Cell n={t.s} label="s" />
      </span>
    </div>
  );
}
