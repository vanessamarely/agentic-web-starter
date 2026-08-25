import { useCallback, useState } from "react";

interface SituationalBriefing {
  briefing: string;
  generatedAt: string;
  hospitalsConsidered: number;
}

export function AgentPlatformBriefingPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SituationalBriefing | null>(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/briefing");
      const body = (await response.json()) as SituationalBriefing | { error: string };
      if (!response.ok || "error" in body) {
        throw new Error("error" in body ? body.error : `HTTP ${response.status}`);
      }
      setResult(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido generando el briefing.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Briefing Regional</h1>
        <p className="text-sm text-slate-400">
          Un comandante de incidente necesita, en segundos, un resumen de cómo está la red
          hospitalaria de la región completa — no un paciente a la vez. Este panel le pide a
          Gemini que lea el estado de todos los hospitales y redacte un briefing ejecutivo.
        </p>
      </header>

      <div className="rounded border border-l-4 border-slate-800 border-l-purple-500 bg-slate-900 p-3 text-xs">
        <p className="font-semibold text-slate-300">Distinto a la Demo 2, a propósito</p>
        <p className="mt-1 text-slate-500">
          La orquestación (Demo 2) usa tu API key de Google AI Studio a través de ADK. Este panel
          llama al mismo modelo <span className="text-slate-300">directo con @google/genai</span>{" "}
          pero en <span className="text-slate-300">modo Gemini Enterprise Agent Platform</span>{" "}
          (antes Vertex AI) — sin ninguna API key: se autentica con la identidad propia del
          servicio de Cloud Run donde corre el backend.
        </p>
      </div>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generando briefing…" : "Generar briefing regional"}
        </button>
      </section>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          <p className="font-semibold">No se pudo generar el briefing</p>
          <p className="mt-1 text-red-400">{error}</p>
          <p className="mt-2 text-xs text-red-500">
            En Cloud Run esto requiere el rol IAM <code>roles/aiplatform.user</code> en la cuenta
            de servicio, y la variable <code>GOOGLE_CLOUD_PROJECT</code> configurada. Localmente,
            corre <code>gcloud auth application-default login</code> primero.
          </p>
        </div>
      )}

      {result && (
        <section className="animate-[fadeIn_0.3s_ease-out] rounded-lg border border-slate-800 border-l-4 border-l-purple-500 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-200">
              Briefing ejecutivo
            </h3>
            <span className="text-[11px] uppercase tracking-wide text-slate-600">
              vía Gemini Enterprise Agent Platform
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{result.briefing}</p>
          <p className="mt-3 text-xs text-slate-600">
            {result.hospitalsConsidered} hospitales considerados · generado{" "}
            {new Date(result.generatedAt).toLocaleTimeString()}
          </p>
        </section>
      )}
    </div>
  );
}
