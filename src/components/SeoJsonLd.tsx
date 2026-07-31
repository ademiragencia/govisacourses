import { buildJsonLd } from "@/lib/seo";

/** JSON-LD para Google / Bing / redes (Organization, Course, FAQ). */
export function SeoJsonLd() {
  const data = buildJsonLd();
  return (
    <script
      type="application/ld+json"
      // Conteúdo estático controlado por nós (não user input)
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
