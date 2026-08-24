import { genAI, GEMINI_MODEL } from "../config/genai.js";

const TRANSCRIBE_PROMPT =
  "Transcribe exactly what is said in this audio recording, in the language it was spoken in. Respond with ONLY the transcription text — no commentary, no quotation marks, no translation.";

export interface TranscribeAudioInput {
  audioBase64: string;
  mimeType: string;
}

/**
 * Transcribes a short voice note using Gemini's native audio understanding
 * (no separate speech-to-text model needed — the same gemini-3.7-flash used
 * for orchestration accepts inline audio as a content part).
 */
export async function transcribeAudio({ audioBase64, mimeType }: TranscribeAudioInput): Promise<string> {
  const response = await genAI.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [{ text: TRANSCRIBE_PROMPT }, { inlineData: { data: audioBase64, mimeType } }],
      },
    ],
  });

  return (response.text ?? "").trim();
}
