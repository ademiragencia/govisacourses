import { BRAND, COURSE_LIVE, COURSE_SELF } from "@/lib/config";
import { WhatsAppCta } from "./WhatsAppCta";
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
          <div className="mb-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-gold-line/40 bg-gold-line/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-fg">
            <Crown className="size-3.5 text-gold-line" strokeWidth={2.25} />
            <span className="text-gold-line">Maior escritório dos EUA</span>
            <span className="text-fg-subtle">|</span>
            <span>{BRAND.firm}</span>
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
            Capacitação 100% online em Processos Imigratórios ligada à{" "}
            <strong className="font-semibold text-fg">{BRAND.firm}</strong>,{" "}
            {BRAND.firmRank}. Estude, destaque-se e dispute uma vaga remunerada
            em dólar. Inglês não é obrigatório.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-[var(--radius-xl)] border border-gold-line/40 bg-surface shadow-[var(--shadow-soft)]">
          <div className="flag-strip" />
          <div className="grid gap-px bg-border sm:grid-cols-3">
            <div className="bg-bg-elevated px-5 py-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-line">
                Quem forma
              </p>
              <p className="mt-1.5 text-sm font-extrabold text-fg">
                {BRAND.firm}
              </p>
              <p className="mt-0.5 text-xs text-fg-muted">
                O maior escritório dos EUA
              </p>
            </div>
            <div className="bg-bg-elevated px-5 py-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-line">
                Quem se destaca
              </p>
              <p className="mt-1.5 text-sm font-extrabold text-fg">
                É contratado
              </p>
              <p className="mt-0.5 text-xs text-fg-muted">
                Entra no time do escritório
              </p>
            </div>
            <div className="bg-bg-elevated px-5 py-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-line">
                Remuneração
              </p>
              <p className="mt-1.5 text-sm font-extrabold text-fg">
                Já em dólar
              </p>
              <p className="mt-0.5 text-xs text-fg-muted">
                Moeda forte desde o início
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          <article className="surface-card flex flex-col rounded-[var(--radius-2xl)] p-6 md:p-7">
            <span className="inline-flex w-fit rounded-full bg-navy/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-line">
              {COURSE_SELF.badge}
            </span>
            <h2 className="mt-3 font-display text-xl font-extrabold tracking-tight text-fg">
              {COURSE_SELF.shortName}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {COURSE_SELF.format}
            </p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-fg-subtle">
              {COURSE_SELF.startLabel}
            </p>
            <p className="mt-4 font-display text-4xl font-extrabold tracking-tight text-fg">
              <span className="text-wa">{COURSE_SELF.installments}×</span> R$
              {COURSE_SELF.installmentValue}
            </p>
            <p className="mt-1 text-sm text-fg-muted">
              ou {COURSE_SELF.cashLabel}
            </p>
            <p className="mt-3 text-xs font-semibold text-fg-subtle">
              {COURSE_SELF.hoursLabel}, {COURSE_SELF.hoursDetail}
            </p>
            <div className="mt-6">
              <WhatsAppCta fullWidth label="Quero no meu ritmo" size="md" />
            </div>
          </article>

          <article className="relative flex flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-brand-red/35 bg-surface p-6 shadow-[var(--shadow-soft)] md:p-7">
            <div className="flag-strip absolute inset-x-0 top-0" />
            <span className="mt-1 inline-flex w-fit rounded-full bg-brand-red-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-red">
              {COURSE_LIVE.badge}
            </span>
            <h2 className="mt-3 font-display text-xl font-extrabold tracking-tight text-fg">
              {COURSE_LIVE.shortName}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              {COURSE_LIVE.format}
            </p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-fg-subtle">
              {COURSE_LIVE.startLabel}
            </p>
            <p className="mt-4 font-display text-4xl font-extrabold tracking-tight text-fg">
              <span className="text-wa">{COURSE_LIVE.installments}×</span> R$
              {COURSE_LIVE.installmentValue}
            </p>
            <p className="mt-1 text-sm text-fg-muted">{COURSE_LIVE.planLabel}</p>
            <p className="mt-3 text-xs font-semibold text-fg-subtle">
              {COURSE_LIVE.hoursLabel}, {COURSE_LIVE.hoursDetail}
            </p>
            <div className="mt-6">
              <WhatsAppCta fullWidth label="Quero com aulas ao vivo" size="md" />
            </div>
          </article>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Crown,
              t: "Maior escritório",
              d: "dos Estados Unidos",
            },
            {
              icon: Building2,
              t: BRAND.firm,
              d: "Quem forma e contrata",
            },
            {
              icon: BadgeDollarSign,
              t: "Melhores alunos",
              d: "Já faturam em dólar",
            },
            {
              icon: ShieldCheck,
              t: "Sem inglês obrigatório",
              d: "Diferencial, não barreira",
            },
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
