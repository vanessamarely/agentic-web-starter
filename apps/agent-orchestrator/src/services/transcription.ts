import { genAI, GEMINI_MODEL } from "../config/genai.js";
import { getAgentPlatformGenAI, AGENT_PLATFORM_MODEL } from "../config/agentPlatformGenai.js";
import type { AiMode } from "../agents/adkRuntime.js";

const TRANSCRIBE_PROMPT =
  "Transcribe exactly what is said in this audio recording, in the language it was spoken in. Respond with ONLY the transcription text — no commentary, no quotation marks, no translation.";

export interface TranscribeAudioInput {
  audioBase64: string;
  mimeType: string;
  mode?: AiMode;
}

/**
 * Transcribes a short voice note using Gemini's native audio understanding
 * (no separate speech-to-text model needed — the same gemini-3.7-flash used
 * for orchestration accepts inline audio as a content part). Supports both
 * the Google AI Studio client and the Gemini Enterprise Agent Platform
 * client; the latter is built lazily so a missing GOOGLE_CLOUD_PROJECT only
 * breaks Agent Platform mode, not AI Studio mode.
 */
export async function transcribeAudio({
  audioBase64,
  mimeType,
  mode = "ai-studio",
}: TranscribeAudioInput): Promise<string> {
  const client = mode === "agent-platform" ? getAgentPlatformGenAI() : genAI;
  const model = mode === "agent-platform" ? AGENT_PLATFORM_MODEL : GEMINI_MODEL;

  const response = await client.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [{ text: TRANSCRIBE_PROMPT }, { inlineData: { data: audioBase64, mimeType } }],
      },
    ],
  });

  return (response.text ?? "").trim();
}
