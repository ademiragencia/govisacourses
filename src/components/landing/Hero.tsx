import { BadgeCheck, DollarSign, Globe, PlayCircle } from "lucide-react";
import { COURSE_LIVE } from "@/lib/config";
import { MatriculaCta } from "./MatriculaCta";

const CHIPS = [
  { icon: Globe, label: "Sem inglês obrigatório" },
  { icon: BadgeCheck, label: "Certificação profissional" },
  { icon: DollarSign, label: "Contratação em dólar" },
];

export function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden pt-8 pb-4 md:pt-14 md:pb-8">
      <div className="hero-aurora" aria-hidden />
      <div className="container-lp relative">
        <div className="mx-auto max-w-3xl text-center hook-in">
          <p className="eyebrow eyebrow-center justify-center">
            Go Visa Courses · imigração americana
          </p>

          <h1 className="display mx-auto mt-5 max-w-3xl text-[clamp(2.1rem,5.2vw,3.6rem)] text-fg">
            Trabalhe com imigração americana e comece a receber{" "}
            <span className="text-gold-grad">em dólar</span> — sem sair do Brasil.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-relaxed text-fg-muted">
            Uma formação que nasceu dentro de um escritório de advocacia
            americano — não de uma escola. Você aprende na prática, ao vivo, e
            os alunos que mais se destacam são contratados pela Go Visa Law
            Firm, já faturando em moeda forte.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <MatriculaCta label="Quero minha vaga" className="w-full sm:w-auto" />
            <a
              href="#vsl"
              className="inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border-strong px-6 text-[0.95rem] font-bold text-fg transition-colors hover:bg-white/5 sm:w-auto"
            >
              <PlayCircle className="size-5 text-brand-red" strokeWidth={2} />
              Assistir apresentação
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {CHIPS.map(({ icon: Icon, label }) => (
              <span key={label} className="chip">
                <Icon className="size-4" strokeWidth={2} />
                {label}
              </span>
            ))}
          </div>

          <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-brand-red/30 bg-surface/60 px-5 py-3 text-sm backdrop-blur-sm">
            <span className="live-dot" />
            <span className="text-fg-muted">
              Turma ao vivo · <strong className="text-fg">início 30 de agosto</strong> ·{" "}
              <span className="text-fg-subtle line-through">
                {COURSE_LIVE.listPriceLabel}
              </span>{" "}
              <strong className="text-fg">{COURSE_LIVE.priceLabel}</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
