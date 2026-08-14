const ITEMS = [
  "Maior escritório dos EUA",
  "Turma ao vivo",
  "Somente hoje",
  "Sem inglês obrigatório",
  "Destaques avaliados",
  "Início 30 de agosto",
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
