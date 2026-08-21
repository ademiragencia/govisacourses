const ITEMS = [
  "Renda em dólar",
  "100% online, ao vivo",
  "Trabalho remoto",
  "Sem inglês obrigatório",
  "Certificação profissional",
  "Escritório de imigração americano",
  "Início 30 de agosto",
  "Vagas limitadas",
];

export function Marquee() {
  const line = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-wrap" aria-hidden>
      <div className="marquee-track">
        {line.map((item, i) => (
          <span key={`${item}-${i}`} className="marquee-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
