import { COURSE_LIVE } from "@/lib/config";
import { MatriculaCta } from "./MatriculaCta";
import { Countdown } from "@/components/landing/Countdown";

export function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden pb-16 pt-4 md:pb-20 md:pt-6">
      <div className="container-lp relative">
        <div className="mx-auto max-w-xl overflow-hidden rounded-[var(--radius-2xl)] border border-brand-red/40 bg-surface shadow-[var(--shadow-soft)]">
          <div className="flag-strip" />
          <div className="px-6 py-7 text-center md:px-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red">
              Condição de hoje
            </p>
            <p className="mt-3 text-sm text-fg-muted line-through decoration-brand-red/70">
              De {COURSE_LIVE.listPriceLabel}
            </p>
            <p className="mt-1 font-display text-5xl font-extrabold tracking-tight text-fg">
              {COURSE_LIVE.priceLabel}
            </p>
            <p className="mt-2 text-sm text-fg-muted">
              à vista no cartão ou entrada de R$ 1.000 + 7× R$ 400
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-fg-subtle">
              {COURSE_LIVE.startLabel} · {COURSE_LIVE.hoursLabel}
            </p>
            <div className="mt-5">
              <Countdown />
            </div>
            <div className="mt-6">
              <MatriculaCta fullWidth label="Garantir o valor de hoje" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
