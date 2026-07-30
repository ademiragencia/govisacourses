import { MessageCircle } from "lucide-react";
import { useQualifyStore } from "@/lib/qualify-store";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  label?: string;
  fullWidth?: boolean;
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
};

export function WhatsAppCta({
  className,
  label = "Quero garantir minha vaga",
  fullWidth,
  variant = "primary",
  size = "lg",
}: Props) {
  const openForm = useQualifyStore((s) => s.openForm);

  const base =
    "inline-flex items-center justify-center gap-2.5 font-bold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa/40 active:scale-[0.98]";

  const sizes = {
    md: "h-11 px-5 text-sm rounded-[var(--radius-md)]",
    lg: "min-h-[54px] h-[54px] px-7 text-[0.95rem] rounded-[var(--radius-md)] uppercase tracking-[0.04em]",
  };

  const variants = {
    primary:
      "bg-wa text-white shadow-[0_12px_32px_rgba(34,163,90,0.35)] hover:bg-wa-hover hover:-translate-y-px",
    secondary:
      "bg-transparent text-fg border border-border-strong hover:bg-white/5",
  };

  return (
    <button
      type="button"
      onClick={openForm}
      className={cn(
        base,
        sizes[size],
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
    >
      <MessageCircle className="size-5 shrink-0" strokeWidth={2.25} />
      {label}
    </button>
  );
}
