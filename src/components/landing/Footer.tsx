import { BRAND } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-border pb-24 pt-12 md:pb-14">
      <div className="container-lp flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <img
            src="/assets/logo-dark.png"
            alt="Go Visa Courses"
            className="h-6 w-auto opacity-90"
          />
          <p className="max-w-sm text-center text-xs text-fg-subtle sm:text-left">
            Formação Profissional em Processos Imigratórios. 100% online. Os
            melhores alunos são contratados pela {BRAND.firm} e já faturam em
            dólar.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 text-center text-xs text-fg-subtle sm:items-end sm:text-right">
          <a
            href="https://www.govisacourses.com.br"
            className="transition-colors hover:text-fg"
          >
            www.govisacourses.com.br
          </a>
          <p>
            © {new Date().getFullYear()} Go Visa Courses. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
      <div className="flag-strip mt-10" aria-hidden />
    </footer>
  );
}
