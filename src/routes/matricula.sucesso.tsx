import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { loadLead } from "@/lib/mp";
import { verifyMpPayment } from "@/lib/mp-server";
import { openPaidWhatsApp, submitPaidEmail } from "@/lib/strict-qualify";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/matricula/sucesso")({
  validateSearch: (s: Record<string, unknown>) => ({
    payment_id:
      typeof s.payment_id === "string"
        ? s.payment_id
        : typeof s.collection_id === "string"
          ? s.collection_id
          : undefined,
    status:
      typeof s.status === "string"
        ? s.status
        : typeof s.collection_status === "string"
          ? s.collection_status
          : undefined,
    external_reference:
      typeof s.external_reference === "string"
        ? s.external_reference
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pagamento aprovado | Go Visa Courses" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/matricula/sucesso` }],
  }),
  component: SucessoPage,
});

function SucessoPage() {
  const search = Route.useSearch();
  const [state, setState] = useState<"loading" | "ok" | "wait">("loading");
  const [paymentId, setPaymentId] = useState(search.payment_id || "");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const lead = loadLead();
      const id = search.payment_id;
      let approved = search.status === "approved";
      let amount = lead?.amount ?? 0;
      let pid = id || "";

      if (id) {
        const verified = await verifyMpPayment({ data: { paymentId: id } });
        if (verified.ok) {
          approved = verified.status === "approved";
          amount = verified.amount || amount;
          pid = verified.paymentId;
        }
      }

      if (cancelled) return;
      setPaymentId(pid);

      if (!approved) {
        setState("wait");
        return;
      }

      setState("ok");
      if (lead) {
        const payment = {
          paymentId: pid || "mercadopago",
          amount,
          status: "approved",
        };
        void submitPaidEmail(lead, payment, lead.meta);
        setTimeout(() => {
          openPaidWhatsApp(lead, payment, lead.meta);
        }, 600);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [search.payment_id, search.status]);

  return (
    <main className="container-lp flex min-h-dvh flex-col items-center justify-center py-16">
      <div className="w-full max-w-lg rounded-[var(--radius-2xl)] border border-border bg-bg-elevated p-8 text-center shadow-[var(--shadow-soft)]">
        {state === "loading" && (
          <>
            <Loader2 className="mx-auto size-10 animate-spin text-gold-line" />
            <p className="mt-4 font-display text-xl font-extrabold text-fg">
              Confirmando o pagamento…
            </p>
          </>
        )}
        {state === "ok" && (
          <>
            <CheckCircle2 className="mx-auto size-12 text-wa" />
            <h1 className="mt-4 font-display text-2xl font-extrabold text-fg">
              Pagamento aprovado
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              Matrícula confirmada. Vamos abrir o WhatsApp da equipe com o
              comprovante. Se não abrir, use o botão abaixo.
            </p>
            {paymentId && (
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
                ID {paymentId}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                const lead = loadLead();
                if (!lead) return;
                openPaidWhatsApp(
                  lead,
                  {
                    paymentId: paymentId || "mercadopago",
                    amount: lead.amount,
                    status: "approved",
                  },
                  lead.meta,
                );
              }}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-wa px-5 text-sm font-bold uppercase tracking-[0.04em] text-white shadow-[0_12px_32px_rgba(34,163,90,0.35)] hover:bg-wa-hover"
            >
              <MessageCircle className="size-5" />
              Abrir WhatsApp da equipe
            </button>
          </>
        )}
        {state === "wait" && (
          <>
            <h1 className="font-display text-2xl font-extrabold text-fg">
              Pagamento ainda não confirmado
            </h1>
            <p className="mt-2 text-sm text-fg-muted">
              Se o cartão ficou em análise, aguarde a confirmação. O WhatsApp
              só abre depois da aprovação.
            </p>
            <a
              href="/matricula/pendente"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-border px-5 text-sm font-semibold text-fg"
            >
              Ver status pendente
            </a>
          </>
        )}
        <a
          href="/matricula"
          className="mt-4 block text-xs font-semibold text-fg-subtle hover:text-fg"
        >
          Voltar à matrícula
        </a>
      </div>
    </main>
  );
}
