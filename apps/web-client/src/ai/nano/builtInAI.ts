import type { TriagePriority, Vitals } from "@agentic-web-starter/shared-types";

/**
 * Ambient typings for Chrome's on-device "Built-in AI" APIs
 * (window.ai.languageModel / window.ai.summarizer). These are experimental
 * origin-trial APIs, so every call site must treat their absence as a normal
 * runtime condition, not an error.
 */
interface LanguageModelCapabilities {
  available: "readily" | "after-download" | "no";
}

interface LanguageModelSessionHandle {
  prompt(input: string): Promise<string>;
  destroy(): void;
}

interface LanguageModelFactory {
  capabilities(): Promise<LanguageModelCapabilities>;
  create(options?: {
    systemPrompt?: string;
    temperature?: number;
    topK?: number;
  }): Promise<LanguageModelSessionHandle>;
}

interface SummarizerFactory {
  capabilities(): Promise<LanguageModelCapabilities>;
  create(options?: {
    type?: "key-points" | "tl;dr" | "teaser" | "headline";
    length?: "short" | "medium" | "long";
  }): Promise<{
    summarize(input: string): Promise<string>;
    destroy(): void;
  }>;
}

declare global {
  interface Window {
    ai?: {
      languageModel?: LanguageModelFactory;
      summarizer?: SummarizerFactory;
    };
  }
}

export type AIReadiness = "ready" | "downloading" | "unavailable" | "unsupported";

export async function getLanguageModelReadiness(): Promise<AIReadiness> {
  const languageModel = window.ai?.languageModel;
  if (!languageModel) return "unsupported";
  try {
    const { available } = await languageModel.capabilities();
    if (available === "readily") return "ready";
    if (available === "after-download") return "downloading";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

export interface TriageAISession {
  prompt(input: string): Promise<string>;
  destroy(): void;
}

const TRIAGE_SYSTEM_PROMPT = `You are an offline field-triage assistant following the START (Simple Triage And Rapid Treatment) protocol used in mass-casualty disaster response. Given a patient's vitals, respond ONLY with a compact JSON object of the shape {"priority":"IMMEDIATE"|"DELAYED"|"MINIMAL"|"EXPECTANT","rationale":"<one short clinical sentence>"}. Do not include any other text.`;

export async function createTriageLanguageModelSession(): Promise<TriageAISession | null> {
  const languageModel = window.ai?.languageModel;
  if (!languageModel) return null;
  try {
    const readiness = await getLanguageModelReadiness();
    if (readiness !== "ready") return null;
    const session = await languageModel.create({
      systemPrompt: TRIAGE_SYSTEM_PROMPT,
      temperature: 0.1,
      topK: 3,
    });
    return {
      prompt: (input: string) => session.prompt(input),
      destroy: () => session.destroy(),
    };
  } catch {
    return null;
  }
}

export async function summarizeClinicalNotes(text: string): Promise<string | null> {
  const summarizer = window.ai?.summarizer;
  if (!summarizer || text.trim().length === 0) return null;
  try {
    const { available } = await summarizer.capabilities();
    if (available === "no") return null;
    const instance = await summarizer.create({ type: "key-points", length: "short" });
    try {
      return await instance.summarize(text);
    } finally {
      instance.destroy();
    }
  } catch {
    return null;
  }
}

export interface TriageSuggestion {
  priority: TriagePriority;
  rationale: string;
  source: "on-device-ai" | "offline-heuristic";
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

/**
 * Deterministic START-protocol decision tree. Used whenever on-device AI is
 * unavailable (offline, unsupported browser, still downloading), so the
 * triage panel always produces a suggestion regardless of connectivity.
 */
export function suggestTriagePriorityHeuristic(vitals: Vitals): TriageSuggestion {
  if (vitals.consciousness === "UNRESPONSIVE" && vitals.respiratoryRate === 0) {
    return {
      priority: "EXPECTANT",
      rationale: "No respirations after airway repositioning and unresponsive.",
      source: "offline-heuristic",
    };
  }
  if (vitals.respiratoryRate > 30 || vitals.respiratoryRate === 0) {
    return {
      priority: "IMMEDIATE",
      rationale: "Respiratory rate outside the 0-30/min safe window.",
      source: "offline-heuristic",
    };
  }
  if (vitals.capillaryRefillSeconds > 2 || vitals.pulseRate > 120) {
    return {
      priority: "IMMEDIATE",
      rationale: "Delayed capillary refill or tachycardia suggests poor perfusion.",
      source: "offline-heuristic",
    };
  }
  if (vitals.consciousness === "PAIN" || vitals.consciousness === "UNRESPONSIVE") {
    return {
      priority: "IMMEDIATE",
      rationale: "Unable to follow simple commands.",
      source: "offline-heuristic",
    };
  }
  if (!vitals.ambulatory) {
    return {
      priority: "DELAYED",
      rationale: "Cannot walk but vitals are within safe ranges.",
      source: "offline-heuristic",
    };
  }
  return {
    priority: "MINIMAL",
    rationale: "Ambulatory with normal perfusion, respiration, and mental status.",
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
    return { ...parsed, source: "on-device-ai" };
  } catch {
    return suggestTriagePriorityHeuristic(vitals);
  }
}
