const faqs = [
  {
    q: "Qual a diferença entre as duas modalidades?",
    a: "A modalidade no seu ritmo é 100% online, sem aulas ao vivo: 84h no portal, início a qualquer momento, R$ 2.000 em 4× R$ 500 sem entrada. A modalidade com aulas ao vivo começa em 30 de agosto de 2026, tem 116h (32h ao vivo + 84h gravadas), R$ 3.000 com entrada de R$ 1.000 + 5× R$ 400.",
  },
  {
    q: "Preciso falar inglês?",
    a: "Não. Inglês não é requisito para se matricular nem para acompanhar a formação. Se você já fala, é um diferencial, mas zero inglês não te impede de entrar.",
  },
  {
    q: "As aulas ao vivo são obrigatórias na turma de agosto?",
    a: "Sim, essa modalidade inclui encontros ao vivo (domingos e terças/quintas). O ideal é estudar o conteúdo do portal antes de cada encontro. Quem chega sem o estudo prévio sente mais dificuldade na prática.",
  },
  {
    q: "Na modalidade no ritmo livre, quando começo?",
    a: "A qualquer momento. O acesso é liberado assim que a matrícula é confirmada. O conteúdo sai em blocos no portal para você estudar no seu horário.",
  },
  {
    q: "O que eu recebo ao concluir?",
    a: "O certificado Go Visa Courses. Você pode receber mais de um certificado ao longo da formação, conforme módulos e etapas concluídos.",
  },
  {
    q: "Como faço a matrícula?",
    a: "Preencha a ficha de qualificação na página. O sistema monta sua ficha com a modalidade escolhida e encaminha pro WhatsApp da equipe para finalizar.",
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
