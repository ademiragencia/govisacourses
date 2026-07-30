import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      {
        title:
          "Formação em Processos Imigratórios Online | Go Visa Courses",
      },
      {
        name: "description",
        content:
          "Formação profissional 100% online em processos imigratórios. Modalidade no seu ritmo (84h, R$ 2.000) ou com aulas ao vivo (116h, R$ 3.000). Certificado Go Visa Courses. Inglês não é obrigatório.",
      },
      {
        property: "og:title",
        content: "Formação em Processos Imigratórios | 100% online",
      },
      {
        property: "og:description",
        content:
          "Duas modalidades online: no seu ritmo ou com aulas ao vivo. Certificado Go Visa Courses.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/assets/logo.png" },
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
      </head>
      <body className="page-wash antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
