export default function Loader() {
  return (
    <div className="flex items-center gap-3 text-slate-muted font-mono text-sm py-8">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-marker opacity-60" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-marker" />
      </span>
      Analizando el texto con el modelo de Cerebras…
    </div>
  );
}
