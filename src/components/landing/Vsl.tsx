import { useState } from "react";
import { Play } from "lucide-react";
import { MatriculaCta } from "./MatriculaCta";

const VSL_ID = "3hq7TpBYhsU";

function embedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;
}

export function Vsl() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="vsl" className="border-t border-border py-16 md:py-24">
      <div className="container-lp">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Assista antes de decidir</p>
          <h2 className="display mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] text-fg">
            Entenda a formação em poucos minutos
          </h2>
          <p className="mt-4 text-base text-fg-muted">
            Como funciona a turma, o que você aprende e como os melhores alunos
            entram no maior escritório dos EUA.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-black shadow-[var(--shadow-soft)]">
          <div className="relative aspect-video w-full">
            {playing ? (
              <iframe
                src={embedUrl(VSL_ID)}
                title="Apresentação da formação Go Visa Courses"
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
                aria-label="Assistir a apresentação da formação"
              >
                <img
                  src={`https://i.ytimg.com/vi/${VSL_ID}/hqdefault.jpg`}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
                />
                <span className="absolute inset-0 bg-black/35" />
                <span className="relative z-10 flex size-16 items-center justify-center rounded-full bg-brand-red text-white shadow-[0_12px_40px_rgba(225,29,46,0.45)] transition group-hover:scale-105 md:size-20">
                  <Play className="ml-0.5 size-8 fill-white md:size-9" />
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-sm">
          <MatriculaCta fullWidth label="Garantir o valor de hoje" />
        </div>
      </div>
    </section>
  );
}
