import { WhatsAppCta } from "./WhatsAppCta";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-lg">
      <div className="container-lp flex h-16 items-center justify-between gap-4">
        <a href="#topo" aria-label="Go Visa Courses">
          <img
            src="/assets/logo-dark.png"
            alt="Go Visa Courses"
            className="h-7 w-auto md:h-8"
          />
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-fg-muted md:flex">
          <a href="#autoridade" className="transition-colors hover:text-fg">
            A formação
          </a>
          <a href="#programa" className="transition-colors hover:text-fg">
            Conteúdo
          </a>
          <a href="#investimento" className="transition-colors hover:text-fg">
            Modalidades
          </a>
          <a href="#faq" className="transition-colors hover:text-fg">
            Dúvidas
          </a>
        </nav>

        <WhatsAppCta
          size="md"
          label="Garantir vaga"
          className="!h-10 !px-4 !text-xs !tracking-[0.06em]"
        />
      </div>
    </header>
  );
}
