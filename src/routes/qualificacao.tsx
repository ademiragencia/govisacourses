import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeDollarSign, Building2, ShieldCheck } from "lucide-react";
import { QualifyWizard } from "@/components/landing/QualifyWizard";
import { BRAND } from "@/lib/config";
import { SITE_URL } from "@/lib/seo";
import type { QualifyMeta } from "@/lib/qualify";

const PAGE_TITLE =
  "Qualificação de vaga | Formação em Processos Imigratórios | Go Visa Courses";
const PAGE_DESC =
  "Preencha a ficha inteligente e veja se seu perfil se encaixa na formação com a Go Visa Law Firm. Os melhores alunos são contratados e já faturam em dólar. 100% online.";

export const Route = createFileRoute("/qualificacao")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:url", content: `${SITE_URL}/qualificacao` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: PAGE_DESC },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/qualificacao` }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    utm_source:
      typeof search.utm_source === "string" ? search.utm_source : undefined,
    utm_medium:
      typeof search.utm_medium === "string" ? search.utm_medium : undefined,
    utm_campaign:
      typeof search.utm_campaign === "string" ? search.utm_campaign : undefined,
    utm_content:
      typeof search.utm_content === "string" ? search.utm_content : undefined,
    utm_term: typeof search.utm_term === "string" ? search.utm_term : undefined,
  }),
  component: QualificacaoPage,
});

function QualificacaoPage() {
  const search = Route.useSearch();

  const meta: QualifyMeta = {
    source: "ads-qualificacao",
    utm_source: search.utm_source,
    utm_medium: search.utm_medium,
    utm_campaign: search.utm_campaign,
    utm_content: search.utm_content,
    utm_term: search.utm_term,
  };

  return (
    <div className="relative min-h-dvh">
      <header className="border-b border-border bg-bg/80 backdrop-blur-lg">
        <div className="container-lp flex h-14 items-center justify-between gap-3">
          <Link to="/" aria-label="Go Visa Courses">
            <img
              src="/assets/logo-dark.png"
              alt="Go Visa Courses"
              className="h-7 w-auto"
            />
          </Link>
          <Link
            to="/"
            className="text-xs font-semibold text-fg-muted transition-colors hover:text-fg"
          >
            Ver formação completa
          </Link>
        </div>
      </header>

      <main className="container-lp py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_minmax(0,420px)] lg:items-start">
          <div className="lg:pt-2">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-line/40 bg-gold-line/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-gold-line">
              <Building2 className="size-3.5" />
              {BRAND.firm} · Maior escritório dos EUA
            </div>

            <h1 className="display text-[clamp(1.85rem,4vw,2.75rem)] text-fg">
              Qualifique sua vaga na formação.
              <br />
              <span className="text-brand-red">
                Os melhores alunos já faturam em dólar.
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-fg-muted">
              Preencha a ficha em menos de 2 minutos. Oferta somente hoje:
              de R$ 14.997 por R$ 3.000. Turma ao vivo em 30/08.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                {
                  icon: Building2,
                  t: "Maior escritório dos EUA",
                  d: "Formação ligada à Go Visa Law Firm",
                },
                {
                  icon: BadgeDollarSign,
                  t: "Contratação em dólar",
                  d: "Destaques avaliados para o time",
                },
                {
                  icon: ShieldCheck,
                  t: "Oferta somente hoje",
                  d: "De R$ 14.997 por R$ 3.000",
                },
              ].map(({ icon: Icon, t, d }) => (
                <li
                  key={t}
                  className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-surface/50 px-4 py-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brand-red-soft text-brand-red">
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-fg">{t}</p>
                    <p className="text-xs text-fg-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-xs text-fg-subtle">
              Ao enviar, você conversa com a equipe humana no WhatsApp. Sem
              spam.
            </p>
          </div>

          <div id="formulario" className="w-full">
            <QualifyWizard
              meta={meta}
              source="ads-qualificacao"
              idPrefix="ads"
              className="max-h-none shadow-[var(--shadow-soft)]"
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container-lp flex flex-col items-center justify-between gap-3 text-center text-xs text-fg-subtle sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} Go Visa Courses. {BRAND.firm},{" "}
            {BRAND.firmRank}.
          </p>
          <Link to="/" className="hover:text-fg">
            govisacourses.com.br
          </Link>
        </div>
      </footer>
    </div>
  );
}
