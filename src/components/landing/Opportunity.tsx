import { BRAND } from "@/lib/config";
import { BadgeDollarSign, Briefcase, Crown, Trophy } from "lucide-react";

const points = [
  {
    icon: Crown,
    title: "O maior escritório dos Estados Unidos",
    body: `A ${BRAND.firm} é o maior escritório dos EUA por trás desta formação. Você treina no padrão de quem opera imigração em escala real.`,
  },
  {
    icon: Trophy,
    title: "Os melhores alunos são contratados",
    body: `Quem mais se destaca na formação é avaliado para entrar no time da ${BRAND.firm}, o maior escritório dos EUA.`,
  },
  {
    icon: BadgeDollarSign,
    title: "Já faturando em dólar",
    body: "A contratação dos destaques já nasce em moeda forte. Você não espera “anos depois” para pensar em dólar.",
  },
  {
    icon: Briefcase,
    title: "Padrão de escritório de verdade",
    body: "Documentação, petition packages, ética e rotina profissional: o que o maior escritório exige no dia a dia.",
  },
];

export function Opportunity() {
  return (
    <section id="autoridade" className="border-t border-border py-20 md:py-28">
      <div className="container-lp">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">O maior escritório dos EUA</p>
          <h2 className="display mt-3 text-[clamp(1.85rem,3.5vw,2.85rem)] text-fg">
            {BRAND.firm}.
            <br />
            <span className="text-gold-line">O maior escritório</span>
            <span className="text-fg"> forma. Contrata. Em dólar.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-fg-muted">
            {BRAND.hiringPromise}. A formação prepara você para o padrão do
            maior escritório dos Estados Unidos.
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
