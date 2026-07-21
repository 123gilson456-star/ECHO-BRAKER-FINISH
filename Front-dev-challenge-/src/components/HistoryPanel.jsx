export default function HistoryPanel({ items = [], onSelect, activeId }) {
  if (items.length === 0) return null;

  return (
    <div className="border-t border-ink-border pt-6 mt-10">
      <p className="font-mono text-xs uppercase tracking-wider text-slate-muted mb-3">
        Analisis recientes
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item._id}>
            <button
              onClick={() => onSelect(item)}
              className={`w-full text-left px-4 py-3 rounded-sm border text-sm transition-colors ${
                activeId === item._id
                  ? "border-marker bg-ink-light"
                  : "border-ink-border hover:border-slate-muted"
              }`}
            >
              <span className="font-mono text-marker mr-2">{item.biasScore}</span>
              <span className="text-paper/80 line-clamp-1">
                {item.sourceUrl || item.originalExcerpt}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
