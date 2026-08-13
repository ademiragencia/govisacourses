import { BRAND, COURSE_LIVE } from "@/lib/config";
import { MatriculaCta } from "./MatriculaCta";
import { Countdown } from "./Countdown";
import { Check, Clock, Radio } from "lucide-react";

export function Offer() {
  return (
    <section id="investimento" className="border-t border-border py-20 md:py-28">
      <div className="container-lp">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Oferta da turma</p>
          <h2 className="display mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] text-fg">
            De {COURSE_LIVE.listPriceLabel} por{" "}
            <span className="text-brand-red">{COURSE_LIVE.priceLabel}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-fg-muted">
            Só a turma ao vivo. Começa em 30 de agosto. Vagas limitadas.
            Formação com a {BRAND.firm}, {BRAND.firmRank}.
          </p>
        </div>

        <div id="contato" className="mx-auto mt-12 max-w-xl">
          <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-brand-red/40 bg-surface shadow-[var(--shadow-soft)]">
            <div className="flag-strip" />
            <div className="border-b border-border bg-bg-elevated px-6 py-5 md:px-8">
              <div className="flex items-center gap-2 text-brand-red">
                <Radio className="size-4" />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                  {COURSE_LIVE.badge}
                </span>
              </div>
              <h3 className="mt-2 font-display text-2xl font-extrabold text-fg">
                {COURSE_LIVE.shortName}
              </h3>
              <p className="mt-3 text-sm text-fg-muted line-through">
                {COURSE_LIVE.listPriceLabel}
              </p>
              <p className="font-display text-4xl font-extrabold text-fg">
                {COURSE_LIVE.priceLabel}
              </p>
              <p className="mt-1 text-sm text-fg-muted">{COURSE_LIVE.planLabel}</p>
            </div>
            <div className="space-y-4 px-6 py-6 md:px-8">
              <div className="flex items-start gap-2 text-sm text-fg-muted">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand-red" />
                <span>
                  <strong className="text-fg">{COURSE_LIVE.hoursLabel}</strong>
                  <br />
                  {COURSE_LIVE.startLabel}
                  <br />
                  Domingos (4×4h) e terças/quintas 19h–21h
                </span>
              </div>
              <Countdown />
              <ul className="space-y-2.5">
                {COURSE_LIVE.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-fg-muted"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-wa" strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
              <MatriculaCta fullWidth label="Garantir vaga da turma" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
