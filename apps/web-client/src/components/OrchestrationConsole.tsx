import { useCallback, useState } from "react";
import type {
  ConsciousnessLevel,
  MedicalResourceType,
  PatientTriageRecord,
  TriagePriority,
} from "@agentic-web-starter/shared-types";

interface ToolCallTrace {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
}

interface OrchestrationResult {
  patientId: string;
  triageValidation: {
    summary: string;
    isConsistent: boolean | null;
    recommendedPriority: TriagePriority | null;
    toolCalls: ToolCallTrace[];
  };
  hospitalRouting: {
    hospitalId: string | null;
    reason: string;
    consideredHospitals: Array<{ id: string; name: string }>;
    toolCalls: ToolCallTrace[];
  };
  supplyChain: {
    summary: string;
    allocations: Array<{ requestId: string; hospitalId: string | null; resourceType: string }>;
    toolCalls: ToolCallTrace[];
  };
  completedAt: string;
}

const REGIONS = [
  { id: "eje-cafetero", label: "Eje Cafetero (Armenia, Pereira, Manizales, Calarcá)" },
  { id: "tolima", label: "Tolima (Ibagué — fuera de servicio, para probar fallos)" },
];

const RESOURCE_TYPES: MedicalResourceType[] = [
  "BLOOD_O_NEG",
  "IV_FLUIDS",
  "ANTIBIOTICS",
  "SURGICAL_KIT",
  "VENTILATOR",
  "ANALGESICS",
  "SPLINTS",
  "OXYGEN",
];

const AGENT_META = [
  { key: "triageValidation" as const, name: "Triage Validator", accent: "border-l-sky-500" },
  { key: "hospitalRouting" as const, name: "Hospital Router", accent: "border-l-amber-500" },
  { key: "supplyChain" as const, name: "Supply Chain Agent", accent: "border-l-emerald-500" },
];

export function OrchestrationConsole() {
  const [patientLabel, setPatientLabel] = useState("Paciente #7 — Calarcá");
  const [regionId, setRegionId] = useState(REGIONS[0]!.id);
  const [priority, setPriority] = useState<TriagePriority>("IMMEDIATE");
  const [respiratoryRate, setRespiratoryRate] = useState(34);
  const [pulseRate, setPulseRate] = useState(128);
  const [capillaryRefillSeconds, setCapillaryRefillSeconds] = useState(3);
  const [consciousness, setConsciousness] = useState<ConsciousnessLevel>("UNRESPONSIVE");
  const [ambulatory, setAmbulatory] = useState(false);
  const [injuries, setInjuries] = useState("Trauma torácico por colapso estructural");

  const [includeResourceRequest, setIncludeResourceRequest] = useState(true);
  const [resourceType, setResourceType] = useState<MedicalResourceType>("BLOOD_O_NEG");
  const [resourceQuantity, setResourceQuantity] = useState(4);
  const [facilityId, setFacilityId] = useState("puesto-avanzado-calarca");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OrchestrationResult | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);

  const handleRun = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setRevealedCount(0);

    const now = new Date().toISOString();
    const patient: PatientTriageRecord = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      patientLabel,
      vitals: {
        respiratoryRate,
        pulseRate,
        capillaryRefillSeconds,
        consciousness,
        ambulatory,
      },
      injuries,
      clinicalNotes: "",
      priority,
      priorityRationale: "",
      suggestedByAI: false,
      offlineSynced: false,
    };

    const resourceRequests = includeResourceRequest
      ? [
          {
            id: crypto.randomUUID(),
            requestedAt: now,
            resourceType,
            quantity: resourceQuantity,
            urgency: priority,
            requestingFacilityId: facilityId,
            regionId,
            status: "PENDING" as const,
          },
        ]
      : [];

    try {
      const response = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient, regionId, resourceRequests }),
      });
      const body = (await response.json()) as OrchestrationResult | { error: string };
      if (!response.ok || "error" in body) {
        throw new Error("error" in body ? body.error : `HTTP ${response.status}`);
      }
      setResult(body);
      AGENT_META.forEach((_, index) => {
        setTimeout(() => setRevealedCount((count) => Math.max(count, index + 1)), index * 350);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido llamando al orquestador.");
    } finally {
      setLoading(false);
    }
  }, [
    ambulatory,
    capillaryRefillSeconds,
    consciousness,
    facilityId,
    includeResourceRequest,
    injuries,
    patientLabel,
    priority,
    pulseRate,
    regionId,
    resourceQuantity,
    resourceType,
    respiratoryRate,
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Orquestación Multi-Agente</h1>
        <p className="text-sm text-slate-400">
          Gemini Flash coordina tres agentes especializados vía function calling —{" "}
          <span className="text-slate-300">Triage Validator</span>,{" "}
          <span className="text-slate-300">Hospital Router</span> y{" "}
          <span className="text-slate-300">Supply Chain Agent</span> — cada uno con sus propias
          herramientas MCP contra datos reales de hospitales.
        </p>
      </header>

      <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-slate-300">
            Paciente
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              value={patientLabel}
              onChange={(e) => setPatientLabel(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-300">
            Región
            <select
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NumberField label="Frec. resp." value={respiratoryRate} onChange={setRespiratoryRate} />
          <NumberField label="Pulso" value={pulseRate} onChange={setPulseRate} />
          <NumberField
            label="Llenado cap. (s)"
            value={capillaryRefillSeconds}
            step={0.1}
            onChange={setCapillaryRefillSeconds}
          />
          <label className="block text-sm font-medium text-slate-300">
            Consciencia
            <select
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              value={consciousness}
              onChange={(e) => setConsciousness(e.target.value as ConsciousnessLevel)}
            >
              <option value="ALERT">Alerta</option>
              <option value="VERBAL">Responde a la voz</option>
              <option value="PAIN">Responde al dolor</option>
              <option value="UNRESPONSIVE">No responde</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={ambulatory} onChange={(e) => setAmbulatory(e.target.checked)} />
            Ambulatorio
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            Prioridad reportada
            <select
              className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TriagePriority)}
            >
              <option value="IMMEDIATE">IMMEDIATE</option>
              <option value="DELAYED">DELAYED</option>
              <option value="MINIMAL">MINIMAL</option>
              <option value="EXPECTANT">EXPECTANT</option>
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-300">
          Lesiones
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            value={injuries}
            onChange={(e) => setInjuries(e.target.value)}
          />
        </label>

        <div className="rounded border border-slate-800 bg-slate-950/60 p-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <input
              type="checkbox"
              checked={includeResourceRequest}
              onChange={(e) => setIncludeResourceRequest(e.target.checked)}
            />
            Incluir solicitud de insumos médicos
          </label>
          {includeResourceRequest && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              <label className="block text-xs font-medium text-slate-400">
                Insumo
                <select
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value as MedicalResourceType)}
                >
                  {RESOURCE_TYPES.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </label>
              <NumberField label="Cantidad" value={resourceQuantity} onChange={setResourceQuantity} compact />
              <label className="block text-xs font-medium text-slate-400">
                Puesto solicitante
                <input
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100"
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                />
              </label>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="w-full rounded bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Orquestando…" : "Ejecutar orquestación multi-agente"}
        </button>
      </section>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          <p className="font-semibold">La orquestación falló</p>
          <p className="mt-1 text-red-400">{error}</p>
          <p className="mt-2 text-xs text-red-500">
            Verifica que el orquestador esté corriendo (<code>pnpm dev</code>) y que{" "}
            <code>apps/agent-orchestrator/.env</code> tenga un <code>GEMINI_API_KEY</code> válido.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          {AGENT_META.map((meta, index) => {
            if (index >= revealedCount) return null;
            const outcome = result[meta.key];
            return (
              <div
                key={meta.key}
                className={`animate-[fadeIn_0.3s_ease-out] rounded-lg border border-slate-800 border-l-4 ${meta.accent} bg-slate-900 p-4`}
              >
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-200">
                  {meta.name}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {"summary" in outcome ? outcome.summary : outcome.reason}
                </p>
                {outcome.toolCalls.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-slate-500">
                      {outcome.toolCalls.length} llamada(s) a herramientas MCP
                    </summary>
                    <ul className="mt-1.5 space-y-1 font-mono text-xs text-slate-500">
                      {outcome.toolCalls.map((call, callIndex) => (
                        <li key={callIndex} className="border-l-2 border-slate-800 pl-2">
                          <span className="text-slate-300">{call.name}</span>(
                          {JSON.stringify(call.args)}) →{" "}
                          <span className="text-green-500/80">{JSON.stringify(call.result)}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
  compact = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  compact?: boolean;
}) {
  return (
    <label className={`block font-medium text-slate-300 ${compact ? "text-xs" : "text-sm"}`}>
      {label}
      <input
        type="number"
        step={step}
        className={`mt-1 w-full rounded border border-slate-700 bg-slate-950 text-slate-100 ${
          compact ? "px-2 py-1.5 text-sm" : "px-3 py-2"
        }`}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
      />
    </label>
  );
}
