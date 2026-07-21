import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import AnalyzerForm from "./components/AnalyzerForm.jsx";
import ResultReport from "./components/ResultReport.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import Loader from "./components/Loader.jsx";
import { runAnalysis, fetchHistory } from "./api/client.js";

export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const items = await fetchHistory(10);
      setHistory(items);
    } catch {
      // El historial es un extra; si falla no bloqueamos la app.
    }
  }

  async function handleSubmit(payload) {
    setIsLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const result = await runAnalysis(payload);
      setAnalysis(result);
      loadHistory();
    } catch (err) {
      const message =
        err.response?.data?.error ||
        "No se pudo completar el analisis. Verifica el backend y vuelve a intentar.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <AnalyzerForm onSubmit={handleSubmit} isLoading={isLoading} />

        {isLoading && <Loader />}

        {error && (
          <p className="mt-6 text-alert font-mono text-sm border border-alert/30 bg-alert/10 rounded-sm px-4 py-3">
            {error}
          </p>
        )}

        {analysis && (
          <div className="mt-8">
            <ResultReport analysis={analysis} />
          </div>
        )}

        <HistoryPanel items={history} onSelect={setAnalysis} activeId={analysis?._id} />
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-10 text-xs text-slate-muted font-mono">
        Echo-Breaker · DEV CHALLENGE Quinta Edicion · PUCE TEC
      </footer>
    </div>
  );
}
