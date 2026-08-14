import { useEffect, useId, useRef } from "react";
import { MatriculaCta } from "./MatriculaCta";

const VSL_ID = "3hq7TpBYhsU";

type YtPlayer = {
  unloadModule: (name: string) => void;
  mute: () => void;
  unMute: () => void;
  playVideo: () => void;
  setVolume: (n: number) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: string | HTMLElement,
        opts: {
          events?: {
            onReady?: (e: { target: YtPlayer }) => void;
            onStateChange?: (e: { target: YtPlayer }) => void;
            onApiChange?: (e: { target: YtPlayer }) => void;
          };
        },
      ) => YtPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function embedSrc() {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://www.govisacourses.com.br";
  const p = new URLSearchParams({
    autoplay: "1",
    mute: "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    fs: "0",
    disablekb: "1",
    iv_load_policy: "3",
    controls: "1",
    cc_load_policy: "0",
    enablejsapi: "1",
    origin,
  });
  return `https://www.youtube-nocookie.com/embed/${VSL_ID}?${p.toString()}`;
}

function killCaptions(player: YtPlayer) {
  try {
    player.unloadModule("captions");
    player.unloadModule("cc");
  } catch {
    /* ignore */
  }
}

function forceSound(player: YtPlayer) {
  try {
    player.unMute();
    player.setVolume(100);
    player.playVideo();
  } catch {
    /* ignore */
  }
}

function loadYtApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  return new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector("script[src*='youtube.com/iframe_api']")) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
}

export function Vsl() {
  const frameId = useId().replace(/:/g, "");
  const playerRef = useRef<YtPlayer | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadYtApi().then(() => {
      if (cancelled || !window.YT?.Player) return;
      if (!document.getElementById(frameId)) return;
      playerRef.current = new window.YT.Player(frameId, {
        events: {
          onReady: (e) => {
            killCaptions(e.target);
            forceSound(e.target);
          },
          onStateChange: (e) => {
            killCaptions(e.target);
            forceSound(e.target);
          },
          onApiChange: (e) => killCaptions(e.target),
        },
      });
    });
    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, [frameId]);

  return (
    <section id="vsl" className="bg-bg pt-8 pb-8 md:pt-12 md:pb-10">
      <div className="container-lp">
        <div className="mx-auto mb-6 max-w-2xl text-center hook-in md:mb-8">
          <p className="eyebrow">Go Visa Law Firm · o maior escritório dos EUA</p>
          <h1 className="display mt-3 text-[clamp(1.9rem,4.4vw,3.1rem)] text-fg">
            Essa formação nasceu dentro do escritório.
            <br />
            <span className="text-gold-line">Não de uma escola.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-fg-muted">
            O vídeo é a apresentação oficial. Assista até o fim. Em seguida
            você vê a condição de hoje e se matricula.
          </p>
        </div>
        <div className="vsl-glow mx-auto max-w-4xl overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-bg">
          <div className="relative aspect-video w-full overflow-hidden">
            <iframe
              id={frameId}
              src={embedSrc()}
              title="Apresentação da formação"
              className="absolute left-0 top-0 w-full border-0"
              style={{ height: "calc(100% + 3.5rem)" }}
              allow="autoplay; encrypted-media"
              referrerPolicy="strict-origin-when-cross-origin"
              tabIndex={-1}
            />
            <div
              className="pointer-events-auto absolute inset-x-0 top-0 z-10 h-12 bg-bg md:h-14"
              aria-hidden
            />
          </div>
        </div>
        <div className="mx-auto mt-5 max-w-sm">
          <MatriculaCta fullWidth label="Quero me matricular" />
        </div>
      </div>
    </section>
  );
}
