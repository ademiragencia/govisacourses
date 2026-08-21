import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

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

export function VslYouTube({ className }: { className?: string }) {
  const frameId = useId().replace(/:/g, "");
  const playerRef = useRef<YtPlayer | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadYtApi().then(() => {
      if (cancelled || !window.YT?.Player) return;
      if (!document.getElementById(frameId)) return;
      playerRef.current = new window.YT.Player(frameId, {
        events: {
          // Force sound only once, on load — never on state change,
          // otherwise pausing would immediately resume the video.
          onReady: (e) => {
            killCaptions(e.target);
            forceSound(e.target);
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
  }, [frameId]);

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden", className)}>
      <iframe
        id={frameId}
        src={embedSrc()}
        title="Apresentação da formação"
        className="absolute inset-0 h-full w-full max-w-full border-0"
        allow="autoplay; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
        tabIndex={-1}
      />
    </div>
  );
}
