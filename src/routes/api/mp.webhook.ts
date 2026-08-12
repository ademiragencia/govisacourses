import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/mp/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = (
          process.env.MERCADOPAGO_ACCESS_TOKEN ||
          process.env.MP_ACCESS_TOKEN ||
          ""
        ).trim();
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
