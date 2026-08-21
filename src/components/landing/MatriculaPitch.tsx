import {
  BadgeDollarSign,
  Building2,
  Check,
  Clock,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { BRAND, COURSE_LIVE } from "@/lib/config";
import { Countdown } from "@/components/landing/Countdown";

const OBJECTIONS = [
  {
    q: "E se eu não falar inglês?",
    a: "Não precisa. A formação é em português. Inglês não trava a vaga nem a aula.",
  },
  {
    q: "Vou conseguir pagar?",
    a: "Pix à vista de R$ 3.000, entrada de R$ 1.000 + 5× R$ 400 no Pix, ou cartão em até 10×. Você escolhe na matrícula.",
  },
  {
    q: "Isso vira emprego de verdade?",
    a: `Os melhores alunos são avaliados pela ${BRAND.firm} e já entram ganhando em dólar. Não é promessa de diploma. É porta de entrada no maior escritório.`,
  },
  {
    q: "E se eu travar no meio?",
    a: "Aula ao vivo com professor. Portal com 116h. Time no WhatsApp depois da matrícula. Você não fica sozinho.",
  },
];

export function MatriculaPitch() {
  return (
    <div className="lg:pt-1">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-red/40 bg-brand-red-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-red">
        Turma {COURSE_LIVE.startLabel.replace("Início em ", "")} · vagas desta condição
      </div>

      <h1 className="display text-[clamp(1.85rem,4vw,2.85rem)] text-fg">
        Entra na formação que o maior escritório dos EUA usa pra contratar
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-fg-muted">
        Você não está comprando um curso solto. Está entrando no método da{" "}
        {BRAND.firm}. Quem se destaca é avaliado pro time e já fatura em dólar.
        Sem inglês obrigatório.
      </p>

      <div className="mt-6 rounded-[var(--radius-xl)] border border-brand-red/35 bg-bg-elevated p-5">
        <p className="text-sm text-fg-muted line-through">
          De {COURSE_LIVE.listPriceLabel}
        </p>
        <p className="font-display text-3xl font-extrabold text-fg">
          {COURSE_LIVE.priceLabel}
        </p>
        <p className="mt-1 text-sm text-fg-muted">
          R$ 3.000 no Pix, entrada de R$ 1.000 + 5× R$ 400, ou em até 10× no cartão.
        </p>
        <p className="mt-2 text-xs text-fg-subtle">
          {COURSE_LIVE.startLabel} · {COURSE_LIVE.hoursLabel}
        </p>
        <div className="mt-4">
          <Countdown />
        </div>
      </div>

      <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
        {[
          { icon: GraduationCap, t: "Aulas ao vivo", d: "Professor + portal com 116h" },
          { icon: Building2, t: BRAND.firm, d: "Maior escritório dos EUA" },
          { icon: BadgeDollarSign, t: "Contratação em dólar", d: "Destaques entram no time" },
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

      <div className="mt-8">
        <h3 className="font-display text-lg font-extrabold text-fg">
          O que entra na matrícula
        </h3>
        <ul className="mt-3 grid gap-2">
          {COURSE_LIVE.includes.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-fg-muted">
              <Check className="mt-0.5 size-4 shrink-0 text-gold-line" strokeWidth={2.5} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="font-display text-lg font-extrabold text-fg">
          O que costuma travar a decisão
        </h3>
        <ul className="mt-3 space-y-3">
          {OBJECTIONS.map((item) => (
            <li
              key={item.q}
              className="rounded-[var(--radius-lg)] border border-border px-4 py-3"
            >
              <p className="text-sm font-bold text-fg">{item.q}</p>
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">{item.a}</p>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-fg-subtle">
        <Clock className="mt-0.5 size-3.5 shrink-0" />
        Acesso liberado depois da confirmação. Pix ou cartão. Os dados do
        formulário servem só para emitir o contrato.
      </p>
    </div>
  );
}
