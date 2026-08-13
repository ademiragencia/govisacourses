/**
 * WhatsApp da equipe (só dígitos, com DDI).
 * Atual: +1 (321) 315-7510
 */
export const WHATSAPP_NUMBER = "13213157510";

/**
 * Web3Forms — leads por e-mail
 * https://web3forms.com (access_key do formulário)
 */
export const WEB3FORMS_ACCESS_KEY = "e3706ec1-f2ac-4cee-9f78-4267e9b60cbc";
export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

export const BRAND = {
  name: "Go Visa Courses",
  firm: "Go Visa Law Firm",
  /** Frase curta de autoridade */
  firmRank: "o maior escritório dos Estados Unidos",
  firmFull: "Go Visa Law Firm, o maior escritório dos Estados Unidos",
  hiringPromise:
    "Os melhores alunos são contratados pela Go Visa Law Firm, o maior escritório dos EUA, e já faturam em dólar",
} as const;

/** Modalidade única: online com aulas ao vivo */
export const COURSE_LIVE = {
  id: "live" as const,
  name: "Formação Profissional em Processos Imigratórios",
  shortName: "Online com aulas ao vivo",
  badge: "Turma ao vivo",
  format: "100% online, com aulas ao vivo e acesso ao portal de estudos",
  startLabel: "Início em 30 de agosto de 2026",
  startDetail: "Turma com cronograma de aulas ao vivo. Vagas limitadas.",
  startIso: "2026-08-30T00:00:00-03:00",
  hoursLive: 32,
  hoursRecorded: 84,
  hoursTotal: 116,
  hours: 116,
  hoursLabel: "116h no total",
  hoursDetail: "32h ao vivo + 84h gravadas, materiais e atividades",
  schedule: [
    {
      title: "Domingos",
      body: "4 domingos, com 4 horas de duração cada encontro",
    },
    {
      title: "Terças e quintas",
      body: "Das 19h às 21h",
    },
  ],
  listPrice: 14997,
  listPriceLabel: "R$ 14.997,00",
  price: 3000,
  priceLabel: "R$ 3.000,00",
  cashLabel: "R$ 3.000,00 à vista",
  planLabel: "R$ 3.000 à vista ou entrada de R$ 1.000 + 7× R$ 400",
  installments: 7,
  installmentValue: 400,
  entryFee: 1000,
  entryLabel: "entrada de R$ 1.000",
  totalLabel: "7× R$ 400",
  includes: [
    "Formação ligada ao maior escritório dos EUA (Go Visa Law Firm)",
    "Aulas ao vivo com acompanhamento do professor",
    "Portal exclusivo com conteúdo gravado",
    "Materiais de apoio e estudos de casos reais",
    "Exercícios práticos + certificação",
    "Destaques avaliados para contratação na Go Visa Law Firm (em dólar)",
  ],
} as const;

/** @deprecated só ao vivo. Mantido para não quebrar imports antigos. */
export const COURSE_SELF = COURSE_LIVE;

export type CourseId = "self" | "live";

export const COURSES = {
  self: COURSE_LIVE,
  live: COURSE_LIVE,
} as const;

export const PROGRAM_MODULES = [
  {
    title: "Fundamentos jurídicos",
    items: [
      "Legislação migratória (INA e regulamentos federais)",
      "Classificação e categorias de vistos",
      "Direitos e deveres dos imigrantes",
      "Estrutura do USCIS, DOS e DHS",
      "Terminologia jurídica migratória",
      "Fluxo dos procedimentos",
    ],
  },
  {
    title: "Documentação e processos",
    items: [
      "Organização e triagem documental",
      "Análise documental e de elegibilidade",
      "Montagem de processos (petition packages)",
      "Preenchimento de formulários USCIS",
      "Checklist profissional por categoria",
      "Prazos e acompanhamento de status",
    ],
  },
  {
    title: "Categorias de vistos",
    items: [
      "Vistos de trabalho (H-1B, L-1, O-1)",
      "Vistos baseados em família",
      "Vistos humanitários e asilo",
      "Vistos de investidor (E-2, EB-5)",
      "Vistos de estudante e intercâmbio (F-1, J-1)",
      "Ajuste de status e green card",
    ],
  },
  {
    title: "Atuação profissional",
    items: [
      "Atendimento ao cliente",
      "Ética profissional e limites de atuação",
      "Organização do escritório",
      "Gestão de prazos e processos",
      "Comunicação com o advogado responsável",
      "Sigilo e proteção de dados do cliente",
    ],
  },
  {
    title: "Ferramentas e tecnologia",
    items: [
      "Portais USCIS (case status e e-filing)",
      "Sistemas de gestão de casos",
      "Organização digital de documentos",
      "Modelos e templates de processos",
      "Boas práticas de segurança e sigilo",
    ],
  },
  {
    title: "Prática aplicada",
    items: [
      "Estudos de casos reais",
      "Simulações de atendimento",
      "Redação de declarações e cartas de suporte",
      "Preparação para entrevistas",
      "Resolução de dúvidas e exercícios práticos",
    ],
  },
] as const;

export const WHATSAPP_MESSAGE =
  "Olá! Vim pela landing da Formação em Processos Imigratórios com o maior escritório dos EUA (Go Visa Law Firm). Quero garantir minha vaga e a chance de ser contratado faturando em dólar.";

export function getWhatsAppUrl(message = WHATSAPP_MESSAGE): string | null {
  const n = WHATSAPP_NUMBER.replace(/\D/g, "");
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

export const COURSE = {
  name: "Formação Profissional em Processos Imigratórios",
  firmLabel: BRAND.firmFull,
} as const;
