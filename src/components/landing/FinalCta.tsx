import { BRAND } from "@/lib/config";
import { MatriculaCta } from "./MatriculaCta";
import { WhatsAppCta } from "./WhatsAppCta";

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
            <p className="eyebrow">
              {BRAND.firm} | O maior escritório dos EUA
            </p>
            <h2 className="display mt-4 text-[clamp(1.9rem,4vw,3rem)] text-fg">
              Forme-se com o{" "}
              <span className="text-gold-line">maior escritório</span>.
              <br />
              <span className="text-brand-red">
                Destaque-se. Seja contratado. Em dólar.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-fg-muted">
              A {BRAND.firm} forma a turma e contrata quem mais se destaca. Já
              faturando em dólar.
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
                Turma ao vivo em 30/08 · de R$ 14.997 por R$ 3.000 · vagas limitadas
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}