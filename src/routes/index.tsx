import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Marquee } from "@/components/landing/Marquee";
import { Hero } from "@/components/landing/Hero";
import { ForWho } from "@/components/landing/ForWho";
import { Opportunity } from "@/components/landing/Opportunity";
import { Authority } from "@/components/landing/Authority";
import { Comparison } from "@/components/landing/Comparison";
import { SocialProof } from "@/components/landing/SocialProof";
import { Program } from "@/components/landing/Program";
import { Process } from "@/components/landing/Process";
import { Offer } from "@/components/landing/Offer";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { StickyCta } from "@/components/landing/StickyCta";
import { WhatsAppFloat } from "@/components/landing/WhatsAppFloat";
import { QualifyForm } from "@/components/landing/QualifyForm";
import { SEO, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SEO.title },
      { name: "description", content: SEO.description },
      { property: "og:url", content: SITE_URL },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="relative min-h-dvh">
      <Header />
      <main id="conteudo">
        <Hero />
        <Marquee />
        <ForWho />
        <Opportunity />
        <Authority />
        <SocialProof />
        <Comparison />
        <Program />
        <Offer />
        <Process />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyCta />
      <WhatsAppFloat />
      <QualifyForm />
    </div>
  );
}
