import { PROGRAM_MODULES } from "@/lib/config";

export function Program() {
  return (
    <section id="programa" className="border-t border-border bg-bg-elevated py-20 md:py-28">
      <div className="container-lp">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Conteúdo programático</p>
          <h2 className="display mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] text-fg">
            O que você vai dominar
          </h2>
          <p className="mt-4 text-base leading-relaxed text-fg-muted">
            Seis blocos da formação, do fundamento jurídico à prática aplicada
            com casos reais.
          </p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAM_MODULES.map((mod, i) => (
            <article
              key={mod.title}
              className="surface-card rounded-[var(--radius-xl)] p-5 md:p-6"
            >
              <span className="font-display text-sm font-extrabold text-brand-red/50">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-base font-bold text-fg">{mod.title}</h3>
              <ul className="mt-3 space-y-1.5">
                {mod.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-xs leading-relaxed text-fg-muted"
                  >
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-gold-line" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-fg-subtle">
          Na modalidade ao vivo, estude o conteúdo do portal antes dos
          encontros. Nas aulas, o foco é teoria aplicada e prática profissional.
          No ritmo livre, o conteúdo é liberado em blocos no portal.
        </p>
      </div>
    </section>
  );
}
