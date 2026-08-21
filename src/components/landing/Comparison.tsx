import { Check, X } from "lucide-react";
import { Reveal } from "./Reveal";

const ROWS = [
  ["Quem ensina", "Professor que nunca atuou na área", "Quem atua na rotina de um escritório americano"],
  ["Base do conteúdo", "Teoria genérica e desatualizada", "Casos, documentos e processos reais do dia a dia"],
  ["Formato", "Vídeo gravado, você por conta própria", "Turma ao vivo, com acompanhamento"],
  ["Depois do curso", "Um certificado e boa sorte", "Os destaques são avaliados para contratação"],
  ["Resultado", "Mais um diploma na gaveta", "Uma porta real para faturar em dólar"],
];

export function Comparison() {
  return (
    <section className="border-t border-border bg-bg-elevated py-20 md:py-28">
      <div className="container-lp">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow eyebrow-center justify-center">A comparação</p>
            <h2 className="display mt-3 text-[clamp(1.85rem,3.6vw,2.85rem)] text-fg">
              Por que não é só mais um curso
            </h2>
            <p className="mt-4 text-base leading-relaxed text-fg-muted">
              A diferença entre estudar por estudar e entrar de fato no mercado.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
            {/* curso comum */}
            <div className="rounded-[var(--radius-2xl)] border border-border bg-white/60 p-6 md:p-7">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-fg-subtle">
                Curso comum
              </p>
              <ul className="mt-5 space-y-5">
                {ROWS.map(([label, bad]) => (
                  <li key={label}>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-fg-subtle">
                      {label}
                    </p>
                    <p className="mt-1 flex items-start gap-2 text-sm leading-relaxed text-fg-muted">
                      <X className="mt-0.5 size-4 shrink-0 text-fg-subtle" strokeWidth={2.5} />
                      {bad}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* go visa */}
            <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border-2 border-brand-red/40 bg-white p-6 shadow-[var(--shadow-soft)] md:p-7">
              <div className="flag-strip absolute inset-x-0 top-0" />
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-brand-red">
                Go Visa Courses
              </p>
              <ul className="mt-5 space-y-5">
                {ROWS.map(([label, , good]) => (
                  <li key={label}>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-fg-subtle">
                      {label}
                    </p>
                    <p className="mt-1 flex items-start gap-2 text-sm font-medium leading-relaxed text-fg">
                      <Check className="mt-0.5 size-4 shrink-0 text-wa" strokeWidth={3} />
                      {good}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
