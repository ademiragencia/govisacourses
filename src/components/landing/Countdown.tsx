import { useEffect, useState } from "react";
import { offerParts } from "@/lib/offer";

export function Countdown({ compact = false }: { compact?: boolean }) {
  const [t, setT] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const tick = () => setT(offerParts());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const view = t ?? { h: 0, m: 0, s: 0 };

  return (
    <div>
      <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-brand-red">
        A condição de hoje acaba em
      </p>
      <div className="grid grid-cols-3 gap-2">
        {[
          [view.h, "horas"],
          [view.m, "min"],
          [view.s, "seg"],
        ].map(([n, label]) => (
          <div
            key={String(label)}
            className="rounded-[var(--radius-md)] border border-border bg-bg px-2 py-2 text-center"
          >
            <p
              className={
                compact
                  ? "font-display text-lg font-extrabold tabular-nums text-fg"
                  : "font-display text-2xl font-extrabold tabular-nums text-fg"
              }
            >
              {t ? String(n).padStart(2, "0") : "--"}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
