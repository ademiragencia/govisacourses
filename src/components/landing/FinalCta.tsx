import { BRAND } from "@/lib/config";
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
            <p className="eyebrow">{BRAND.firm} | Contratação em dólar</p>
            <h2 className="display mt-4 text-[clamp(1.9rem,4vw,3rem)] text-fg">
              Destaque-se na formação.
              <br />
              <span className="text-brand-red">
                Os melhores alunos já faturam em dólar na {BRAND.firm}.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-fg-muted">
              Escolha a modalidade, preencha a ficha e fale com a equipe. O
              maior escritório dos EUA observa quem se destaca.
            </p>
            <div className="mx-auto mt-8 flex max-w-sm flex-col items-center gap-3">
              <WhatsAppCta fullWidth label="Quero disputar essa vaga" />
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
