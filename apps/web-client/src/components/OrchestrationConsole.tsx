import { useCallback, useState, type ReactNode } from "react";
import type {
  ConsciousnessLevel,
  MedicalResourceType,
  PatientTriageRecord,
  TriagePriority,
} from "@agentic-web-starter/shared-types";
import { AiModeToggle, type AiMode } from "./AiModeToggle";

interface ToolCallTrace {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
}

interface ConsideredHospital {
  id: string;
  name: string;
  traumaLevel: number;
  capacityAvailableBeds: number;
  icuAvailableBeds: number;
  operational: boolean;
}

interface OrchestrationResult {
  patientId: string;
  mode: AiMode;
  triageValidation: {
    summary: string;
    isConsistent: boolean | null;
    recommendedPriority: TriagePriority | null;
    toolCalls: ToolCallTrace[];
  };
  hospitalRouting: {
    hospitalId: string | null;
    reason: string;
    consideredHospitals: ConsideredHospital[];
    toolCalls: ToolCallTrace[];
  };
  supplyChain: {
    summary: string;
    allocations: Array<{
      requestId: string;
      resourceType: string;
      quantity: number;
      hospitalId: string | null;
      hospitalName: string | null;
    }>;
    unfulfilled: Array<{ requestId: string; resourceType: string; quantity: number }>;
    toolCalls: ToolCallTrace[];
  };
  completedAt: string;
}

const RESOURCE_LABEL: Record<string, string> = {
  BLOOD_O_NEG: "Sangre O-",
  IV_FLUIDS: "Suero IV",
  ANTIBIOTICS: "Antibióticos",
  SURGICAL_KIT: "Kit quirúrgico",
  VENTILATOR: "Ventilador",
  ANALGESICS: "Analgésicos",
  SPLINTS: "Férulas",
  OXYGEN: "Oxígeno",
};

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
  const [mode, setMode] = useState<AiMode>("ai-studio");

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
        body: JSON.stringify({ patient, regionId, resourceRequests, mode }),
      });
      const body = (await response.json()) as OrchestrationResult | { error: string };
      if (!response.ok || "error" in body) {
        throw new Error("error" in body ? body.error : `HTTP ${response.status}`);
      }
      setResult(body);
      [0, 1, 2].forEach((index) => {
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
    mode,
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
          Un paciente crítico acaba de llegar. Alguien tiene que validar su prioridad clínica,
          buscar el mejor hospital disponible y conseguir los insumos que necesita — todo a la
          vez. Eso es lo que hace este panel: llama al backend (Gemini Flash) para correr tres
          agentes especializados en paralelo, cada uno usando sus propias herramientas (MCP)
          contra datos reales de hospitales.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="rounded border border-l-4 border-slate-800 border-l-sky-500 bg-slate-900 p-3">
          <p className="font-semibold text-slate-300">1. Validador de Triage</p>
          <p className="mt-1 text-slate-500">¿La prioridad reportada coincide con los vitales?</p>
        </div>
        <div className="rounded border border-l-4 border-slate-800 border-l-amber-500 bg-slate-900 p-3">
          <p className="font-semibold text-slate-300">2. Enrutador Hospitalario</p>
          <p className="mt-1 text-slate-500">¿Qué hospital con capacidad lo recibe?</p>
        </div>
        <div className="rounded border border-l-4 border-slate-800 border-l-emerald-500 bg-slate-900 p-3">
          <p className="font-semibold text-slate-300">3. Agente de Insumos</p>
          <p className="mt-1 text-slate-500">¿Quién surte los insumos solicitados?</p>
        </div>
      </div>

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

        <div className="flex items-center justify-between gap-3 rounded border border-slate-800 bg-slate-950/60 px-3 py-2">
          <span className="text-xs text-slate-400">
            Backend de los 3 agentes ADK: API key de AI Studio, o Application Default Credentials
            en la Gemini Enterprise Agent Platform (créditos de GCP).
          </span>
          <AiModeToggle mode={mode} onChange={setMode} />
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
          <p className="text-right text-[11px] uppercase tracking-wide text-slate-600">
            Corrió vía{" "}
            {result.mode === "agent-platform" ? "Gemini Enterprise Agent Platform" : "Google AI Studio"}
          </p>
          {revealedCount > 0 && (
            <AgentCard title="Validador de Triage" accent="border-l-sky-500">
              <TriageValidationBody outcome={result.triageValidation} />
              <ToolCallDetails toolCalls={result.triageValidation.toolCalls} />
            </AgentCard>
          )}
          {revealedCount > 1 && (
            <AgentCard title="Enrutador Hospitalario" accent="border-l-amber-500">
              <HospitalRoutingBody outcome={result.hospitalRouting} />
              <ToolCallDetails toolCalls={result.hospitalRouting.toolCalls} />
            </AgentCard>
          )}
          {revealedCount > 2 && (
            <AgentCard title="Agente de Insumos" accent="border-l-emerald-500">
              <SupplyChainBody outcome={result.supplyChain} />
              <ToolCallDetails toolCalls={result.supplyChain.toolCalls} />
            </AgentCard>
          )}
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

function AgentCard({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`animate-[fadeIn_0.3s_ease-out] rounded-lg border border-slate-800 border-l-4 ${accent} bg-slate-900 p-4`}
    >
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-200">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ToolCallDetails({ toolCalls }: { toolCalls: ToolCallTrace[] }) {
  if (toolCalls.length === 0) return null;
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-xs text-slate-500">
        Ver detalles técnicos ({toolCalls.length} llamada{toolCalls.length === 1 ? "" : "s"} a
        herramientas MCP)
      </summary>
      <ul className="mt-1.5 max-w-full space-y-1 overflow-x-auto font-mono text-xs text-slate-500">
        {toolCalls.map((call, callIndex) => (
          <li key={callIndex} className="break-all border-l-2 border-slate-800 pl-2">
            <span className="text-slate-300">{call.name}</span>({JSON.stringify(call.args)}) →{" "}
            <span className="text-green-500/80">{JSON.stringify(call.result)}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

function TriageValidationBody({ outcome }: { outcome: OrchestrationResult["triageValidation"] }) {
  const confirmed = outcome.isConsistent === true;
  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl leading-none">{confirmed ? "✅" : "⚠️"}</span>
      <div>
        <p className="font-semibold text-slate-100">
          {confirmed
            ? "Prioridad confirmada"
            : outcome.recommendedPriority
              ? `Debería ser ${outcome.recommendedPriority}`
              : "No se pudo validar"}
        </p>
        <p className="mt-0.5 text-sm text-slate-400">{outcome.summary}</p>
      </div>
    </div>
  );
}

function HospitalRoutingBody({ outcome }: { outcome: OrchestrationResult["hospitalRouting"] }) {
  const chosen = outcome.hospitalId
    ? outcome.consideredHospitals.find((h) => h.id === outcome.hospitalId)
    : null;

  if (!chosen) {
    return (
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none">🚫</span>
        <div>
          <p className="font-semibold text-amber-400">Sin hospital disponible</p>
          <p className="mt-0.5 text-sm text-slate-400">{outcome.reason}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none">🏥</span>
        <div>
          <p className="text-lg font-semibold text-slate-100">{chosen.name}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-400">
              Nivel {chosen.traumaLevel}
            </span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-400">
              {chosen.capacityAvailableBeds} camas libres
            </span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-400">
              {chosen.icuAvailableBeds} UCI
            </span>
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-400">{outcome.reason}</p>
    </div>
  );
}

function SupplyChainBody({ outcome }: { outcome: OrchestrationResult["supplyChain"] }) {
  if (outcome.allocations.length === 0 && outcome.unfulfilled.length === 0) {
    return <p className="text-sm text-slate-500">No se solicitaron insumos médicos.</p>;
  }
  return (
    <ul className="space-y-1.5">
      {outcome.allocations.map((allocation) => (
        <li key={allocation.requestId} className="flex items-center gap-2 text-sm">
          <span className="text-green-500">✅</span>
          <span className="text-slate-200">
            {allocation.quantity}x {RESOURCE_LABEL[allocation.resourceType] ?? allocation.resourceType}
          </span>
          <span className="text-slate-600">→</span>
          <span className="text-slate-300">{allocation.hospitalName}</span>
        </li>
      ))}
      {outcome.unfulfilled.map((request) => (
        <li key={request.requestId} className="flex items-center gap-2 text-sm">
          <span className="text-red-500">❌</span>
          <span className="text-slate-300">
            {request.quantity}x {RESOURCE_LABEL[request.resourceType] ?? request.resourceType}
          </span>
          <span className="text-slate-500">— sin stock disponible en la región</span>
        </li>
      ))}
    </ul>
  );
}
