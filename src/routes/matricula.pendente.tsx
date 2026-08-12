import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/matricula/pendente")({
  head: () => ({
    meta: [
      { title: "Pagamento pendente | Go Visa Courses" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/matricula/pendente` }],
  }),
  component: PendentePage,
});

function PendentePage() {
  return (
    <main className="container-lp flex min-h-dvh flex-col items-center justify-center py-16">
      <div className="w-full max-w-lg rounded-[var(--radius-2xl)] border border-border bg-bg-elevated p-8 text-center shadow-[var(--shadow-soft)]">
        <Clock className="mx-auto size-12 text-gold-line" />
        <h1 className="mt-4 font-display text-2xl font-extrabold text-fg">
          Pagamento em análise
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          Pix e boleto podem levar alguns minutos (ou até o vencimento do
          boleto). Assim que o Mercado Pago confirmar, você volta para liberar
          o WhatsApp da equipe.
        </p>
        <a
          href="/matricula"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] border border-border px-5 text-sm font-semibold text-fg"
        >
          Voltar à matrícula
        </a>
      </div>
    </main>
  );
}
