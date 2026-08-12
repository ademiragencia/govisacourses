import { useEffect, useState } from "react";
import { MatriculaCta } from "./MatriculaCta";

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
      <MatriculaCta fullWidth label="Matricular agora" size="lg" />
    </div>
  );
}