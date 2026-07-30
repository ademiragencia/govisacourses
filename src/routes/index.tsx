import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Opportunity } from "@/components/landing/Opportunity";
import { SocialProof } from "@/components/landing/SocialProof";
import { Program } from "@/components/landing/Program";
import { Process } from "@/components/landing/Process";
import { Offer } from "@/components/landing/Offer";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { StickyCta } from "@/components/landing/StickyCta";
import { QualifyForm } from "@/components/landing/QualifyForm";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="relative min-h-dvh">
      <Header />
      <main>
        <Hero />
        <Opportunity />
        <SocialProof />
        <Program />
        <Process />
        <Offer />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyCta />
      <QualifyForm />
    </div>
  );
}
