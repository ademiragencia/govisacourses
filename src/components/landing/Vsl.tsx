import { useMemo, useState } from "react";
import { Volume2 } from "lucide-react";

const VSL_ID = "3hq7TpBYhsU";

function embedSrc(muted: boolean) {
  const p = new URLSearchParams({
    autoplay: "1",
    mute: muted ? "1" : "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    fs: "0",
    disablekb: "1",
    iv_load_policy: "3",
    controls: "1",
    cc_load_policy: "0",
  });
  return `https://www.youtube-nocookie.com/embed/${VSL_ID}?${p.toString()}`;
}

export function Vsl() {
  const [muted, setMuted] = useState(true);
  const [key, setKey] = useState(0);
  const src = useMemo(() => embedSrc(muted), [muted]);

  function unmute() {
    setMuted(false);
    setKey((k) => k + 1);
  }

  return (
    <section id="vsl" className="bg-bg pt-4 pb-8 md:pt-6 md:pb-10">
      <div className="container-lp">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-black shadow-[var(--shadow-soft)]">
          <div className="relative aspect-video w-full">
            <iframe
              key={key}
              src={src}
              title="Apresentação da formação"
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              tabIndex={-1}
            />
            {/* Cobre a barra do YouTube (título / compartilhar) */}
            <div
              className="pointer-events-auto absolute inset-x-0 top-0 z-10 h-12 bg-bg md:h-14"
              aria-hidden
            />
            {muted && (
              <button
                type="button"
                onClick={unmute}
                className="absolute bottom-4 left-1/2 z-20 flex h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-brand-red px-5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(225,29,46,0.35)]"
              >
                <Volume2 className="size-4" />
                Ativar som
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
