import { Building2, Home, Languages, TrendingUp } from "lucide-react";
import { Reveal } from "./Reveal";

const points = [
  {
    icon: TrendingUp,
    title: "Um mercado que só cresce",
    body: "A imigração para os EUA não para — e faltam profissionais preparados para montar e organizar os processos. Sobra trabalho, falta gente qualificada.",
  },
  {
    icon: Languages,
    title: "O brasileiro tem vantagem",
    body: "Escritórios americanos precisam de profissionais que atendam a comunidade brasileira e latina. Você não compete com o mercado local — você preenche uma falta dele.",
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

        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {points.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 80}>
              <article className="surface-card h-full rounded-[var(--radius-xl)] p-6 md:p-7">
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
