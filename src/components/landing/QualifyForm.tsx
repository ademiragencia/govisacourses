import { useEffect } from "react";
import { X } from "lucide-react";
import { useQualifyStore } from "@/lib/qualify-store";
import { QualifyWizard } from "./QualifyWizard";

/** Modal da LP principal (mesmo formulário da página /qualificacao). */
export function QualifyForm() {
  const open = useQualifyStore((s) => s.open);
  const closeForm = useQualifyStore((s) => s.closeForm);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeForm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeForm]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qualify-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Fechar"
        onClick={closeForm}
      />

      <div className="relative w-full max-w-lg">
        <button
          type="button"
          onClick={closeForm}
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full border border-border bg-bg-elevated text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
          aria-label="Fechar formulário"
        >
          <X className="size-4" />
        </button>
        <QualifyWizard
          source="site"
          idPrefix="qm"
          onSent={() => setTimeout(() => closeForm(), 600)}
          className="rounded-t-[var(--radius-2xl)] sm:rounded-[var(--radius-2xl)]"
        />
      </div>
    </div>
  );
}
