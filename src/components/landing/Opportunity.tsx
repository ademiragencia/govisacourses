import { Building2, Home, Languages, TrendingUp } from "lucide-react";
import { Reveal } from "./Reveal";

const points = [
  {
    icon: TrendingUp,
    title: "Um mercado que só cresce",
    body: "A imigração para os EUA não para, e faltam profissionais preparados para montar e organizar os processos. Sobra trabalho, falta gente qualificada.",
  },
  {
    icon: Languages,
    title: "O brasileiro tem vantagem",
    body: "Escritórios americanos precisam de quem atenda a comunidade brasileira e latina. Você não compete com o mercado local. Você preenche uma falta dele.",
  },
  {
    icon: Home,
    title: "Trabalho remoto, renda em dólar",
    body: "É um trabalho que se faz de qualquer lugar do Brasil, pelo computador. A remuneração dos destaques é em dólar, com o poder de compra que isso traz.",
  },
  {
    icon: Building2,
    title: "Formação e emprego no mesmo lugar",
    body: "Você não sai da formação com um certificado e a mão na frente. Quem se destaca é avaliado para atuar com a própria Go Visa Law Firm.",
  },
];

export function Opportunity() {
  return (
    <section id="oportunidade" className="border-t border-border py-20 md:py-28">
      <div className="container-lp">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow eyebrow-center justify-center">A oportunidade</p>
            <h2 className="display mt-3 text-[clamp(1.85rem,3.6vw,2.85rem)] text-fg">
              Por que agora é a hora
            </h2>
            <p className="mt-4 text-base leading-relaxed text-fg-muted">
              Não é promessa vazia. É a soma de um mercado aquecido, uma
              vantagem que é sua, e uma porta de entrada real.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-14 max-w-4xl divide-y divide-border">
          {points.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 70}>
              <article className="group grid grid-cols-[auto_1fr] items-start gap-5 py-7 md:grid-cols-[6rem_auto_1fr] md:gap-8">
                <span className="num-outline hidden text-[3.5rem] md:block">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex size-12 items-center justify-center rounded-[var(--radius-lg)] bg-brand-red-soft text-brand-red transition-colors group-hover:bg-brand-red group-hover:text-white">
                  <Icon className="size-6" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold tracking-tight text-fg">{title}</h3>
                  <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-fg-muted">
                    {body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
