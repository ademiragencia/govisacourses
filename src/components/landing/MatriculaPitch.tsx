import {
  BadgeDollarSign,
  Building2,
  Check,
  Clock,
  Globe2,
  GraduationCap,
  Monitor,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { BRAND, COURSE_LIVE, COURSE_SELF, PROGRAM_MODULES } from "@/lib/config";

export function MatriculaPitch() {
  return (
    <div className="lg:pt-1">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-line/40 bg-gold-line/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-gold-line">
        <Building2 className="size-3.5" />
        {BRAND.firm} · maior escritório dos EUA
      </div>

      <h1 className="display text-[clamp(1.85rem,4vw,2.85rem)] text-fg">
        Formação Profissional em{" "}
        <span className="text-gold-line">Processos Imigratórios</span>
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-fg-muted">
        Capacitação 100% online para atuar com vistos, green card e
        documentação americana. Ligada à {BRAND.firm}. Os melhores alunos são
        avaliados para contratação e já faturam em dólar. Inglês não é
        obrigatório.
      </p>

      <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
        {[
          { icon: GraduationCap, t: "Formação profissional", d: "Processos imigratórios de ponta a ponta" },
          { icon: Globe2, t: "100% online", d: "No seu ritmo ou com aulas ao vivo" },
          { icon: BadgeDollarSign, t: "Contratação em dólar", d: `Destaques entram na ${BRAND.firm}` },
          { icon: ShieldCheck, t: "Sem inglês obrigatório", d: "Dá para acompanhar do zero" },
        ].map(({ icon: Icon, t, d }) => (
          <div
            key={t}
            className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-surface/60 px-3.5 py-3"
          >
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-brand-red-soft text-brand-red">
              <Icon className="size-4" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-bold text-fg">{t}</p>
              <p className="text-xs leading-relaxed text-fg-muted">{d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-3">
        <article className="rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5">
          <div className="flex items-center gap-2 text-gold-line">
            <Monitor className="size-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
              {COURSE_SELF.badge}
            </span>
          </div>
          <h2 className="mt-2 font-display text-lg font-extrabold text-fg">
            {COURSE_SELF.shortName}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
            {COURSE_SELF.format} {COURSE_SELF.startLabel}.
          </p>
          <p className="mt-3 font-display text-2xl font-extrabold text-fg">
            {COURSE_SELF.planLabel}
          </p>
          <p className="mt-0.5 text-xs text-fg-subtle">
            {COURSE_SELF.hoursLabel} · {COURSE_SELF.hoursDetail}
          </p>
        </article>

        <article className="rounded-[var(--radius-xl)] border border-brand-red/35 bg-bg-elevated p-5">
          <div className="flex items-center gap-2 text-brand-red">
            <Radio className="size-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
              {COURSE_LIVE.badge}
            </span>
          </div>
          <h2 className="mt-2 font-display text-lg font-extrabold text-fg">
            {COURSE_LIVE.shortName}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
            {COURSE_LIVE.format} {COURSE_LIVE.startLabel}.
          </p>
          <p className="mt-3 font-display text-2xl font-extrabold text-fg">
            {COURSE_LIVE.planLabel}
          </p>
          <p className="mt-0.5 text-xs text-fg-subtle">
            {COURSE_LIVE.hoursLabel} · {COURSE_LIVE.hoursDetail}
          </p>
        </article>
      </div>

      <div className="mt-8">
        <h3 className="font-display text-lg font-extrabold text-fg">
          O que você vai dominar
        </h3>
        <ul className="mt-3 space-y-2">
          {PROGRAM_MODULES.slice(0, 5).map((m) => (
            <li key={m.title} className="flex items-start gap-2.5 text-sm text-fg-muted">
              <Check className="mt-0.5 size-4 shrink-0 text-wa" strokeWidth={2.5} />
              <span>
                <strong className="font-semibold text-fg">{m.title}.</strong>{" "}
                {m.items.slice(0, 3).join(", ")}.
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="font-display text-lg font-extrabold text-fg">
          O que entra na matrícula
        </h3>
        <ul className="mt-3 grid gap-2">
          {COURSE_SELF.includes.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-fg-muted">
              <Check className="mt-0.5 size-4 shrink-0 text-gold-line" strokeWidth={2.5} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-fg-subtle">
        <Clock className="mt-0.5 size-3.5 shrink-0" />
        Acesso liberado após a confirmação do pagamento no cartão de crédito.
      </p>
    </div>
  );
}
