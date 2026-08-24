import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ConsciousnessLevel,
  PatientTriageRecord,
  TriagePriority,
  Vitals,
} from "@agentic-web-starter/shared-types";
import {
  createTriageImageSession,
  createTriageLanguageModelSession,
  getLanguageModelReadiness,
  isNanoDemoMode,
  setNanoDemoMode,
  suggestTriagePriority,
  type AIReadiness,
  type TriageAISession,
  type TriageSuggestion,
} from "../ai/nano/builtInAI";
import {
  cacheOfflineRecordTool,
  extractVitalsTool,
  getOfflineQueue,
  isNativeWebMcpSupported,
  updateTriageBadgeTool,
} from "../mcp/webMcpTools";
import { logToolCall } from "../mcp/toolCallLog";
import { ToolCallConsole } from "./ToolCallConsole";
import { VoiceNoteButton } from "./VoiceNoteButton";

const DEFAULT_VITALS: Vitals = {
  respiratoryRate: 16,
  pulseRate: 80,
  capillaryRefillSeconds: 1.5,
  consciousness: "ALERT",
  ambulatory: true,
  spo2: 98,
  systolicBP: 118,
};

const PRIORITY_STYLES: Record<TriagePriority, { bg: string; text: string; label: string }> = {
  IMMEDIATE: { bg: "bg-red-600", text: "text-white", label: "IMMEDIATE" },
  DELAYED: { bg: "bg-yellow-500", text: "text-slate-950", label: "DELAYED" },
  MINIMAL: { bg: "bg-green-600", text: "text-white", label: "MINIMAL" },
  EXPECTANT: { bg: "bg-slate-700", text: "text-white", label: "EXPECTANT" },
};

const READINESS_LABEL: Record<AIReadiness, string> = {
  ready: "Gemini Nano listo (Prompt API / LanguageModel)",
  downloading: "Descargando el modelo on-device…",
  unavailable: "Gemini Nano no disponible en este Chrome — usando heurística offline",
  unsupported: "Este navegador no tiene la Prompt API — usando heurística offline",
};

const SOURCE_LABEL: Record<TriageSuggestion["source"], string> = {
  "on-device-ai": "Gemini Nano (on-device)",
  "on-device-ai-simulated": "Gemini Nano (simulado para demo)",
  "offline-heuristic": "heurística offline",
};

const BADGE_ELEMENT_ID = "triage-priority-badge";
const DEBOUNCE_MS = 400;

export function ContextualTriagePanel() {
  const [patientLabel, setPatientLabel] = useState("Paciente #1");
  const [rawFieldNotes, setRawFieldNotes] = useState("");
  const [vitals, setVitals] = useState<Vitals>(DEFAULT_VITALS);
  const [injuries, setInjuries] = useState("");
  const [suggestion, setSuggestion] = useState<TriageSuggestion | null>(null);
  const [readiness, setReadiness] = useState<AIReadiness>("unsupported");
  const [demoMode, setDemoMode] = useState(() => isNanoDemoMode());
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [offlineQueueSize, setOfflineQueueSize] = useState(() => getOfflineQueue().length);
  const [lastCachedAt, setLastCachedAt] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<{ text: string; simulated: boolean } | null>(
    null,
  );
  const [imageAnalyzing, setImageAnalyzing] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const sessionRef = useRef<TriageAISession | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      sessionRef.current?.destroy();
      sessionRef.current = null;
      const r = await getLanguageModelReadiness();
      if (cancelled) return;
      setReadiness(r);
      if (r === "ready") {
        sessionRef.current = await createTriageLanguageModelSession();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [demoMode]);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Reactiva, sin botón manual: cada cambio en los vitales dispara (con
  // debounce) una nueva sugerencia de triage, on-device cuando es posible.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void suggestTriagePriority(vitals, sessionRef.current).then(setSuggestion);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [vitals]);

  useEffect(() => {
    if (!suggestion) return;
    const result = updateTriageBadgeTool.handler({
      elementId: BADGE_ELEMENT_ID,
      priority: suggestion.priority,
    });
    logToolCall({
      toolName: "updateTriageBadge",
      args: { elementId: BADGE_ELEMENT_ID, priority: suggestion.priority },
      result,
      agent: suggestion.source === "offline-heuristic" ? "manual" : "gemini-nano",
    });
  }, [suggestion]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleToggleDemoMode = useCallback((enabled: boolean) => {
    setNanoDemoMode(enabled);
    setDemoMode(enabled);
  }, []);

  const handleRawNotesChange = useCallback((value: string) => {
    setRawFieldNotes(value);
    const extracted = extractVitalsTool.handler({ rawText: value });
    logToolCall({ toolName: "extractVitals", args: { rawText: value }, result: extracted, agent: "manual" });
    if (Object.keys(extracted).length === 0) return;
    setVitals((current) => ({ ...current, ...extracted }));
  }, []);

  const updateVital = useCallback(<K extends keyof Vitals>(key: K, value: Vitals[K]) => {
    setVitals((current) => ({ ...current, [key]: value }));
  }, []);

  const handleImageSelected = useCallback(
    async (file: File) => {
      setImagePreviewUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return URL.createObjectURL(file);
      });
      setImageAnalysis(null);
      setImageError(null);
      setImageAnalyzing(true);

      const session = await createTriageImageSession();
      if (!session) {
        setImageAnalyzing(false);
        setImageError(
          "Este navegador no soporta entrada de imagen on-device (Prompt API multimodal), o el modelo aún no está disponible.",
        );
        return;
      }

      try {
        const text = await session.analyze(file, injuries || rawFieldNotes);
        setImageAnalysis({ text: text.trim(), simulated: session.simulated });
      } catch {
        setImageError("No se pudo analizar la imagen en este intento.");
      } finally {
        session.destroy();
        setImageAnalyzing(false);
      }
    },
    [injuries, rawFieldNotes],
  );

  const handleCacheOffline = useCallback(async () => {
    const now = new Date().toISOString();
    const record: PatientTriageRecord = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      patientLabel,
      vitals,
      injuries,
      clinicalNotes: rawFieldNotes,
      priority: suggestion?.priority ?? "DELAYED",
      priorityRationale: suggestion?.rationale ?? "",
      suggestedByAI: suggestion?.source !== "offline-heuristic",
      offlineSynced: false,
    };
    const { queueSize } = await cacheOfflineRecordTool.handler({ record });
    logToolCall({ toolName: "cacheOfflineRecord", args: { recordId: record.id }, result: { queueSize }, agent: "manual" });
    setOfflineQueueSize(queueSize);
    setLastCachedAt(now);
  }, [injuries, patientLabel, rawFieldNotes, suggestion, vitals]);

  const priorityStyle = useMemo(
    () => (suggestion ? PRIORITY_STYLES[suggestion.priority] : null),
    [suggestion],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Panel de Triage Contextual</h1>
          <p className="text-sm text-slate-400">{READINESS_LABEL[readiness]}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isOnline ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
            }`}
          >
            {isOnline ? "EN LÍNEA" : "SIN CONEXIÓN"}
          </span>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => handleToggleDemoMode(e.target.checked)}
              className="accent-sky-500"
            />
            Modo demo (simular Gemini Nano)
          </label>
        </div>
      </header>

      <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
        <p>
          <strong className="text-slate-300">Qué hace este panel:</strong> escribe notas de campo
          abajo (o edita los vitales directamente) y la prioridad de triage se recalcula sola, sin
          botones — usando Gemini Nano dentro de este navegador cuando está disponible, o un
          heurístico clínico determinístico cuando no lo está.
        </p>
        <span
          className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold ${
            isNativeWebMcpSupported()
              ? "bg-emerald-950 text-emerald-400"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          {isNativeWebMcpSupported()
            ? "WebMCP nativo activo (document.modelContext)"
            : "WebMCP nativo no detectado — actívalo en chrome://flags/#enable-webmcp-testing (Chrome 149+)"}
        </span>
      </div>

      <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <label className="block text-sm font-medium text-slate-300">
          Etiqueta del paciente
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            value={patientLabel}
            onChange={(e) => setPatientLabel(e.target.value)}
          />
        </label>

        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-300" htmlFor="field-notes-input">
            Notas de campo (los vitales se extraen automáticamente al escribir)
          </label>
          <VoiceNoteButton onTranscript={handleRawNotesChange} />
        </div>
        <p className="-mt-2 text-[11px] text-slate-500">
          El dictado transcribe con Gemini Flash en la nube (audio nativo, sin modelo de
          voz-a-texto aparte); la extracción de vitales y la prioridad siguen corriendo aquí en el
          navegador.
        </p>
        <div>
          <textarea
            id="field-notes-input"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            rows={3}
            placeholder="ej. RR 34, HR 128, cap refill 3s, unresponsive, not ambulatory"
            value={rawFieldNotes}
            onChange={(e) => handleRawNotesChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <NumberField
            label="Frec. respiratoria"
            value={vitals.respiratoryRate}
            onChange={(v) => updateVital("respiratoryRate", v)}
          />
          <NumberField
            label="Pulso"
            value={vitals.pulseRate}
            onChange={(v) => updateVital("pulseRate", v)}
          />
          <NumberField
            label="Llenado capilar (s)"
            value={vitals.capillaryRefillSeconds}
            step={0.1}
            onChange={(v) => updateVital("capillaryRefillSeconds", v)}
          />
          <NumberField
            label="SpO2 (%)"
            value={vitals.spo2 ?? 0}
            onChange={(v) => updateVital("spo2", v)}
          />
          <NumberField
            label="Presión sistólica"
            value={vitals.systolicBP ?? 0}
            onChange={(v) => updateVital("systolicBP", v)}
          />
          <label className="block text-sm font-medium text-slate-300">
            Consciencia
            <select
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              value={vitals.consciousness}
              onChange={(e) => updateVital("consciousness", e.target.value as ConsciousnessLevel)}
            >
              <option value="ALERT">Alerta</option>
              <option value="VERBAL">Responde a la voz</option>
              <option value="PAIN">Responde al dolor</option>
              <option value="UNRESPONSIVE">No responde</option>
            </select>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <input
            type="checkbox"
            checked={vitals.ambulatory}
            onChange={(e) => updateVital("ambulatory", e.target.checked)}
          />
          Ambulatorio (puede caminar)
        </label>

        <label className="block text-sm font-medium text-slate-300">
          Lesiones
          <textarea
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            rows={2}
            value={injuries}
            onChange={(e) => setInjuries(e.target.value)}
          />
        </label>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div>
          <label className="block text-sm font-medium text-slate-300" htmlFor="scene-photo-input">
            📷 Foto de la escena o la lesión (opcional)
          </label>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Se analiza on-device con Gemini Nano (entrada de imagen multimodal) — la foto nunca
            sale del navegador. Es contexto adicional, no reemplaza los vitales en la decisión de
            prioridad.
          </p>
        </div>
        <input
          id="scene-photo-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImageSelected(file);
          }}
          className="block w-full text-xs text-slate-400 file:mr-3 file:rounded file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-200 hover:file:bg-slate-700"
        />
        {imagePreviewUrl && (
          <div className="flex gap-3">
            <img
              src={imagePreviewUrl}
              alt="Vista previa de la escena"
              className="h-24 w-24 rounded border border-slate-700 object-cover"
            />
            <div className="flex-1 text-sm">
              {imageAnalyzing && <p className="text-slate-500">Analizando imagen on-device…</p>}
              {imageError && <p className="text-amber-500">{imageError}</p>}
              {imageAnalysis && (
                <div>
                  <p className="text-slate-300">{imageAnalysis.text}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-600">
                    {imageAnalysis.simulated
                      ? "Gemini Nano (simulado para demo)"
                      : "Gemini Nano (on-device, multimodal)"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Prioridad sugerida</span>
          <span
            id={BADGE_ELEMENT_ID}
            data-priority={suggestion?.priority ?? ""}
            className={`rounded px-4 py-2 text-sm font-bold ${priorityStyle?.bg ?? "bg-slate-700"} ${
              priorityStyle?.text ?? "text-white"
            }`}
          >
            {suggestion ? PRIORITY_STYLES[suggestion.priority].label : "…"}
          </span>
        </div>
        {suggestion && (
          <p className="mt-2 text-sm text-slate-400">
            {suggestion.rationale}{" "}
            <span className="text-xs uppercase tracking-wide text-slate-600">
              ({SOURCE_LABEL[suggestion.source]})
            </span>
          </p>
        )}
      </section>

      <section>
        <ToolCallConsole />
      </section>

      <div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleCacheOffline}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Guardar registro offline
          </button>
          <span className="text-xs text-slate-500">
            Cola offline: {offlineQueueSize}
            {lastCachedAt ? ` · guardado ${new Date(lastCachedAt).toLocaleTimeString()}` : ""}
          </span>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">
          Simula perder la señal a mitad de un rescate: guarda este registro con{" "}
          <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-400">cacheOfflineRecord</code>{" "}
          en el almacenamiento local del navegador, para sincronizarlo con el orquestador cuando
          vuelva la conexión.
        </p>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <label className="block text-sm font-medium text-slate-300">
      {label}
      <input
        type="number"
        step={step}
        className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
      />
    </label>
  );
}
