import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  label?: string;
  fullWidth?: boolean;
  size?: "md" | "lg";
};

export function MatriculaCta({
  className,
  label = "Matricular agora",
  fullWidth,
  size = "lg",
}: Props) {
  const sizes = {
    md: "h-11 px-5 text-sm",
    lg: "min-h-[54px] h-[54px] px-7 text-[0.95rem] uppercase tracking-[0.04em]",
  };

  return (
    <a
      href="/matricula"
      className={cn(
        "cta-shine inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-brand-red font-bold text-white shadow-[0_10px_28px_rgba(225,29,46,0.3)] transition-all duration-200 hover:-translate-y-px hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 active:scale-[0.96]",
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {label}
      <ArrowRight className="size-4 shrink-0" strokeWidth={2.25} />
    </a>
  );
}
