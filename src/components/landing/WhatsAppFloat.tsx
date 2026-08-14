import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/config";

const MSG =
  "Olá! Estou no site agora e quero falar com a equipe. Estão online?";

export function WhatsAppFloat() {
  const url = getWhatsAppUrl(MSG);
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float"
      aria-label="WhatsApp. Estamos online agora"
    >
      <span className="wa-float-bubble">Estamos online agora</span>
      <span className="wa-float-btn">
        <span className="wa-float-pulse" aria-hidden />
        <span className="wa-float-dot" aria-hidden />
        <MessageCircle className="relative z-10 size-7 fill-white text-white" strokeWidth={1.75} />
      </span>
    </a>
  );
}
