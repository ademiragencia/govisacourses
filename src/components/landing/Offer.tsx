import { BRAND, COURSE_LIVE } from "@/lib/config";
import { MatriculaCta } from "./MatriculaCta";
import { Countdown } from "@/components/landing/Countdown";
import { Reveal } from "./Reveal";
import { Check, Clock, Lock, Radio, ShieldCheck } from "lucide-react";

const REASSURANCE = [
  { icon: Lock, label: "Pagamento seguro" },
  { icon: ShieldCheck, label: "Suporte humano no WhatsApp" },
  { icon: Radio, label: "Vaga garantida na turma ao vivo" },
];

export function Offer() {
  return (
    <section id="investimento" className="border-t border-border py-20 md:py-28">
      <div className="container-lp">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow eyebrow-center justify-center">Investimento</p>
            <h2 className="display mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] text-fg">
              Uma fração do que essa porta vale
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-fg-muted">
              Uma única contratação em dólar paga essa formação muitas vezes.
              Hoje ela sai por{" "}
              <span className="font-bold text-fg">{COURSE_LIVE.priceLabel}</span>{" "}
              — depois volta para {COURSE_LIVE.listPriceLabel}.
            </p>
          </div>
        </Reveal>

        <div id="contato" className="mx-auto mt-12 max-w-xl">
          <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-brand-red/40 bg-surface shadow-[var(--shadow-soft)]">
            <div className="flag-strip" />
            <div className="border-b border-border bg-bg-elevated px-6 py-6 md:px-8">
              <div className="flex items-center gap-2 text-brand-red">
                <span className="live-dot" />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
                  {COURSE_LIVE.badge} · vagas limitadas
                </span>
              </div>
              <h3 className="mt-3 font-display text-2xl font-extrabold text-fg">
                {COURSE_LIVE.name}
              </h3>
              <div className="mt-4 flex items-end gap-3">
                <div>
                  <p className="text-sm text-fg-subtle line-through">
                    {COURSE_LIVE.listPriceLabel}
                  </p>
                  <p className="font-display text-[2.75rem] font-extrabold leading-none text-fg">
                    {COURSE_LIVE.priceLabel}
                  </p>
                </div>
                <span className="mb-1 rounded-full bg-brand-red-soft px-3 py-1 text-xs font-bold text-brand-red">
                  economize R$ 11.997
                </span>
              </div>
              <p className="mt-2 text-sm text-fg-muted">{COURSE_LIVE.planLabel}</p>
            </div>

            <div className="space-y-5 px-6 py-6 md:px-8">
              <div className="flex items-start gap-2 text-sm text-fg-muted">
                <Clock className="mt-0.5 size-4 shrink-0 text-brand-red" />
                <span>
                  <strong className="text-fg">{COURSE_LIVE.hoursLabel}</strong>
                  {" · "}
                  {COURSE_LIVE.startLabel}
                  <br />
                  Domingos (4×4h) e terças/quintas 19h–21h
                </span>
              </div>

              <Countdown />

              <div>
                <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-fg-subtle">
                  Tudo que está incluso
                </p>
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
              </div>

              <MatriculaCta fullWidth label="Garantir o valor de hoje" />

              <div className="grid grid-cols-1 gap-2 border-t border-border pt-4 sm:grid-cols-3">
                {REASSURANCE.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 text-xs text-fg-subtle"
                  >
                    <Icon className="size-4 shrink-0 text-gold-line" strokeWidth={2} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-xs leading-relaxed text-fg-subtle">
            Formação com a {BRAND.firm}. A contratação dos destaques acontece
            por desempenho, após a formação — não é garantida para todos.
          </p>
        </div>
      </div>
    </section>
  );
}
