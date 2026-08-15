import { BRAND } from "@/lib/config";

const faqs = [
  {
    q: "É mesmo o maior escritório dos Estados Unidos?",
    a: `Sim. A formação é ligada à ${BRAND.firm}, ${BRAND.firmRank}. É o padrão e a marca por trás da capacitação e da contratação dos destaques.`,
  },
  {
    q: "Os melhores alunos são contratados de verdade?",
    a: `Sim. Os alunos que mais se destacam são avaliados para contratação pela ${BRAND.firm}, o maior escritório dos EUA, e já entram faturando em dólar. Não é vaga para todo mundo: é por desempenho.`,
  },
  {
    q: "Qual é a formação?",
    a: "Uma única modalidade: online com aulas ao vivo. Começa em 30 de agosto de 2026, 116h (32h ao vivo + 84h gravadas). De R$ 14.997 por R$ 3.000 no Pix, entrada de R$ 1.000 + 5× R$ 400, ou em até 10× no cartão.",
  },
  {
    q: "Preciso falar inglês?",
    a: "Não. Inglês não é requisito para se matricular nem para acompanhar a formação. Se você já fala, é um diferencial, mas zero inglês não te impede de entrar.",
  },
  {
    q: "A contratação é garantida para todo mundo?",
    a: `Não. O maior escritório dos EUA contrata quem mais se destaca. O desempenho durante a formação é o que abre a porta, e quem entra já começa faturando em dólar.`,
  },
  {
    q: "Já saio ganhando em dólar?",
    a: `Quem é contratado ao se destacar já entra remunerado em dólar na ${BRAND.firm}. A vaga dos destaques já nasce em moeda forte.`,
  },
  {
    q: "Como faço a matrícula?",
    a: "Preencha a matrícula na página. No Pix é R$ 3.000 à vista, ou entrada de R$ 1.000 + 5× R$ 400. No cartão você escolhe de 1× a 10×. Depois a equipe libera o acesso da turma.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border bg-bg-elevated py-20 md:py-28">
      <div className="container-lp">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Dúvidas</p>
          <h2 className="display mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] text-fg">
            Direto ao ponto
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-2xl space-y-2">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="faq-item group rounded-[var(--radius-lg)] border border-border bg-surface/60 open:bg-surface"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-[0.95rem] font-bold text-fg md:px-6 md:py-5">
                {item.q}
                <span className="faq-chevron shrink-0 text-fg-subtle transition-transform duration-200">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <div className="border-t border-border px-5 pb-5 pt-3 text-sm leading-relaxed text-fg-muted md:px-6 md:pb-6">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
