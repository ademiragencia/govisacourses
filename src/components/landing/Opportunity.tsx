import { CalendarDays, GraduationCap, MonitorPlay, Trophy } from "lucide-react";
import { Reveal } from "./Reveal";
import { BRAND, COURSE_LIVE } from "@/lib/config";

const points = [
  {
    icon: MonitorPlay,
    title: "Turma ao vivo, não gravada solta",
    body: `${COURSE_LIVE.format}. Você acompanha o professor e usa o portal com o material da formação.`,
  },
  {
    icon: CalendarDays,
    title: COURSE_LIVE.startLabel,
    body: `${COURSE_LIVE.hoursDetail}. ${COURSE_LIVE.startDetail}`,
  },
  {
    icon: Trophy,
    title: "Destaques avaliados pelo escritório",
    body: `Quem mais se destaca pode ser chamado para o time da ${BRAND.firm}. Isso acontece depois da formação, não no anúncio.`,
  },
  {
    icon: GraduationCap,
    title: "Matrícula hoje, neste valor",
    body: `De ${COURSE_LIVE.listPriceLabel} por ${COURSE_LIVE.priceLabel}. À vista no cartão ou entrada de R$ 1.000 + 7× R$ 400.`,
  },
];

export function Opportunity() {
  return (
    <section id="autoridade" className="border-t border-border py-20 md:py-28">
      <div className="container-lp">
        <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Depois do vídeo</p>
          <h2 className="display mt-3 text-[clamp(1.85rem,3.5vw,2.85rem)] text-fg">
            A condição, a turma e o próximo passo.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-fg-muted">
            O vídeo apresenta a formação. Aqui está o que você precisa para
            entrar: data, formato e o valor de hoje.
          </p>
        </div>
        </Reveal>

        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {points.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 80}>
            <article
              key={title}
              className="surface-card rounded-[var(--radius-xl)] p-6 md:p-7"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-brand-red-soft text-brand-red">
                <Icon className="size-5" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-fg">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{body}</p>
            </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
