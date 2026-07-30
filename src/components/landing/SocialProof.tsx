import { Quote } from "lucide-react";

/** Provas em vídeo (YouTube). Adicione novos itens aqui. */
const PROOFS = [
  {
    id: "NJEyGpDxTCQ",
    title: "Depoimento de aluno",
    subtitle: "Formação Go Visa Courses",
    platform: "youtube" as const,
  },
];

function youtubeEmbed(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
}

export function SocialProof() {
  return (
    <section id="provas" className="border-t border-border py-20 md:py-28">
      <div className="container-lp">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Prova social</p>
          <h2 className="display mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] text-fg">
            Quem já vive a formação
          </h2>
          <p className="mt-4 text-base leading-relaxed text-fg-muted">
            Ouça de quem está no caminho. Mais depoimentos entram aqui conforme
            a turma compartilha resultados.
          </p>
        </div>

        <div className="mx-auto mt-12 flex max-w-4xl flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:justify-center">
          {PROOFS.map((proof) => (
            <article
              key={proof.id}
              className="surface-card w-full max-w-[360px] overflow-hidden rounded-[var(--radius-2xl)]"
            >
              <div className="relative aspect-[9/16] w-full bg-black">
                <iframe
                  src={youtubeEmbed(proof.id)}
                  title={proof.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              <div className="border-t border-border p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-red-soft text-brand-red">
                    <Quote className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-fg">{proof.title}</p>
                    <p className="mt-0.5 text-xs text-fg-subtle">
                      {proof.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {/* Slot visual para próximos depoimentos */}
          <div className="hidden w-full max-w-[360px] flex-col justify-center rounded-[var(--radius-2xl)] border border-dashed border-border bg-surface/30 p-8 text-center lg:flex">
            <p className="text-sm font-bold text-fg">Próximos depoimentos</p>
            <p className="mt-2 text-xs leading-relaxed text-fg-muted">
              Conforme novos vídeos chegarem, esta área cresce com mais provas
              reais da turma.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
