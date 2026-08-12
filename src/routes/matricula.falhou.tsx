import { createFileRoute } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/matricula/falhou")({
  head: () => ({
    meta: [
      { title: "Pagamento não concluído | Go Visa Courses" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/matricula/falhou` }],
  }),
  component: FalhouPage,
});

function FalhouPage() {
  return (
    <main className="container-lp flex min-h-dvh flex-col items-center justify-center py-16">
      <div className="w-full max-w-lg rounded-[var(--radius-2xl)] border border-border bg-bg-elevated p-8 text-center shadow-[var(--shadow-soft)]">
        <XCircle className="mx-auto size-12 text-brand-red" />
        <h1 className="mt-4 font-display text-2xl font-extrabold text-fg">
          Pagamento não concluído
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          Nada foi cobrado ou o pagamento foi recusado. Tente de novo para
          garantir a matrícula. A equipe só é avisada depois da aprovação.
        </p>
        <a
          href="/matricula"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-brand-red px-5 text-sm font-bold uppercase tracking-[0.04em] text-white"
        >
          Tentar pagar de novo
        </a>
      </div>
    </main>
  );
}
