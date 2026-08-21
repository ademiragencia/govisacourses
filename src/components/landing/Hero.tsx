import { BadgeCheck, DollarSign, Globe, PlayCircle } from "lucide-react";
import { COURSE_LIVE } from "@/lib/config";
import { MatriculaCta } from "./MatriculaCta";
import { VslYouTube } from "./VslYouTube";

const CHIPS = [
  { icon: Globe, label: "Sem inglês obrigatório" },
  { icon: BadgeCheck, label: "Certificação profissional" },
  { icon: DollarSign, label: "Contratação em dólar" },
];

export function Hero() {
  return (
    <section id="topo" className="relative overflow-hidden pt-8 pb-14 md:pt-12 md:pb-20">
      <div className="hero-aurora" aria-hidden />
      <div className="container-lp relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          {/* LEFT — copy */}
          <div className="hook-in text-center lg:text-left">
            <p className="eyebrow justify-center lg:justify-start">
              Go Visa Courses · imigração americana
            </p>

            <h1 className="display mt-5 text-[clamp(2.15rem,5vw,3.7rem)] text-fg">
              Trabalhe com imigração americana e receba{" "}
              <span className="text-gold-grad">em dólar</span>.
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-[1.05rem] leading-relaxed text-fg-muted lg:mx-0">
              Uma formação que nasceu dentro de um escritório de advocacia
              americano, não de uma escola. Aprenda na prática, ao vivo, e os
              alunos que mais se destacam são contratados pela Go Visa Law Firm,
              já faturando em moeda forte.
            </p>

            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row lg:justify-start">
              <MatriculaCta label="Quero minha vaga" className="w-full sm:w-auto" />
              <a
                href="#vsl"
                className="inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border-strong bg-white px-6 text-[0.95rem] font-bold text-navy transition-colors hover:bg-bg-elevated sm:w-auto"
              >
                <PlayCircle className="size-5 text-brand-red" strokeWidth={2} />
                Ver como funciona
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              {CHIPS.map(({ icon: Icon, label }) => (
                <span key={label} className="chip">
                  <Icon className="size-4" strokeWidth={2} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — video */}
          <div id="vsl" className="relative mx-auto w-full max-w-xl scroll-mt-24">
            <div className="vsl-glow overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-navy-deep">
              <div className="flag-strip" />
              <VslYouTube />
            </div>

            {/* floating live badge */}
            <span className="absolute -left-2 -top-3 inline-flex items-center gap-1.5 rounded-full bg-brand-red px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_10px_26px_rgba(241,66,63,0.4)]">
              <span className="size-1.5 rounded-full bg-white" />
              Apresentação oficial
            </span>

            {/* floating price card */}
            <div className="absolute -bottom-6 right-0 flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-white px-4 py-3 shadow-[var(--shadow-soft)] sm:-right-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-red-soft text-brand-red">
                <DollarSign className="size-5" strokeWidth={2.25} />
              </div>
              <div className="leading-tight">
                <p className="text-xs text-fg-subtle line-through">
                  {COURSE_LIVE.listPriceLabel}
                </p>
                <p className="font-display text-lg font-extrabold text-fg">
                  {COURSE_LIVE.priceLabel}{" "}
                  <span className="text-xs font-bold text-fg-subtle">· hoje</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* trust strip under the fold */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-border pt-7 text-center lg:mt-14">
          {[
            "Turma ao vivo · início 30 de agosto",
            "116h de formação · 32h ao vivo",
            "Vagas limitadas",
          ].map((t) => (
            <span
              key={t}
              className="text-xs font-bold uppercase tracking-[0.12em] text-fg-subtle"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
