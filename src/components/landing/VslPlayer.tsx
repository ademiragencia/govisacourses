import { useCallback, useRef, useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src?: string;
  poster?: string;
  className?: string;
};

export function VslPlayer({
  src = "/assets/vsl-v2.mp4",
  poster = "/assets/vsl-poster.jpg",
  className,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = useCallback(() => {
    const video = videoRef.current;
    if (!video || playing) return;
    setPlaying(true);
    video.controls = true;
    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        video.muted = true;
        video.play().catch(() => {
          setPlaying(false);
        });
      });
    }
  }, [playing]);

  return (
    <div
      className={cn("vsl-frame", playing && "vsl-playing", className)}
      role="button"
      tabIndex={0}
      aria-label="Assistir ao vídeo de apresentação"
      onClick={(e) => {
        const video = videoRef.current;
        if (!video) return;
        if (e.target === video && !video.paused) return;
        if (!playing) start();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          start();
        }
      }}
    >
      <video
        ref={videoRef}
        id="vsl-video"
        preload="metadata"
        playsInline
        src={src}
        poster={poster}
        className="bg-black"
      />
      <div className="vsl-play">
        <span className="vsl-play-btn relative">
          <Play className="ml-1 size-[34%] fill-white text-white" />
        </span>
        <div className="vsl-hint">Assista antes de fechar esta página</div>
      </div>
    </div>
  );
}
