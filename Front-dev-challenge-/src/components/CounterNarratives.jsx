export default function CounterNarratives({ items = [], keywords = [] }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-ink/50 mb-1">
        Para equilibrar tu vision
      </p>
      <h3 className="font-display text-xl mb-4">Fuentes con perspectiva distinta</h3>

      {items.length === 0 ? (
        <div className="text-sm text-ink/60 border border-dashed border-ink/20 rounded-sm p-4">
          No se encontraron fuentes externas automaticamente
          {keywords.length > 0 && (
            <>
              . Puedes buscar manualmente con: <br />
              <span className="font-mono text-xs">{keywords.join(" · ")}</span>
            </>
          )}
          {!keywords.length && ". Configura GNEWS_API_KEY en el backend para activar esta funcion."}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block border border-ink/15 rounded-sm p-4 hover:border-marker transition-colors"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink/50 mb-1">
                {item.source}
              </p>
              <p className="text-sm font-medium leading-snug">{item.title}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
