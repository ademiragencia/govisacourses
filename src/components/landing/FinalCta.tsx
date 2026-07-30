import { WhatsAppCta } from "./WhatsAppCta";

export function FinalCta() {
  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="container-lp">
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-border-strong bg-surface px-6 py-14 text-center md:px-12 md:py-20">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(560px 260px at 50% 0%, rgba(225,29,46,0.18), transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-2xl">
            <p className="eyebrow">Go Visa Courses</p>
            <h2 className="display mt-4 text-[clamp(1.9rem,4vw,3rem)] text-fg">
              Escolha sua modalidade.
              <br />
              <span className="text-brand-red">Comece a formação online.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-fg-muted">
              Preencha a ficha em poucos minutos e fale com a equipe no WhatsApp
              com tudo pronto.
            </p>
            <div className="mx-auto mt-8 flex max-w-sm flex-col items-center gap-3">
              <WhatsAppCta fullWidth label="Preencher ficha agora" />
              <p className="text-xs text-fg-subtle">
                Online no ritmo livre ou com aulas ao vivo a partir de 30/08/2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
