import { COURSE_LIVE } from "@/lib/config";
import { MatriculaCta } from "./MatriculaCta";
import { WhatsAppCta } from "./WhatsAppCta";
import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="container-lp">
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-gold-line/35 bg-surface px-6 py-14 text-center md:px-12 md:py-20">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(560px 260px at 50% 0%, rgba(197,164,110,0.16), transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-2xl">
            <Reveal>
            <p className="eyebrow eyebrow-center justify-center">
              Última chamada · turma de 30 de agosto
            </p>
            <h2 className="display mt-4 text-[clamp(1.9rem,4vw,3rem)] text-fg">
              Sua próxima carreira pode
              <br />
              <span className="text-gold-grad">começar hoje</span>.{" "}
              <span className="text-brand-red">Em dólar.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-fg-muted">
              A vaga de hoje sai por {COURSE_LIVE.priceLabel}. Amanhã pode ser
              tarde — as turmas ao vivo têm vagas limitadas e a condição acaba à
              meia-noite.
            </p>
            <div className="mx-auto mt-8 flex max-w-sm flex-col items-center gap-3">
              <MatriculaCta fullWidth label="Matricular agora" />
              <WhatsAppCta
                fullWidth
                variant="secondary"
                size="md"
                label="Falar com a equipe"
              />
              <p className="text-xs text-fg-subtle">
                Oferta somente hoje · de R$ 14.997 por R$ 3.000 · acaba à meia-noite
              </p>
            </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}