import { createFileRoute } from "@tanstack/react-router";
import { ASAAS_ACCESS_TOKEN, ASAAS_API } from "@/lib/asaas-credentials";
import { supabaseRpc } from "@/lib/supabase";

const PAID = new Set([
  "PAYMENT_CONFIRMED",
  "PAYMENT_RECEIVED",
  "PAYMENT_RECEIVED_IN_CASH",
]);

export const Route = createFileRoute("/api/asaas/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          event?: string;
          payment?: {
            id?: string;
            status?: string;
            billingType?: string;
            externalReference?: string;
            value?: number;
          };
        };
        const event = String(body.event || "");
        const paymentId = body.payment?.id || "";
        const token = ASAAS_ACCESS_TOKEN.trim();

        if (token && paymentId) {
          const res = await fetch(
            `${ASAAS_API}/payments/${encodeURIComponent(paymentId)}`,
            { headers: { access_token: token, "User-Agent": "GoVisaCourses/1.0" } },
          ).catch(() => null);
          const pay = (res
            ? await res.json().catch(() => ({}))
            : {}) as {
            id?: string;
            status?: string;
            billingType?: string;
            externalReference?: string;
          };
          const status = String(pay.status || body.payment?.status || "");
          const paid =
            PAID.has(event) ||
            status === "CONFIRMED" ||
            status === "RECEIVED" ||
            status === "RECEIVED_IN_CASH";
          const method = String(
            pay.billingType || body.payment?.billingType || "",
          )
            .toLowerCase()
            .includes("pix")
            ? "pix"
            : "card";
          try {
            await supabaseRpc("mark_enrollment_from_payment", {
              p_payment_id: pay.id || paymentId,
              p_lead_id: pay.externalReference || body.payment?.externalReference || "",
              p_status: paid ? "paid" : status.toLowerCase() || "pending",
              p_method: method,
              p_note: paid
                ? event === "PAYMENT_RECEIVED"
                  ? "Confirmado pelo Pix"
                  : "Confirmado no cartão"
                : event || status,
            });
          } catch {
            /* não quebra o webhook */
          }
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
      GET: async () =>
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    },
  },
});
