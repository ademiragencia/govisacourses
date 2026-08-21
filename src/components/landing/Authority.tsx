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
      className="relative overflow-hidden bg-navy-deep py-20 text-white md:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(720px 380px at 12% -10%, rgba(43,108,176,0.5), transparent 60%), radial-gradient(620px 360px at 100% 110%, rgba(241,66,63,0.28), transparent 62%)",
        }}
        aria-hidden
      />
      <div className="container-lp relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="text-center lg:text-left">
            <Reveal>
              <p className="eyebrow justify-center lg:justify-start">A diferença</p>
              <h2 className="display mt-4 text-[clamp(2rem,4.4vw,3.2rem)] text-white">
                Nasceu dentro do escritório.
                <br />
                <span className="text-gold-grad">Não de uma escola.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[1.05rem] leading-relaxed text-white/70 lg:mx-0">
                A maioria dos cursos ensina teoria por quem nunca atuou. Aqui é o
                contrário: o método vem da rotina real de um escritório de
                imigração americano, com os mesmos casos, documentos e processos
                do dia a dia. E quem forma a turma é quem também contrata os
                destaques.
              </p>
              <div className="mt-8 flex justify-center lg:justify-start">
                <MatriculaCta label="Quero fazer parte da turma" className="w-full sm:w-auto" />
              </div>
            </Reveal>
          </div>

          <Reveal delay={90}>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-4 rounded-[var(--radius-xl)] border border-white/12 bg-white/[0.06] px-5 py-5 backdrop-blur-sm"
                >
                  <p className="font-display text-[2.4rem] font-black leading-none text-white">
                    {s.num}
                  </p>
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/60">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
