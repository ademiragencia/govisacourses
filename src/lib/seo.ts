import { BRAND, COURSE_LIVE } from "./config";

/** Domínio canônico de produção */
export const SITE_URL = "https://www.govisacourses.com.br";

export const SEO = {
  siteName: "Go Visa Courses",
  locale: "pt_BR",
  language: "pt-BR",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/logo.png`,
  image: `${SITE_URL}/assets/logo-dark.png`,
  twitterHandle: "",
  themeColor: "#07111f",
  keywords: [
    "formação processos imigratórios",
    "curso paralegal online",
    "curso imigração EUA",
    "Go Visa Law Firm",
    "Go Visa Courses",
    "govisacourses",
    "trabalhar com imigração",
    "contratação em dólar",
    "maior escritório dos EUA",
    "curso USCIS",
    "petition package",
    "paralegal imigração",
    "formação online imigração",
    "curso de vistos americanos",
    "trabalhar de casa em dólar",
  ].join(", "),
  title:
    "Formação em Processos Imigratórios Online | Go Visa Law Firm | Contratação em Dólar",
  titleTemplate: "%s | Go Visa Courses",
  description:
    "Formação profissional ao vivo em Processos Imigratórios com a Go Visa Law Firm, o maior escritório dos EUA. Turma 30/08. De R$ 14.997 por R$ 3.000 no Pix à vista ou em até 10× no cartão com juros. Os melhores alunos são contratados e já faturam em dólar.",
  ogTitle:
    "Go Visa Law Firm: o maior escritório dos EUA forma e contrata em dólar",
  ogDescription:
    "Formação 100% online em Processos Imigratórios. Destaques contratados pela Go Visa Law Firm, já faturando em dólar. Inglês não é obrigatório.",
} as const;

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p === "/" ? "" : p}` || SITE_URL;
}

/** Organization + WebSite + Course offers + FAQ (JSON-LD) */
export function buildJsonLd() {
  const org = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND.name,
    alternateName: [BRAND.firm, "Go Visa", "Govisa Courses"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: SEO.logo,
    },
    description: SEO.description,
    areaServed: "BR",
    sameAs: [
      "https://govisacourses.com",
      "https://www.govisacourses.com.br",
      "https://govisacoursesonline.vercel.app",
    ],
  };

  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SEO.siteName,
    description: SEO.description,
    inLanguage: SEO.language,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  const webpage = {
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: SEO.title,
    description: SEO.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: SEO.language,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: SEO.image,
    },
  };

  const courseLive = {
    "@type": "Course",
    "@id": `${SITE_URL}/#course-live`,
    name: `${COURSE_LIVE.name} (${COURSE_LIVE.shortName})`,
    description: COURSE_LIVE.format,
    provider: { "@id": `${SITE_URL}/#organization` },
    educationalLevel: "Professional",
    inLanguage: SEO.language,
    isAccessibleForFree: false,
    offers: {
      "@type": "Offer",
      url: SITE_URL,
      price: COURSE_LIVE.price,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      category: "Online",
      validFrom: "2026-08-30",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      startDate: "2026-08-30",
      courseWorkload: `PT${COURSE_LIVE.hoursTotal}H`,
    },
  };

  const faq = {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "É mesmo o maior escritório dos Estados Unidos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Sim. A formação é ligada à ${BRAND.firm}, ${BRAND.firmRank}.`,
        },
      },
      {
        "@type": "Question",
        name: "Os melhores alunos são contratados de verdade?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Sim. Os alunos que mais se destacam são avaliados para contratação pela ${BRAND.firm} e já entram faturando em dólar.`,
        },
      },
      {
        "@type": "Question",
        name: "Preciso falar inglês?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Não. Inglês não é requisito para se matricular nem para acompanhar a formação.",
        },
      },
      {
        "@type": "Question",
        name: "Qual é a formação?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Turma ao vivo a partir de 30/08/2026, 116h. De R$ 14.997 por R$ 3.000 no Pix à vista ou em até 10× no cartão com juros.",
        },
      },
      {
        "@type": "Question",
        name: "Já saio ganhando em dólar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Quem é contratado ao se destacar já entra remunerado em dólar na ${BRAND.firm}.`,
        },
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [org, website, webpage, courseLive, faq],
  };
}
