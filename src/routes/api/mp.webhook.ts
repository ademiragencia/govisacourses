import { createFileRoute } from "@tanstack/react-router";
import { MP_ACCESS_TOKEN } from "@/lib/mp-credentials";

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
          await fetch(
            `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ).catch(() => null);
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
