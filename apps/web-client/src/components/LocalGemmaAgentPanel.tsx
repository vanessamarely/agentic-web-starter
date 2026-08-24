import { useCallback, useEffect, useRef, useState } from "react";
import type { TriagePriority, Vitals } from "@agentic-web-starter/shared-types";
import { suggestTriagePriorityHeuristic } from "../ai/nano/builtInAI";
import { extractVitalsTool, updateTriageBadgeTool } from "../mcp/webMcpTools";
import { logToolCall } from "../mcp/toolCallLog";
import { loadGemmaEngine, type GemmaEngine } from "../ai/gemma/mediapipeGemma";
import { ToolCallConsole } from "./ToolCallConsole";

type EngineState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "ready"; engine: GemmaEngine }
  | { phase: "error"; message: string };

const BADGE_ELEMENT_ID = "gemma-priority-badge";
const DEFAULT_VITALS: Vitals = {
  respiratoryRate: 16,
  pulseRate: 80,
  capillaryRefillSeconds: 1.5,
  consciousness: "ALERT",
  ambulatory: true,
};

const PRIORITY_COLOR: Record<TriagePriority, string> = {
  IMMEDIATE: "bg-red-600",
  DELAYED: "bg-yellow-500",
  MINIMAL: "bg-green-600",
  EXPECTANT: "bg-slate-700",
};

const REPORT_TEMPLATES: Record<TriagePriority, (label: string, rationale: string) => string> = {
  IMMEDIATE: (label, rationale) =>
    `${label}: prioridad IMMEDIATE. ${rationale} Solicitar traslado inmediato y monitoreo continuo hasta la evacuación.`,
  DELAYED: (label, rationale) =>
    `${label}: prioridad DELAYED. ${rationale} Puede esperar traslado tras atender casos IMMEDIATE; reevaluar cada 15 minutos.`,
  MINIMAL: (label, rationale) =>
    `${label}: prioridad MINIMAL. ${rationale} Puede trasladarse por medios propios o esperar en zona segura.`,
  EXPECTANT: (label, rationale) =>
    `${label}: prioridad EXPECTANT. ${rationale} Priorizar cuidado paliativo; reasignar recursos a pacientes recuperables.`,
};

export function LocalGemmaAgentPanel() {
  const [simulatedMode, setSimulatedMode] = useState(true);
  const [engineState, setEngineState] = useState<EngineState>({ phase: "idle" });
  const [rawFieldNotes, setRawFieldNotes] = useState(
    "RR 30, HR 118, cap refill 2.5s, verbal, not ambulatory. Fractura expuesta en fémur.",
  );
  const [patientLabel, setPatientLabel] = useState("Paciente #3 — Puesto Calarcá");
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [reportSource, setReportSource] = useState<"gemma-local" | "simulado" | null>(null);
  const [priority, setPriority] = useState<TriagePriority | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleLoadRealModel = useCallback(async () => {
    setEngineState({ phase: "loading" });
    const result = await loadGemmaEngine();
    if (!mountedRef.current) return;
    if (result.status === "ready") {
      setEngineState({ phase: "ready", engine: result.engine });
    } else {
      setEngineState({ phase: "error", message: result.message });
    }
  }, []);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setReport(null);
    setPriority(null);

    const extracted = extractVitalsTool.handler({ rawText: rawFieldNotes });
    logToolCall({
      toolName: "extractVitals",
      args: { rawText: rawFieldNotes },
      result: extracted,
      agent: "gemma-local",
    });

    const vitals: Vitals = { ...DEFAULT_VITALS, ...extracted };
    const suggestion = suggestTriagePriorityHeuristic(vitals);

    const badgeResult = updateTriageBadgeTool.handler({
      elementId: BADGE_ELEMENT_ID,
      priority: suggestion.priority,
    });
    logToolCall({
      toolName: "updateTriageBadge",
      args: { elementId: BADGE_ELEMENT_ID, priority: suggestion.priority },
      result: badgeResult,
      agent: "gemma-local",
    });

    setPriority(suggestion.priority);

    const useRealModel = !simulatedMode && engineState.phase === "ready";
    if (useRealModel) {
      try {
        const prompt = `Eres un asistente de campo que redacta reportes breves de traspaso entre socorristas. En máximo 2 frases en español, redacta un reporte para: paciente "${patientLabel}", prioridad de triage ${suggestion.priority}, motivo: ${suggestion.rationale}. No uses JSON, solo el texto del reporte.`;
        const text = await engineState.engine.generate(prompt);
        setReport(text.trim());
        setReportSource("gemma-local");
      } catch {
        setReport(REPORT_TEMPLATES[suggestion.priority](patientLabel, suggestion.rationale));
        setReportSource("simulado");
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setReport(REPORT_TEMPLATES[suggestion.priority](patientLabel, suggestion.rationale));
      setReportSource("simulado");
    }

    setRunning(false);
  }, [engineState, patientLabel, rawFieldNotes, simulatedMode]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Agente Local con Gemma</h1>
        <p className="text-sm text-slate-400">
          Un agente 100% local: usa herramientas MCP determinísticas (
          <code>extractVitals</code>, <code>updateTriageBadge</code>) para la parte crítica, y un
          modelo Gemma corriendo en el navegador (vía MediaPipe / Google AI Edge) solo para
          generar el reporte de traspaso en lenguaje natural.
        </p>
      </header>

      <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={simulatedMode}
              onChange={(e) => setSimulatedMode(e.target.checked)}
              className="accent-purple-500"
            />
            Modo seguro (Gemma simulado, sin descargar modelo)
          </label>
          {!simulatedMode && (
            <button
              type="button"
              onClick={handleLoadRealModel}
              disabled={engineState.phase === "loading"}
              className="rounded border border-purple-700 bg-purple-950/50 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-900/50 disabled:opacity-50"
            >
              {engineState.phase === "loading" ? "Cargando modelo…" : "Cargar Gemma real"}
            </button>
          )}
        </div>

        {!simulatedMode && engineState.phase === "ready" && (
          <p className="text-xs text-green-500">
            Gemma cargado localmente vía MediaPipe LLM Inference — la generación del reporte corre
            100% en este navegador.
          </p>
        )}
        {!simulatedMode && engineState.phase === "error" && (
          <p className="text-xs text-amber-500">{engineState.message}</p>
        )}

        <label className="block text-sm font-medium text-slate-300">
          Etiqueta del paciente
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            value={patientLabel}
            onChange={(e) => setPatientLabel(e.target.value)}
          />
        </label>

        <label className="block text-sm font-medium text-slate-300">
          Notas de campo
          <textarea
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100"
            rows={3}
            value={rawFieldNotes}
            onChange={(e) => setRawFieldNotes(e.target.value)}
          />
        </label>

        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className="w-full rounded bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? "Ejecutando agente local…" : "Ejecutar agente local"}
        </button>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Prioridad asignada por herramienta</span>
          <span
            id={BADGE_ELEMENT_ID}
            className={`rounded px-4 py-2 text-sm font-bold text-white ${
              priority ? PRIORITY_COLOR[priority] : "bg-slate-700"
            }`}
          >
            {priority ?? "…"}
          </span>
        </div>
        {report && (
          <div className="mt-3 rounded border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Reporte generado por {reportSource === "gemma-local" ? "Gemma (local, real)" : "plantilla simulada"}
            </p>
            <p className="mt-1 text-sm text-slate-300">{report}</p>
          </div>
        )}
      </section>

      <section>
        <ToolCallConsole />
      </section>
    </div>
  );
}
