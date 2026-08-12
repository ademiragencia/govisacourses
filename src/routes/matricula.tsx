import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MatriculaWizard } from "@/components/landing/MatriculaWizard";
import { MatriculaPitch } from "@/components/landing/MatriculaPitch";
import { BRAND } from "@/lib/config";
import { SITE_URL } from "@/lib/seo";
import type { StrictMeta } from "@/lib/strict-qualify";

const PAGE_TITLE =
  "Matrícula | Formação em Processos Imigratórios | Go Visa Courses";
const PAGE_DESC =
  "Formação Profissional em Processos Imigratórios com a Go Visa Law Firm, o maior escritório dos EUA. 100% online. 5× R$ 500 ou R$ 2.000 à vista. Os melhores alunos são contratados e já faturam em dólar.";

export const Route = createFileRoute("/matricula")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:url", content: `${SITE_URL}/matricula` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PAGE_TITLE },
      { name: "twitter:description", content: PAGE_DESC },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/matricula` }],
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
  component: MatriculaPage,
});

function MatriculaPage() {
  const search = Route.useSearch();
  const meta: StrictMeta = {
    source: "ads-matricula",
    utm_source: search.utm_source,
    utm_medium: search.utm_medium,
    utm_campaign: search.utm_campaign,
    utm_content: search.utm_content,
    utm_term: search.utm_term,
  };

  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const el = document.getElementById("formulario");
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.2 },
    );
    io.observe(el);
    setShowSticky(true);
    return () => io.disconnect();
  }, []);

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
          <a
            href="#formulario"
            className="text-xs font-semibold text-fg-muted transition-colors hover:text-fg lg:hidden"
          >
            Ir para matrícula
          </a>
        </div>
      </header>

      <main className="container-lp py-10 md:py-14">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-start">
          <MatriculaPitch />
          <div
            id="formulario"
            className="w-full lg:sticky lg:top-6 lg:self-start"
          >
            <MatriculaWizard meta={meta} />
          </div>
        </div>
      </main>

      {showSticky && (
        <a
          href="#formulario"
          className="fixed inset-x-4 bottom-4 z-20 inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-brand-red text-sm font-bold uppercase tracking-[0.04em] text-white shadow-[0_10px_28px_rgba(225,29,46,0.35)] lg:hidden"
        >
          Garantir matrícula
        </a>
      )}

      <footer className="border-t border-border py-8 pb-24 lg:pb-8">
        <div className="container-lp flex flex-col items-center justify-between gap-3 text-center text-xs text-fg-subtle sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} Go Visa Courses. {BRAND.firm}.
          </p>
          <Link to="/" className="hover:text-fg">
            govisacourses.com.br
          </Link>
        </div>
      </footer>
    </div>
  );
}
