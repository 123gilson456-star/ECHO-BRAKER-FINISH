import BiasGauge from "./BiasGauge.jsx";
import CounterNarratives from "./CounterNarratives.jsx";

export default function ResultReport({ analysis }) {
  return (
    <div className="bg-paper text-ink rounded-sm border border-ink-border overflow-hidden">
      <div className="p-6 md:p-8 border-b border-ink/10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50 mb-1">
          Resultado del expediente
        </p>
        {analysis.sourceUrl && (
          <a
            href={analysis.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline decoration-marker decoration-2 break-all"
          >
            {analysis.sourceUrl}
          </a>
        )}
      </div>

      <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
        <div>
          <BiasGauge score={analysis.biasScore} />

          <div className="mt-8">
            <SectionLabel>Direccion del sesgo</SectionLabel>
            <p className="font-display text-xl mt-1">{analysis.detectedBiasDirection}</p>
          </div>

          <div className="mt-6">
            <SectionLabel>Tono emocional dominante</SectionLabel>
            <p className="mt-1 text-ink/80">{analysis.emotionalTone}</p>
          </div>
        </div>

        <div>
          <SectionLabel>Resumen del hallazgo</SectionLabel>
          <p className="mt-1 text-ink/80 leading-relaxed">{analysis.summary}</p>

          {analysis.polarizingLanguage?.length > 0 && (
            <div className="mt-6">
              <SectionLabel>Lenguaje polarizante detectado</SectionLabel>
              <ul className="mt-2 space-y-2">
                {analysis.polarizingLanguage.map((phrase, i) => (
                  <li
                    key={i}
                    className="text-sm bg-marker/15 border-l-2 border-marker px-3 py-2 rounded-sm"
                  >
                    {phrase}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.omittedPerspectives?.length > 0 && (
            <div className="mt-6">
              <SectionLabel>Perspectivas probablemente omitidas</SectionLabel>
              <ul className="mt-2 space-y-1.5 list-disc list-inside text-sm text-ink/80">
                {analysis.omittedPerspectives.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-ink/10 p-6 md:p-8">
        <CounterNarratives items={analysis.counterNarratives} keywords={analysis.searchKeywords} />
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="font-mono text-xs uppercase tracking-wider text-ink/50">{children}</p>
  );
}
