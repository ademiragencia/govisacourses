import { BRAND, COURSE_LIVE, COURSE_SELF } from "@/lib/config";
import { WhatsAppCta } from "./WhatsAppCta";
import {
  Award,
  BadgeDollarSign,
  Building2,
  MonitorPlay,
  ShieldCheck,
} from "lucide-react";

export function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden pb-16 pt-10 md:pb-24 md:pt-16">
      <div className="container-lp relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-brand-red/30 bg-brand-red-soft px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-fg">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-red opacity-60" />
              <span className="relative size-1.5 rounded-full bg-brand-red" />
            </span>
            Destaques contratados em dólar
            <span className="text-fg-subtle">|</span>
            <span>{BRAND.firm}</span>
          </div>

          <p className="eyebrow mb-4">Go Visa Courses | Formação profissional</p>

          <h1 className="display text-[clamp(2.15rem,5.4vw,3.7rem)] text-fg">
            Formação em Processos Imigratórios.
            <br />
            <span className="text-brand-red">
              Os melhores alunos são contratados pela Go Visa Law Firm e já
              faturam em dólar.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-fg-muted md:text-[1.1rem]">
            Capacitação 100% online com o maior escritório dos Estados Unidos, a{" "}
            <strong className="font-semibold text-fg">{BRAND.firm}</strong>.
            Estude, destaque-se na turma e dispute uma vaga já remunerada em
            dólar. Inglês não é obrigatório.
          </p>
        </div>

        {/* Hiring banner */}
        <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-[var(--radius-xl)] border border-gold-line/35 bg-surface shadow-[var(--shadow-card)]">
          <div className="flag-strip" />
          <div className="flex flex-col items-center gap-3 px-5 py-5 text-center sm:flex-row sm:text-left md:px-7">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brand-red-soft text-brand-red">
              <Building2 className="size-6" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-line">
                Oportunidade real de contratação
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug text-fg md:text-base">
                {BRAND.hiringPromise}. Não é estágio sem salário: quem mais se
                destaca entra no time do maior escritório dos EUA.
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
              {COURSE_SELF.priceLabel}, {COURSE_SELF.entryLabel}
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
              icon: Building2,
              t: BRAND.firm,
              d: "Maior escritório dos EUA",
            },
            {
              icon: BadgeDollarSign,
              t: "Melhores alunos",
              d: "Contratados em dólar",
            },
            {
              icon: MonitorPlay,
              t: "100% online",
              d: "Estude de qualquer lugar",
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
