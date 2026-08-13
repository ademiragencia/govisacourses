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

export function Countdown() {
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
    <div className="grid grid-cols-4 gap-2">
      {[
        [t.d, "dias"],
        [t.h, "horas"],
        [t.m, "min"],
        [t.s, "seg"],
      ].map(([n, label]) => (
        <div
          key={String(label)}
          className="rounded-[var(--radius-md)] border border-border bg-bg px-2 py-2"
        >
          <p className="font-display text-xl font-extrabold tabular-nums text-fg">
            {String(n).padStart(2, "0")}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
