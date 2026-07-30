import { BRAND } from "@/lib/config";

const steps = [
  {
    step: "1",
    title: "Escolha a modalidade",
    body: "No seu ritmo (84h no portal) ou com aulas ao vivo (116h total).",
  },
  {
    step: "2",
    title: "Preencha a ficha",
    body: "Formulário inteligente em minutos. A ficha vai pro WhatsApp da equipe.",
  },
  {
    step: "3",
    title: "Estude e se destaque",
    body: "Portal, prática e avaliações no padrão da Go Visa Law Firm.",
  },
  {
    step: "4",
    title: "Contratação em dólar",
    body: `Os melhores alunos são contratados pela ${BRAND.firm} e já faturam em dólar.`,
  },
];

export function Process() {
  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="container-lp">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">O caminho</p>
          <h2 className="display mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] text-fg">
            Da ficha à vaga em dólar
          </h2>
          <p className="mt-3 text-sm text-fg-muted">
            Formação + desempenho. Quem se destaca pode ser contratado pelo
            maior escritório dos EUA.
          </p>
        </div>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li
              key={s.step}
              className="surface-card relative rounded-[var(--radius-xl)] p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-red font-display text-lg font-extrabold text-white">
                {s.step}
              </span>
              <h3 className="mt-4 text-base font-bold text-fg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
