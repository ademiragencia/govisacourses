import { createFileRoute } from "@tanstack/react-router";
import { MP_ACCESS_TOKEN } from "@/lib/mp-credentials";
import { supabaseRpc } from "@/lib/supabase";

export const Route = createFileRoute("/api/mp/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = MP_ACCESS_TOKEN.trim();
        const body = (await request.json().catch(() => ({}))) as {
          type?: string;
          action?: string;
          data?: { id?: string };
        };
        const paymentId = body.data?.id;
        if (token && paymentId && (body.type === "payment" || body.action?.includes("payment"))) {
          const res = await fetch(
            `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ).catch(() => null);
          const pay = (res ? await res.json().catch(() => ({})) : {}) as {
            id?: number;
            status?: string;
            payment_type_id?: string;
            external_reference?: string;
          };
          const paid = pay.status === "approved";
          try {
            await supabaseRpc("mark_enrollment_from_payment", {
              p_payment_id: String(pay.id || paymentId),
              p_lead_id: pay.external_reference || "",
              p_status: paid ? "paid" : String(pay.status || "pending"),
              p_method: "card",
              p_note: paid ? "Confirmado no cartão" : pay.status || "cartão",
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
