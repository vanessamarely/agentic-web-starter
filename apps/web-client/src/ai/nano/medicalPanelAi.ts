/**
 * On-device AI for the medical context panel: Chrome's Summarizer API for a
 * one-shot summary, and the same global `LanguageModel` (Prompt API) used
 * by the rest of this app for follow-up questions/action plans — both
 * feature-detected independently, both fully on-device (0 network calls).
 * See https://developer.chrome.com/docs/ai/summarizer-api and
 * https://developer.chrome.com/docs/ai/prompt-api
 */
type SummarizerAvailability = "unavailable" | "downloadable" | "downloading" | "available";

interface SummarizerHandle {
  summarize(input: string): Promise<string>;
  destroy(): void;
}

interface SummarizerStatic {
  availability(): Promise<SummarizerAvailability>;
  create(options?: {
    type?: "key-points" | "tldr" | "teaser" | "headline";
    length?: "short" | "medium" | "long";
    format?: "markdown" | "plain-text";
    sharedContext?: string;
    expectedInputLanguages?: string[];
  }): Promise<SummarizerHandle>;
}

declare global {
  interface Window {
    Summarizer?: SummarizerStatic;
  }
}

export type MedicalAiReadiness = "ready" | "unavailable" | "unsupported";

let demoModeEnabled = false;

export function setMedicalPanelDemoMode(enabled: boolean): void {
  demoModeEnabled = enabled;
}

export function isMedicalPanelDemoMode(): boolean {
  return demoModeEnabled;
}

export async function getMedicalAiReadiness(): Promise<MedicalAiReadiness> {
  if (demoModeEnabled) return "ready";
  if (!window.Summarizer && !window.LanguageModel) return "unsupported";
  try {
    const summarizerAvailability = window.Summarizer ? await window.Summarizer.availability() : "unavailable";
    const languageModelAvailability = window.LanguageModel
      ? await window.LanguageModel.availability()
      : "unavailable";
    if (summarizerAvailability === "available" || languageModelAvailability === "available") return "ready";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

function simulatedSummary(sourceText: string): string {
  const excerpt = sourceText.split(".").filter(Boolean).slice(0, 2).join(".").trim();
  return `${excerpt}.\n\nEste valor requiere correlación con tu historial clínico. Habla con tu médico para interpretarlo en tu contexto.\n\n🔒 Simulado para demo · 0 llamadas de red.`;
}

/** One-shot on-device summary of a lab/medical result, via Summarizer when available, LanguageModel as fallback, or a simulated response in demo mode. */
export async function summarizeMedicalResult(sourceText: string): Promise<{ text: string; simulated: boolean }> {
  if (demoModeEnabled) return { text: simulatedSummary(sourceText), simulated: true };

  if (window.Summarizer) {
    try {
      const availability = await window.Summarizer.availability();
      if (availability === "available" || availability === "downloadable") {
        const summarizer = await window.Summarizer.create({
          type: "key-points",
          length: "short",
          format: "markdown",
          sharedContext: "Panel de contexto médico. Explica en lenguaje cotidiano, sin alarmismos.",
          expectedInputLanguages: ["es", "en"],
        });
        try {
          const text = await summarizer.summarize(sourceText);
          return { text, simulated: false };
        } finally {
          summarizer.destroy();
        }
      }
    } catch {
      // fall through to LanguageModel / simulated
    }
  }

  const session = await createMedicalPromptSession();
  if (session) {
    try {
      const text = await session.prompt(
        `Resume en 2-3 líneas, en español y lenguaje cotidiano, qué significa este resultado médico: "${sourceText}"`,
      );
      return { text, simulated: false };
    } finally {
      session.destroy();
    }
  }

  return { text: simulatedSummary(sourceText), simulated: true };
}

interface MedicalPromptSession {
  prompt(input: string): Promise<string>;
  destroy(): void;
}

async function createMedicalPromptSession(): Promise<MedicalPromptSession | null> {
  if (!window.LanguageModel) return null;
  try {
    const availability = await window.LanguageModel.availability();
    if (availability !== "available") return null;
    const session = await window.LanguageModel.create({
      initialPrompts: [
        {
          role: "system",
          content:
            "Eres un asistente médico de confianza. Explica conceptos clínicos en lenguaje cotidiano, sin alarmismos. Responde siempre en español, de forma breve.",
        },
      ],
      temperature: 0.3,
    });
    return {
      prompt: (input: string) => session.prompt(input),
      destroy: () => session.destroy(),
    };
  } catch {
    return null;
  }
}

const SIMULATED_ANSWER =
  "Este resultado requiere correlación clínica. Lleva este dato a tu próxima consulta para revisarlo con tu médico.\n\n🔒 Simulado para demo · 0 llamadas de red.";

/** Answers a follow-up question about a medical result on-device, given the raw result text and prior turns. */
export async function askAboutMedicalResult(
  resultText: string,
  question: string,
  priorTurns: string,
): Promise<{ text: string; simulated: boolean }> {
  if (demoModeEnabled) return { text: SIMULATED_ANSWER, simulated: true };

  const session = await createMedicalPromptSession();
  if (!session) return { text: SIMULATED_ANSWER, simulated: true };

  try {
    const prompt = [
      `Resultado médico: "${resultText}"`,
      priorTurns ? `\nHistorial de la conversación:\n${priorTurns}` : "",
      `\nPregunta: "${question}"`,
      "\nResponde en español, máximo 3 oraciones claras, sin alarmismos:",
    ]
      .filter(Boolean)
      .join("");
    const text = await session.prompt(prompt);
    return { text, simulated: false };
  } finally {
    session.destroy();
  }
}
