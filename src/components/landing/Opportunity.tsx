import { Briefcase, FileCheck2, Globe2, Laptop } from "lucide-react";

const points = [
  {
    icon: Globe2,
    title: "Mercado real de imigração",
    body: "Escritórios e operações de imigração precisam de profissionais treinados em documentação, vistos e fluxos do USCIS.",
  },
  {
    icon: FileCheck2,
    title: "Do formulário ao petition package",
    body: "Você aprende triagem, elegibilidade, montagem de processos e acompanhamento de status com método profissional.",
  },
  {
    icon: Briefcase,
    title: "Atuação ética e profissional",
    body: "Limites de atuação, ética, sigilo e comunicação com o advogado responsável: o padrão de quem trabalha de verdade na área.",
  },
  {
    icon: Laptop,
    title: "100% online, duas formas de estudar",
    body: "No seu ritmo com portal gravado, ou com aulas ao vivo e professor. Você escolhe o formato que encaixa na sua rotina.",
  },
];

export function Opportunity() {
  return (
    <section id="autoridade" className="border-t border-border py-20 md:py-28">
      <div className="container-lp">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">A oportunidade</p>
          <h2 className="display mt-3 text-[clamp(1.85rem,3.5vw,2.85rem)] text-fg">
            Capacitação completa para
            <br />
            <span className="text-fg-muted">atuar em processos imigratórios</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-fg-muted">
            Formação profissional Go Visa Courses: fundamentos jurídicos,
            documentação, categorias de vistos, ferramentas e prática aplicada.
          </p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {points.map(({ icon: Icon, title, body }) => (
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
          ))}
        </div>
      </div>
    </section>
  );
}
