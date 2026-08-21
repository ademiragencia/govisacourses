import { Reveal } from "./Reveal";
import { MatriculaCta } from "./MatriculaCta";
import { COURSE_LIVE } from "@/lib/config";

const STATS = [
  { num: COURSE_LIVE.hoursLabel.replace(" no total", ""), label: "de formação completa" },
  { num: "32h", label: "ao vivo com o professor" },
  { num: "US$", label: "a moeda de quem se destaca" },
];

export function Authority() {
  return (
    <section
      id="autoridade"
      className="relative overflow-hidden border-t border-border bg-bg-elevated py-20 md:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(680px 340px at 15% 0%, rgba(201,168,110,0.10), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="container-lp relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="eyebrow eyebrow-center justify-center">A diferença</p>
            <h2 className="display mt-3 text-[clamp(1.95rem,4.2vw,3.1rem)] text-fg">
              Nasceu dentro do escritório.
              <br />
              <span className="text-gold-grad">Não de uma escola.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-relaxed text-fg-muted">
              A maioria dos cursos ensina teoria por quem nunca atuou. Aqui é o
              contrário: o método vem da rotina real de um escritório de
              imigração americano — os mesmos casos, documentos e processos do
              dia a dia. E quem forma a turma é quem também contrata os
              destaques.
            </p>
          </Reveal>
        </div>

        <Reveal>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="surface-card rounded-[var(--radius-xl)] px-5 py-7 text-center"
              >
                <p className="stat-num text-[2.4rem]">{s.num}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-fg-subtle">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mx-auto mt-10 flex max-w-sm justify-center">
          <MatriculaCta fullWidth label="Quero fazer parte da turma" />
        </div>
      </div>
    </section>
  );
}
