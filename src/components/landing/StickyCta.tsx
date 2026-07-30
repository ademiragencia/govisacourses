import { useEffect, useState } from "react";
import { WhatsAppCta } from "./WhatsAppCta";

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 520);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`sticky-cta md:hidden ${visible ? "visible" : ""}`}
      aria-hidden={!visible}
    >
      <WhatsAppCta fullWidth label="Garantir minha vaga" size="lg" />
    </div>
  );
}
