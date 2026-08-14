import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Volume2 } from "lucide-react";

const VSL_ID = "3hq7TpBYhsU";

type YtPlayer = {
  unloadModule: (name: string) => void;
  mute: () => void;
  unMute: () => void;
  playVideo: () => void;
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

function embedSrc(muted: boolean) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://www.govisacourses.com.br";
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
    /* player ainda não tem o módulo */
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
  const [muted, setMuted] = useState(true);
  const [key, setKey] = useState(0);
  const frameId = useId().replace(/:/g, "");
  const playerRef = useRef<YtPlayer | null>(null);
  const src = useMemo(() => embedSrc(muted), [muted]);

  useEffect(() => {
    let cancelled = false;
    void loadYtApi().then(() => {
      if (cancelled || !window.YT?.Player) return;
      const el = document.getElementById(frameId);
      if (!el) return;
      playerRef.current = new window.YT.Player(frameId, {
        events: {
          onReady: (e) => {
            killCaptions(e.target);
            e.target.playVideo();
          },
          onStateChange: (e) => killCaptions(e.target),
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
  }, [frameId, key]);

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
              id={frameId}
              src={src}
              title="Apresentação da formação"
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; encrypted-media"
              referrerPolicy="strict-origin-when-cross-origin"
              tabIndex={-1}
            />
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
