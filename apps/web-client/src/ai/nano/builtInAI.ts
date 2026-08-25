import type { TriagePriority, Vitals } from "@agentic-web-starter/shared-types";

/**
 * Ambient typings for Chrome's built-in Prompt API: a global `LanguageModel`,
 * on by default in Chrome 148+ (desktop). See
 * https://developer.chrome.com/docs/ai/prompt-api
 */
type LanguageModelAvailability = "unavailable" | "downloadable" | "downloading" | "available";

type LanguageModelExpectedInputType = "text" | "image" | "audio";

interface LanguageModelExpectedInput {
  type: LanguageModelExpectedInputType;
  languages?: string[];
}

/** A multimodal prompt part — image/audio support is a newer, still-experimental extension to the Prompt API. */
type LanguageModelContentPart =
  | { type: "text"; value: string }
  | { type: "image"; value: ImageBitmapSource }
  | { type: "audio"; value: Blob };

interface LanguageModelMultimodalMessage {
  role: "user" | "assistant";
  content: LanguageModelContentPart[];
}

interface LanguageModelAvailabilityOptions {
  expectedInputs?: LanguageModelExpectedInput[];
}

interface LanguageModelSessionHandle {
  prompt(input: string | LanguageModelMultimodalMessage[]): Promise<string>;
  destroy(): void;
}

interface LanguageModelInitialPrompt {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LanguageModelStatic {
  availability(options?: LanguageModelAvailabilityOptions): Promise<LanguageModelAvailability>;
  create(options?: {
    initialPrompts?: LanguageModelInitialPrompt[];
    expectedInputs?: LanguageModelExpectedInput[];
    temperature?: number;
    topK?: number;
  }): Promise<LanguageModelSessionHandle>;
}

declare global {
  interface Window {
    LanguageModel?: LanguageModelStatic;
  }
}

export type AIReadiness = "ready" | "downloading" | "unavailable" | "unsupported";

/**
 * Chrome's on-device Prompt API ships on-by-default since Chrome 148, but a
 * conference laptop/projector setup may still run an older Chrome. This
 * demo-mode switch lets a presenter force the "ready" path so the talk
 * never depends on the venue's Chrome version — every response is clearly
 * labeled "(simulado)" in the UI so the audience knows what they're seeing.
 */
let demoModeEnabled = false;

export function setNanoDemoMode(enabled: boolean): void {
  demoModeEnabled = enabled;
}

export function isNanoDemoMode(): boolean {
  return demoModeEnabled;
}

export async function getLanguageModelReadiness(): Promise<AIReadiness> {
  if (demoModeEnabled) return "ready";
  const LanguageModel = window.LanguageModel;
  if (!LanguageModel) return "unsupported";
  try {
    const availability = await LanguageModel.availability();
    if (availability === "available") return "ready";
    if (availability === "downloadable" || availability === "downloading") return "downloading";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

export interface TriageAISession {
  prompt(input: string): Promise<string>;
  destroy(): void;
  readonly simulated: boolean;
}

const TRIAGE_SYSTEM_PROMPT = `You are an offline field-triage assistant following the START (Simple Triage And Rapid Treatment) protocol used in mass-casualty disaster response. Given a patient's vitals, respond ONLY with a compact JSON object of the shape {"priority":"IMMEDIATE"|"DELAYED"|"MINIMAL"|"EXPECTANT","rationale":"<one short clinical sentence, written in Spanish>"}. Keep the JSON keys and the priority value in English exactly as shown; only the rationale sentence should be in Spanish. Do not include any other text.`;

function parseVitalsPromptLine(line: string): Vitals {
  const num = (pattern: RegExp, fallback = 0) => {
    const match = line.match(pattern);
    return match?.[1] ? Number.parseFloat(match[1]) : fallback;
  };
  const consciousnessMatch = line.match(/consciousness:\s*(ALERT|VERBAL|PAIN|UNRESPONSIVE)/i);
  return {
    respiratoryRate: num(/respiratory rate (\d+(?:\.\d+)?)/i),
    pulseRate: num(/pulse (\d+(?:\.\d+)?)/i),
    capillaryRefillSeconds: num(/capillary refill (\d+(?:\.\d+)?)/i),
    consciousness: (consciousnessMatch?.[1]?.toUpperCase() as Vitals["consciousness"]) ?? "ALERT",
    ambulatory: /ambulatory:\s*yes/i.test(line),
    systolicBP: line.includes("systolic BP") ? num(/systolic BP (\d+(?:\.\d+)?)/i) : undefined,
    spo2: line.includes("SpO2") ? num(/SpO2 (\d+(?:\.\d+)?)/i) : undefined,
  };
}

/** A fake session used only in demo mode: runs the real heuristic decision tree but speaks the same JSON protocol a real Prompt API session would. */
function createSimulatedSession(): TriageAISession {
  return {
    simulated: true,
    prompt: async (input: string) => {
      const vitals = parseVitalsPromptLine(input);
      const { priority, rationale } = suggestTriagePriorityHeuristic(vitals);
      return JSON.stringify({ priority, rationale });
    },
    destroy: () => {},
  };
}

export async function createTriageLanguageModelSession(): Promise<TriageAISession | null> {
  if (demoModeEnabled) return createSimulatedSession();
  const LanguageModel = window.LanguageModel;
  if (!LanguageModel) return null;
  try {
    const availability = await LanguageModel.availability();
    if (availability !== "available") return null;
    const session = await LanguageModel.create({
      initialPrompts: [{ role: "system", content: TRIAGE_SYSTEM_PROMPT }],
      temperature: 0.1,
      topK: 3,
    });
    return {
      simulated: false,
      prompt: (input: string) => session.prompt(input),
      destroy: () => session.destroy(),
    };
  } catch {
    return null;
  }
}

export interface TriageSuggestion {
  priority: TriagePriority;
  rationale: string;
  source: "on-device-ai" | "on-device-ai-simulated" | "offline-heuristic";
}

function vitalsToPromptLine(vitals: Vitals): string {
  const parts = [
    `respiratory rate ${vitals.respiratoryRate}/min`,
    `pulse ${vitals.pulseRate}/min`,
    `capillary refill ${vitals.capillaryRefillSeconds}s`,
    `consciousness: ${vitals.consciousness}`,
    `ambulatory: ${vitals.ambulatory ? "yes" : "no"}`,
  ];
  if (vitals.systolicBP !== undefined) parts.push(`systolic BP ${vitals.systolicBP}`);
  if (vitals.spo2 !== undefined) parts.push(`SpO2 ${vitals.spo2}%`);
  return parts.join(", ");
}

function parseModelJson(raw: string): { priority: TriagePriority; rationale: string } | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as { priority?: unknown; rationale?: unknown };
    const validPriorities: TriagePriority[] = ["IMMEDIATE", "DELAYED", "MINIMAL", "EXPECTANT"];
    if (
      typeof parsed.priority === "string" &&
      (validPriorities as string[]).includes(parsed.priority) &&
      typeof parsed.rationale === "string"
    ) {
      return { priority: parsed.priority as TriagePriority, rationale: parsed.rationale };
    }
    return null;
  } catch {
    return null;
  }
}

/** What a responder should actually do with each START priority — the point of computing the priority at all. */
export const PRIORITY_NEXT_ACTION: Record<TriagePriority, string> = {
  IMMEDIATE: "Traslado inmediato. Este paciente no puede esperar.",
  DELAYED: "Puede esperar traslado. Reevaluar cada 15 minutos.",
  MINIMAL: "Puede caminar o esperar. Prioriza primero a los casos más graves.",
  EXPECTANT: "Cuidado paliativo. Reasigna recursos a pacientes recuperables.",
};

/**
 * Deterministic START-protocol decision tree. Used whenever on-device AI is
 * unavailable (offline, unsupported browser, still downloading), so the
 * triage panel always produces a suggestion regardless of connectivity.
 */
export function suggestTriagePriorityHeuristic(vitals: Vitals): TriageSuggestion {
  if (vitals.consciousness === "UNRESPONSIVE" && vitals.respiratoryRate === 0) {
    return {
      priority: "EXPECTANT",
      rationale: "Sin respiraciones tras reposicionar la vía aérea, y no responde.",
      source: "offline-heuristic",
    };
  }
  if (vitals.respiratoryRate > 30 || vitals.respiratoryRate === 0) {
    return {
      priority: "IMMEDIATE",
      rationale: "Frecuencia respiratoria fuera del rango seguro (0-30/min).",
      source: "offline-heuristic",
    };
  }
  if (vitals.capillaryRefillSeconds > 2 || vitals.pulseRate > 120) {
    return {
      priority: "IMMEDIATE",
      rationale: "Llenado capilar lento o taquicardia sugieren mala perfusión.",
      source: "offline-heuristic",
    };
  }
  if (vitals.consciousness === "PAIN" || vitals.consciousness === "UNRESPONSIVE") {
    return {
      priority: "IMMEDIATE",
      rationale: "No puede seguir órdenes simples.",
      source: "offline-heuristic",
    };
  }
  if (!vitals.ambulatory) {
    return {
      priority: "DELAYED",
      rationale: "No puede caminar, pero los vitales están en rangos seguros.",
      source: "offline-heuristic",
    };
  }
  return {
    priority: "MINIMAL",
    rationale: "Ambulatorio, con perfusión, respiración y estado mental normales.",
    source: "offline-heuristic",
  };
}

export async function suggestTriagePriority(
  vitals: Vitals,
  session: TriageAISession | null,
): Promise<TriageSuggestion> {
  if (!session) return suggestTriagePriorityHeuristic(vitals);
  try {
    const raw = await session.prompt(vitalsToPromptLine(vitals));
    const parsed = parseModelJson(raw);
    if (!parsed) return suggestTriagePriorityHeuristic(vitals);
    return { ...parsed, source: session.simulated ? "on-device-ai-simulated" : "on-device-ai" };
  } catch {
    return suggestTriagePriorityHeuristic(vitals);
  }
}

/**
 * On-device, multimodal scene/injury photo analysis. This is a newer,
 * still-experimental extension to the Prompt API (image/audio input) — Chrome
 * may support text prompting fine while still lacking (or requiring specific
 * hardware for) image input, so this is feature-detected independently of
 * `getLanguageModelReadiness`.
 */
export interface TriageImageSession {
  analyze(image: ImageBitmapSource, contextText: string): Promise<string>;
  destroy(): void;
  readonly simulated: boolean;
}

const IMAGE_ANALYSIS_PROMPT =
  "Eres un asistente de triage de campo. Observando solo lo visible en esta foto de una escena de emergencia, describe en una frase clínica corta y en español la severidad de la lesión o los peligros relevantes para el triage. No diagnostiques condiciones que no puedas ver.";

export type ImageAnalysisReadiness = "ready" | "unavailable";

export async function getImageAnalysisReadiness(): Promise<ImageAnalysisReadiness> {
  if (demoModeEnabled) return "ready";
  const LanguageModel = window.LanguageModel;
  if (!LanguageModel) return "unavailable";
  try {
    const availability = await LanguageModel.availability({ expectedInputs: [{ type: "image" }] });
    return availability === "available" ? "ready" : "unavailable";
  } catch {
    return "unavailable";
  }
}

function createSimulatedImageSession(): TriageImageSession {
  return {
    simulated: true,
    analyze: async () =>
      'Modo demo activo: no se analizó contenido real de la imagen. Desactiva "Modo demo" en un Chrome con soporte de entrada de imagen on-device (Prompt API multimodal) para ver un análisis real.',
    destroy: () => {},
  };
}

export async function createTriageImageSession(): Promise<TriageImageSession | null> {
  if (demoModeEnabled) return createSimulatedImageSession();
  const LanguageModel = window.LanguageModel;
  if (!LanguageModel) return null;
  try {
    const availability = await LanguageModel.availability({ expectedInputs: [{ type: "image" }] });
    if (availability !== "available") return null;
    const session = await LanguageModel.create({
      expectedInputs: [{ type: "text" }, { type: "image" }],
    });
    return {
      simulated: false,
      analyze: (image, contextText) =>
        session.prompt([
          {
            role: "user",
            content: [
              {
                type: "text",
                value: contextText
                  ? `${IMAGE_ANALYSIS_PROMPT} Contexto adicional del responder: ${contextText}`
                  : IMAGE_ANALYSIS_PROMPT,
              },
              { type: "image", value: image },
            ],
          },
        ]),
      destroy: () => session.destroy(),
    };
  } catch {
    return null;
  }
}
