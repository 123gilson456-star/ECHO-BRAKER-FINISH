export default function Header() {
  return (
    <header className="border-b border-ink-border">
      <div className="max-w-5xl mx-auto px-6 py-8 flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-marker mb-2">
            Expediente de sesgo algoritmico
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
            Echo<span className="text-marker">-</span>Breaker
          </h1>
        </div>
        <p className="font-body text-sm text-slate-muted max-w-xs text-left md:text-right">
          No te decimos si es falso. Te mostramos que esta diseñado para que le creas.
        </p>
      </div>
    </header>
  );
}
