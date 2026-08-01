import { useState } from "react";
import { Play, Quote } from "lucide-react";

/** Provas em vídeo (YouTube). Carrega só após o clique — evita bloqueio do navegador. */
const PROOFS = [
  {
    id: "NJEyGpDxTCQ",
    title: "Depoimento de aluno",
    subtitle: "Formação Go Visa Courses",
  },
];

function youtubeThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function youtubeEmbed(id: string) {
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;
}

function ProofVideo({
  id,
  title,
  subtitle,
}: {
  id: string;
  title: string;
  subtitle: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <article className="surface-card w-full max-w-[360px] overflow-hidden rounded-[var(--radius-2xl)]">
      <div className="relative aspect-[9/16] w-full bg-black">
        {playing ? (
          <iframe
            src={youtubeEmbed(id)}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex items-center justify-center"
            aria-label={`Assistir: ${title}`}
          >
            <img
              src={youtubeThumb(id)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
              loading="lazy"
              decoding="async"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
            <span className="relative z-10 flex size-16 items-center justify-center rounded-full bg-brand-red text-white shadow-[0_12px_40px_rgba(225,29,46,0.45)] transition group-hover:scale-105">
              <Play className="ml-0.5 size-7 fill-white" />
            </span>
            <span className="absolute bottom-4 left-4 right-4 z-10 text-left text-xs font-semibold text-white/90">
              Toque para assistir o depoimento
            </span>
          </button>
        )}
      </div>
      <div className="border-t border-border p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-red-soft text-brand-red">
            <Quote className="size-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-fg">{title}</p>
            <p className="mt-0.5 text-xs text-fg-subtle">{subtitle}</p>
          </div>
        </div>
      </div>
    </article>
  );
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

        <div className="mx-auto mt-12 flex max-w-4xl flex-col items-center gap-8 sm:flex-row sm:flex-wrap sm:justify-center lg:items-stretch">
          {PROOFS.map((proof) => (
            <ProofVideo key={proof.id} {...proof} />
          ))}
        </div>
      </div>
    </section>
  );
}
