// Elemento distintivo del reporte: una franja tipo "trazo de resaltador"
// que ubica el score de sesgo (0-100) en un espectro neutral -> polarizante.
export default function BiasGauge({ score }) {
  const clamped = Math.min(100, Math.max(0, score));
  const label = getLabel(clamped);
  const color = getColor(clamped);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <span className="font-mono text-xs uppercase tracking-wider text-slate-muted">
          Indice de polarizacion
        </span>
        <span className="font-mono text-2xl font-semibold" style={{ color }}>
          {clamped}
          <span className="text-sm text-slate-muted">/100</span>
        </span>
      </div>

      <div className="relative h-4 rounded-sm overflow-hidden bg-ink border border-ink-border">
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: "100%",
            background:
              "linear-gradient(90deg, #3FA796 0%, #E8A33D 55%, #D65F4C 100%)",
            opacity: 0.35,
          }}
        />
        {/* Trazo de resaltador que marca la posicion exacta */}
        <div
          className="absolute inset-y-0 transition-all duration-700 ease-out"
          style={{
            left: `${clamped}%`,
            width: "3px",
            transform: "translateX(-1.5px)",
            background: color,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      </div>

      <div className="flex justify-between mt-2 font-mono text-[10px] uppercase tracking-wider text-slate-muted">
        <span>Neutral</span>
        <span>Matizado</span>
        <span>Polarizante</span>
      </div>

      <p className="mt-4 font-display text-lg" style={{ color }}>
        {label}
      </p>
    </div>
  );
}

function getColor(score) {
  if (score < 34) return "#3FA796";
  if (score < 67) return "#E8A33D";
  return "#D65F4C";
}

function getLabel(score) {
  if (score < 20) return "Contenido mayormente neutral.";
  if (score < 40) return "Ligero matiz de perspectiva.";
  if (score < 60) return "Tono claramente inclinado.";
  if (score < 80) return "Alto contenido polarizante.";
  return "Diseñado para confirmar un sesgo.";
}
