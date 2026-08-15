import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { SEO, SITE_URL } from "@/lib/seo";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { VisitTracker } from "@/components/VisitTracker";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: SEO.title },
      { name: "description", content: SEO.description },
      { name: "keywords", content: SEO.keywords },
      { name: "author", content: SEO.siteName },
      { name: "creator", content: SEO.siteName },
      { name: "publisher", content: "Go Visa Law Firm / Go Visa Courses" },
      {
        name: "google-site-verification",
        content: "zbEuGmVExax0pDMDR8pg24KJuHIwuOD3b2Loq-phFzg",
      },
      {
        name: "robots",
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      {
        name: "googlebot",
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "bingbot", content: "index, follow" },
      { name: "language", content: SEO.language },
      { name: "revisit-after", content: "3 days" },
      { name: "rating", content: "general" },
      { name: "theme-color", content: SEO.themeColor },
      { name: "format-detection", content: "telephone=no" },
      { name: "geo.region", content: "BR" },
      { name: "geo.placename", content: "Brasil" },

      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:locale", content: SEO.locale },
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:site_name", content: SEO.siteName },
      { property: "og:title", content: SEO.ogTitle },
      { property: "og:description", content: SEO.ogDescription },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: SEO.image },
      { property: "og:image:secure_url", content: SEO.image },
      { property: "og:image:type", content: "image/png" },
      {
        property: "og:image:alt",
        content: "Go Visa Courses — Formação em Processos Imigratórios",
      },

      // Twitter / X
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SEO.ogTitle },
      { name: "twitter:description", content: SEO.ogDescription },
      { name: "twitter:image", content: SEO.image },
      { name: "twitter:image:alt", content: "Go Visa Courses" },

      // App / mobile
      { name: "application-name", content: SEO.siteName },
      { name: "apple-mobile-web-app-title", content: SEO.siteName },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: SITE_URL },
      { rel: "alternate", hrefLang: "pt-BR", href: SITE_URL },
      { rel: "alternate", hrefLang: "x-default", href: SITE_URL },
      { rel: "icon", href: "/assets/logo.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/assets/logo.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "sitemap", href: "/sitemap.xml", type: "application/xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
        <SeoJsonLd />
      </head>
      <body className="page-wash antialiased">
        <div
          className="orb pointer-events-none fixed -left-24 top-24 hidden size-72 bg-navy/50 md:block"
          aria-hidden
        />
        <div
          className="orb pointer-events-none fixed -right-16 top-[40%] hidden size-80 bg-brand-red/20 md:block"
          style={{ animationDelay: "2.4s" }}
          aria-hidden
        />
        <VisitTracker />
        {children}
        <Scripts />
      </body>
    </html>
  );
}
