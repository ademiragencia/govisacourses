import { BadgeDollarSign, Briefcase, GraduationCap, Users } from "lucide-react";

const points = [
  {
    icon: Users,
    title: "Mais de 40 profissionais no remoto",
    body: "A Go Visa já opera com um time no Brasil: atendimento, vendas, preparação de processo, administrativo, marketing e paralegal. Muita gente começou do zero.",
  },
  {
    icon: BadgeDollarSign,
    title: "De R$ 3.500 a mais de R$ 28 mil",
    body: "A faixa atual depende da função e da evolução. Um profissional do time, que nunca tinha ouvido falar de imigração, hoje fatura cerca de R$ 18 mil por mês.",
  },
  {
    icon: GraduationCap,
    title: "Do básico ao avançado",
    body: "Sistema americano, Green Card, cidadania, família, trabalho, casos humanitários, montagem de pedido, organização de documentos e formulários.",
  },
  {
    icon: Briefcase,
    title: "Feito por quem vive o escritório",
    body: "A metodologia nasceu da prática da Go Visa: Flórida, Texas, Massachusetts, Washington DC e Go Visa Rio. Você aprende como o mercado funciona de verdade.",
  },
];

export function Opportunity() {
  return (
    <section id="autoridade" className="border-t border-border py-20 md:py-28">
      <div className="container-lp">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">O que o vídeo mostra</p>
          <h2 className="display mt-3 text-[clamp(1.85rem,3.5vw,2.85rem)] text-fg">
            Você não precisa ser advogado.
            <br />
            <span className="text-gold-line">Nem falar inglês.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-fg-muted">
            Enquanto milhares de brasileiros buscam visto e cidadania, o
            escritório precisa de gente preparada para atender essa demanda.
            A formação existe para formar esse profissional.
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
