import { useEffect, useState } from "react";
import { COURSE_LIVE } from "@/lib/config";
import { OFFER_TODAY, offerParts } from "@/lib/offer";

export function UrgencyBar() {
  const [t, setT] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const tick = () => setT(offerParts());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="bg-brand-red px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-white sm:text-xs">
      <span className="mr-2">{OFFER_TODAY.bar}</span>
      <span className="mr-2 hidden sm:inline">
        De {COURSE_LIVE.listPriceLabel} por {COURSE_LIVE.priceLabel}
      </span>
      {t && (
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <span>acaba em</span>
          <span>
            {String(t.h).padStart(2, "0")}:{String(t.m).padStart(2, "0")}:
            {String(t.s).padStart(2, "0")}
          </span>
        </span>
      )}
    </div>
  );
}
