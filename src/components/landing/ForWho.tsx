import { Check, X } from "lucide-react";
import { Reveal } from "./Reveal";

const PAIN = [
  "Trabalha muito e sente que o salário nunca acompanha o esforço",
  "Quer uma profissão de futuro, mas acha que teria que recomeçar do zero",
  "Sonha em ganhar em dólar, só que não quer (ou não pode) emigrar",
  "Trava porque não fala inglês fluente e acha que isso fecha as portas",
  "Está cansado de curso solto que não leva a lugar nenhum",
];

const GAIN = [
  "Uma profissão nova e valorizada, aprendida do zero, passo a passo",
  "Renda em dólar trabalhando de casa, para um escritório americano",
  "Entrada em um mercado que só cresce e falta gente qualificada",
  "Inglês não é requisito: você aprende os termos junto com a prática",
  "Formação ao vivo com quem realmente atua na área e contrata",
];

export function ForWho() {
  return (
    <section className="border-t border-border py-20 md:py-28">
      <div className="container-lp">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow eyebrow-center justify-center">Pra quem é</p>
            <h2 className="display mt-3 text-[clamp(1.85rem,3.6vw,2.85rem)] text-fg">
              Se você se reconhece aqui,
              <br className="hidden sm:block" /> essa formação foi feita pra você.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-fg-muted">
              Não é sorte nem "dom". É entrar num mercado certo, com o preparo
              certo, do lado de quem já está lá dentro.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-[var(--radius-2xl)] border border-border bg-bg-elevated/60 p-7 md:p-8">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-fg-subtle">
                Onde você está hoje
              </p>
              <ul className="mt-5 space-y-4">
                {PAIN.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-fg-muted">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-fg/5 text-fg-subtle">
                      <X className="size-3.5" strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="relative h-full overflow-hidden rounded-[var(--radius-2xl)] border border-brand-red/30 bg-surface p-7 shadow-[var(--shadow-soft)] md:p-8">
              <div className="flag-strip absolute inset-x-0 top-0" />
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-brand-red">
                Onde essa formação te leva
              </p>
              <ul className="mt-5 space-y-4">
                {GAIN.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-fg">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-wa/15 text-wa">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
