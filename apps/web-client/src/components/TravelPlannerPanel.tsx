import { useCallback, useState } from "react";
import type { TravelPlan, TravelRequest } from "@agentic-web-starter/shared-types";
import { AiModeToggle, type AiMode } from "./AiModeToggle";

interface TravelPlanResponse {
  plan: TravelPlan;
  mode: AiMode;
  agentTrace: Array<{ agent: string; output: string }>;
}

const AGENT_LABEL: Record<string, string> = {
  flight_agent: "✈️ Vuelos",
  hotel_agent: "🏨 Hospedaje",
  activity_agent: "🎟️ Actividades",
  itinerary_agent: "🗓️ Itinerario",
};

export function TravelPlannerPanel() {
  const [origin, setOrigin] = useState("Bogotá");
  const [destination, setDestination] = useState("Cartagena");
  const [startDate, setStartDate] = useState("2026-10-10");
  const [endDate, setEndDate] = useState("2026-10-14");
  const [travelers, setTravelers] = useState(2);
  const [budgetUsd, setBudgetUsd] = useState(1500);
  const [interests, setInterests] = useState("playa, historia, comida local");
  const [mode, setMode] = useState<AiMode>("ai-studio");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TravelPlanResponse | null>(null);

  const handlePlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const trip: TravelRequest = {
      origin,
      destination,
      startDate,
      endDate,
      travelers,
      budgetUsd,
      interests,
    };

    try {
      const response = await fetch("/api/travel-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip, mode }),
      });
      const body = (await response.json()) as TravelPlanResponse | { error: string };
      if (!response.ok || "error" in body) {
        throw new Error("error" in body ? body.error : `HTTP ${response.status}`);
      }
      setResult(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido planificando el viaje.");
    } finally {
      setLoading(false);
    }
  }, [budgetUsd, destination, endDate, interests, mode, origin, startDate, travelers]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Planificador de Viajes Multi-Agente</h1>
        <p className="text-sm text-slate-400">
          Tres agentes ADK especializados (vuelos, hospedaje, actividades) investigan tu viaje en
          paralelo con <span className="text-slate-300">gemini-3.7-flash</span>; un cuarto agente
          combina sus recomendaciones en un itinerario día a día. Basado en el ejemplo{" "}
          <span className="text-slate-300">travel-planner-multi</span>, reconstruido sobre la misma
          infraestructura ADK real de la Demo 2.
        </p>
      </header>

      <div className="grid grid-cols-4 gap-3 text-xs">
        <div className="rounded border border-l-4 border-slate-800 border-l-sky-500 bg-slate-900 p-3">
          <p className="font-semibold text-slate-300">Vuelos</p>
        </div>
        <div className="rounded border border-l-4 border-slate-800 border-l-amber-500 bg-slate-900 p-3">
          <p className="font-semibold text-slate-300">Hospedaje</p>
        </div>
        <div className="rounded border border-l-4 border-slate-800 border-l-emerald-500 bg-slate-900 p-3">
          <p className="font-semibold text-slate-300">Actividades</p>
        </div>
        <div className="rounded border border-l-4 border-slate-800 border-l-purple-500 bg-slate-900 p-3">
          <p className="font-semibold text-slate-300">Itinerario</p>
        </div>
      </div>

      <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Origen" value={origin} onChange={setOrigin} />
          <TextField label="Destino" value={destination} onChange={setDestination} />
          <TextField label="Fecha de salida" value={startDate} onChange={setStartDate} type="date" />
          <TextField label="Fecha de regreso" value={endDate} onChange={setEndDate} type="date" />
          <TextField
            label="Viajeros"
            value={String(travelers)}
            onChange={(v) => setTravelers(Number.parseInt(v, 10) || 1)}
            type="number"
          />
          <TextField
            label="Presupuesto total (USD)"
            value={String(budgetUsd)}
            onChange={(v) => setBudgetUsd(Number.parseInt(v, 10) || 0)}
            type="number"
          />
        </div>
        <TextField label="Intereses" value={interests} onChange={setInterests} />

        <div className="flex items-center justify-between gap-3 rounded border border-slate-800 bg-slate-950/60 px-3 py-2">
          <span className="text-xs text-slate-400">
            Los 4 agentes corren con tu API key de AI Studio, o con la Gemini Enterprise Agent
            Platform (créditos de GCP).
          </span>
          <AiModeToggle mode={mode} onChange={setMode} />
        </div>

        <button
          type="button"
          onClick={handlePlan}
          disabled={loading}
          className="w-full rounded bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Planificando…" : "Planificar viaje con 4 agentes"}
        </button>
      </section>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          <p className="font-semibold">La planificación falló</p>
          <p className="mt-1 text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <p className="text-right text-[11px] uppercase tracking-wide text-slate-600">
            Corrió vía{" "}
            {result.mode === "agent-platform" ? "Gemini Enterprise Agent Platform" : "Google AI Studio"}
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {result.agentTrace
              .filter((step) => step.agent !== "itinerary_agent")
              .map((step) => (
                <div
                  key={step.agent}
                  className="animate-[fadeIn_0.3s_ease-out] rounded-lg border border-slate-800 bg-slate-900 p-3"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {AGENT_LABEL[step.agent] ?? step.agent}
                  </h3>
                  <p className="mt-1.5 whitespace-pre-line text-sm text-slate-300">{step.output}</p>
                </div>
              ))}
          </div>

          <div className="animate-[fadeIn_0.3s_ease-out] rounded-lg border border-slate-800 border-l-4 border-l-purple-500 bg-slate-900 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-200">
              {AGENT_LABEL.itinerary_agent}
            </h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300">
              {result.plan.itinerary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-300">
      {label}
      <input
        type={type}
        className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
