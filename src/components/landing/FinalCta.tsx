import { COURSE_LIVE } from "@/lib/config";
import { MatriculaCta } from "./MatriculaCta";
import { WhatsAppCta } from "./WhatsAppCta";
import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-navy-deep py-20 text-white md:py-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(680px 320px at 50% -10%, rgba(43,108,176,0.55), transparent 62%), radial-gradient(520px 300px at 90% 120%, rgba(241,66,63,0.3), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="flag-strip absolute inset-x-0 top-0" />
      <div className="container-lp relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="eyebrow eyebrow-center justify-center">
              Última chamada · turma de 30 de agosto
            </p>
            <h2 className="display mt-4 text-[clamp(2rem,4.2vw,3.2rem)] text-white">
              Sua próxima carreira pode
              <br />
              <span className="text-gold-grad">começar hoje</span>.{" "}
              <span className="text-white">Em dólar.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/70">
              A vaga de hoje sai por {COURSE_LIVE.priceLabel}. Amanhã pode ser
              tarde. As turmas ao vivo têm vagas limitadas e a condição acaba à
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
              <p className="text-xs text-white/50">
                Oferta somente hoje · de R$ 14.997 por R$ 3.000 · acaba à meia-noite
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}