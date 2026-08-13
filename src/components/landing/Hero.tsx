import { BRAND, COURSE_LIVE } from "@/lib/config";
import { MatriculaCta } from "./MatriculaCta";
import { Countdown } from "@/components/landing/Countdown";
import {
  BadgeDollarSign,
  Building2,
  Crown,
  ShieldCheck,
} from "lucide-react";

export function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-16">
      <div className="container-lp relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-brand-red/40 bg-brand-red-soft px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-red">
            Oferta somente hoje · de R$ 14.997 por R$ 3.000
          </div>

          <p className="eyebrow mb-4">
            Go Visa Courses | Formação com o maior escritório
          </p>

          <h1 className="display text-[clamp(2.1rem,5.3vw,3.65rem)] text-fg">
            Formação com o{" "}
            <span className="text-gold-line">maior escritório</span> dos
            Estados Unidos.
            <br />
            <span className="text-brand-red">
              {BRAND.firm} contrata os melhores alunos, já faturando em dólar.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-fg-muted md:text-[1.1rem]">
            Turma 100% online com aulas ao vivo. Ligada à{" "}
            <strong className="font-semibold text-fg">{BRAND.firm}</strong>,{" "}
            {BRAND.firmRank}. Inglês não é obrigatório.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-xl overflow-hidden rounded-[var(--radius-2xl)] border border-brand-red/40 bg-surface shadow-[var(--shadow-soft)]">
          <div className="flag-strip" />
          <div className="px-6 py-7 text-center md:px-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-red">
              Somente hoje
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

        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Crown, t: "Maior escritório", d: "dos Estados Unidos" },
            { icon: Building2, t: BRAND.firm, d: "Quem forma e contrata" },
            { icon: BadgeDollarSign, t: "Melhores alunos", d: "Já faturam em dólar" },
            { icon: ShieldCheck, t: "Sem inglês obrigatório", d: "Diferencial, não barreira" },
          ].map(({ icon: Icon, t, d }) => (
            <div
              key={t}
              className="surface-card flex flex-col items-center gap-2 rounded-[var(--radius-xl)] px-4 py-5 text-center"
            >
              <span className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-brand-red-soft text-brand-red">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <p className="text-sm font-bold text-fg">{t}</p>
              <p className="text-xs text-fg-subtle">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
