import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ConsciousnessLevel,
  PatientTriageRecord,
  TriagePriority,
  Vitals,
} from "@agentic-web-starter/shared-types";
import {
  createTriageLanguageModelSession,
  getLanguageModelReadiness,
  suggestTriagePriority,
  type AIReadiness,
  type TriageAISession,
  type TriageSuggestion,
} from "../ai/nano/builtInAI";
import {
  cacheOfflineRecordTool,
  extractVitalsTool,
  getOfflineQueue,
  updateTriageBadgeTool,
} from "../mcp/webMcpTools";

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
  ready: "On-device AI ready",
  downloading: "On-device model downloading…",
  unavailable: "On-device AI unavailable — using offline heuristic",
  unsupported: "Browser has no window.ai — using offline heuristic",
};

const BADGE_ELEMENT_ID = "triage-priority-badge";
const DEBOUNCE_MS = 400;

export function ContextualTriagePanel() {
  const [patientLabel, setPatientLabel] = useState("Patient #1");
  const [rawFieldNotes, setRawFieldNotes] = useState("");
  const [vitals, setVitals] = useState<Vitals>(DEFAULT_VITALS);
  const [injuries, setInjuries] = useState("");
  const [suggestion, setSuggestion] = useState<TriageSuggestion | null>(null);
  const [readiness, setReadiness] = useState<AIReadiness>("unsupported");
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [offlineQueueSize, setOfflineQueueSize] = useState(() => getOfflineQueue().length);
  const [lastCachedAt, setLastCachedAt] = useState<string | null>(null);

  const sessionRef = useRef<TriageAISession | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await getLanguageModelReadiness();
      if (cancelled) return;
      setReadiness(r);
      if (r === "ready") {
        sessionRef.current = await createTriageLanguageModelSession();
      }
    })();
    return () => {
      cancelled = true;
      sessionRef.current?.destroy();
    };
  }, []);

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

  // Reactive, no manual "run" button: every vitals change re-triggers a
  // debounced triage suggestion, on-device when possible, heuristic otherwise.
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
    updateTriageBadgeTool.handler({ elementId: BADGE_ELEMENT_ID, priority: suggestion.priority });
  }, [suggestion]);

  const handleRawNotesChange = useCallback((value: string) => {
    setRawFieldNotes(value);
    const extracted = extractVitalsTool.handler({ rawText: value });
    if (Object.keys(extracted).length === 0) return;
    setVitals((current) => ({ ...current, ...extracted }));
  }, []);

  const updateVital = useCallback(<K extends keyof Vitals>(key: K, value: Vitals[K]) => {
    setVitals((current) => ({ ...current, [key]: value }));
  }, []);

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
      suggestedByAI: suggestion?.source === "on-device-ai",
      offlineSynced: false,
    };
    const { queueSize } = await cacheOfflineRecordTool.handler({ record });
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
          <h1 className="text-2xl font-bold text-slate-100">Contextual Triage Panel</h1>
          <p className="text-sm text-slate-400">{READINESS_LABEL[readiness]}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isOnline ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
          }`}
        >
          {isOnline ? "ONLINE" : "OFFLINE"}
        </span>
      </header>

      <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <label className="block text-sm font-medium text-slate-300">
          Patient label
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            value={patientLabel}
            onChange={(e) => setPatientLabel(e.target.value)}
          />
        </label>

        <label className="block text-sm font-medium text-slate-300">
          Field notes (typed or dictated — vitals are auto-extracted as you type)
          <textarea
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            rows={3}
            placeholder="e.g. RR 34, HR 128, cap refill 3s, unresponsive, not ambulatory"
            value={rawFieldNotes}
            onChange={(e) => handleRawNotesChange(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <NumberField
            label="Respiratory rate"
            value={vitals.respiratoryRate}
            onChange={(v) => updateVital("respiratoryRate", v)}
          />
          <NumberField
            label="Pulse rate"
            value={vitals.pulseRate}
            onChange={(v) => updateVital("pulseRate", v)}
          />
          <NumberField
            label="Cap refill (s)"
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
            label="Systolic BP"
            value={vitals.systolicBP ?? 0}
            onChange={(v) => updateVital("systolicBP", v)}
          />
          <label className="block text-sm font-medium text-slate-300">
            Consciousness
            <select
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              value={vitals.consciousness}
              onChange={(e) => updateVital("consciousness", e.target.value as ConsciousnessLevel)}
            >
              <option value="ALERT">Alert</option>
              <option value="VERBAL">Responds to verbal</option>
              <option value="PAIN">Responds to pain</option>
              <option value="UNRESPONSIVE">Unresponsive</option>
            </select>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <input
            type="checkbox"
            checked={vitals.ambulatory}
            onChange={(e) => updateVital("ambulatory", e.target.checked)}
          />
          Ambulatory (walking wounded)
        </label>

        <label className="block text-sm font-medium text-slate-300">
          Injuries
          <textarea
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            rows={2}
            value={injuries}
            onChange={(e) => setInjuries(e.target.value)}
          />
        </label>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Suggested priority</span>
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
              ({suggestion.source === "on-device-ai" ? "on-device AI" : "offline heuristic"})
            </span>
          </p>
        )}
      </section>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleCacheOffline}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Cache record offline
        </button>
        <span className="text-xs text-slate-500">
          Offline queue: {offlineQueueSize}
          {lastCachedAt ? ` · last cached ${new Date(lastCachedAt).toLocaleTimeString()}` : ""}
        </span>
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
