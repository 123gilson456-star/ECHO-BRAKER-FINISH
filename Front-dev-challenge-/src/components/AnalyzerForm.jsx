import { useState } from "react";

const MODES = [
  { id: "url", label: "Enlace" },
  { id: "text", label: "Texto pegado" },
];

export default function AnalyzerForm({ onSubmit, isLoading }) {
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [localError, setLocalError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");

    if (mode === "url") {
      if (!url.trim()) {
        setLocalError("Pega un enlace valido para analizar.");
        return;
      }
      onSubmit({ url: url.trim() });
    } else {
      if (text.trim().length < 50) {
        setLocalError("Pega al menos 50 caracteres de texto para un analisis confiable.");
        return;
      }
      onSubmit({ text: text.trim() });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-ink-light border border-ink-border rounded-sm p-6 md:p-8">
      <div className="flex gap-1 mb-6 font-mono text-xs uppercase tracking-wider">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`px-4 py-2 rounded-sm border transition-colors ${
              mode === m.id
                ? "bg-marker text-ink border-marker font-semibold"
                : "border-ink-border text-slate-muted hover:text-paper hover:border-slate-muted"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "url" ? (
        <div>
          <label htmlFor="url" className="block font-mono text-xs uppercase tracking-wider text-slate-muted mb-2">
            URL del articulo o publicacion
          </label>
          <input
            id="url"
            type="url"
            placeholder="https://ejemplo.com/noticia-a-analizar"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-ink border border-ink-border rounded-sm px-4 py-3 text-paper placeholder:text-slate-muted/60 focus:border-marker outline-none transition-colors"
          />
        </div>
      ) : (
        <div>
          <label htmlFor="text" className="block font-mono text-xs uppercase tracking-wider text-slate-muted mb-2">
            Texto a analizar
          </label>
          <textarea
            id="text"
            rows={8}
            placeholder="Pega aqui el parrafo, publicacion o articulo completo..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-ink border border-ink-border rounded-sm px-4 py-3 text-paper placeholder:text-slate-muted/60 focus:border-marker outline-none transition-colors resize-y"
          />
        </div>
      )}

      {localError && <p className="mt-3 text-sm text-alert font-mono">{localError}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 w-full md:w-auto px-8 py-3 bg-marker text-ink font-semibold rounded-sm hover:bg-marker-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Analizando…" : "Detectar sesgo"}
      </button>
    </form>
  );
}
