import { FilesetResolver, LlmInference } from "@mediapipe/tasks-genai";

/**
 * Real, functional integration with Google AI Edge's MediaPipe LLM
 * Inference API for the web — this is how you run an open Gemma model
 * fully on-device in the browser (WASM/WebGPU), as opposed to Gemini Nano
 * (built into Chrome) or Gemini Flash (cloud). Both the WASM runtime and
 * the model file are configurable so a presenter can self-host either for
 * a reliable offline demo.
 */
const WASM_BASE =
  import.meta.env.VITE_MEDIAPIPE_WASM_BASE ??
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm";

const MODEL_ASSET_PATH = import.meta.env.VITE_GEMMA_MODEL_URL ?? "/models/gemma.task";

export interface GemmaEngine {
  generate(prompt: string): Promise<string>;
}

export type GemmaLoadResult =
  | { status: "ready"; engine: GemmaEngine }
  | { status: "error"; message: string };

let cached: Promise<GemmaLoadResult> | null = null;

async function checkModelAvailable(): Promise<boolean> {
  if (MODEL_ASSET_PATH.startsWith("http")) return true;
  try {
    const response = await fetch(MODEL_ASSET_PATH, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

async function initGemmaEngine(): Promise<GemmaLoadResult> {
  const modelAvailable = await checkModelAvailable();
  if (!modelAvailable) {
    return {
      status: "error",
      message: `No se encontró un modelo Gemma en "${MODEL_ASSET_PATH}". Descarga un modelo compatible (formato .task/.litertlm) desde Kaggle Models o Google AI Edge y colócalo en apps/web-client/public/models/gemma.task, o define VITE_GEMMA_MODEL_URL.`,
    };
  }

  try {
    const genai = await FilesetResolver.forGenAiTasks(WASM_BASE);
    const llmInference = await LlmInference.createFromOptions(genai, {
      baseOptions: { modelAssetPath: MODEL_ASSET_PATH },
      maxTokens: 512,
      topK: 40,
      temperature: 0.4,
      randomSeed: 7,
    });
    return {
      status: "ready",
      engine: {
        generate: (prompt: string) => llmInference.generateResponse(prompt),
      },
    };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "No se pudo inicializar MediaPipe LLM Inference.",
    };
  }
}

/** Loads (once, cached) the on-device Gemma engine via MediaPipe's LLM Inference API. */
export function loadGemmaEngine(): Promise<GemmaLoadResult> {
  cached ??= initGemmaEngine();
  return cached;
}

export function resetGemmaEngine(): void {
  cached = null;
}
