import { createFileRoute } from "@tanstack/react-router";
import { ASAAS_ACCESS_TOKEN, ASAAS_API } from "@/lib/asaas-credentials";

export const Route = createFileRoute("/api/asaas/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          event?: string;
          payment?: { id?: string };
        };
        const paymentId = body.payment?.id;
        const token = ASAAS_ACCESS_TOKEN.trim();
        if (token && paymentId) {
          await fetch(`${ASAAS_API}/payments/${encodeURIComponent(paymentId)}`, {
            headers: { access_token: token },
          }).catch(() => null);
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
