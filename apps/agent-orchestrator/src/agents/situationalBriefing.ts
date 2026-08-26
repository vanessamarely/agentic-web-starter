import { getAgentPlatformGenAI, AGENT_PLATFORM_MODEL } from "../config/agentPlatformGenai.js";
import { listHospitalsByRegion } from "../data/hospitals.js";

const BRIEFING_PROMPT = `Eres un asistente de conciencia situacional para la coordinación de respuesta a desastres de una región. A partir del estado actual de cada hospital de esa región (en JSON), redacta en español un briefing ejecutivo conciso (máximo 5 frases): estado general de capacidad, qué instalaciones están al límite o fuera de servicio, y una recomendación concreta. Prosa plana, sin markdown, sin JSON en tu respuesta.`;

export interface SituationalBriefing {
  briefing: string;
  generatedAt: string;
  hospitalsConsidered: number;
}

/**
 * Demonstrates calling Gemini through the Gemini Enterprise Agent Platform
 * (formerly Vertex AI) instead of the Google AI Studio / Developer API path
 * the rest of this project uses — a direct @google/genai call (no ADK, no
 * function calling needed for this single-shot summarization task).
 */
export async function generateSituationalBriefing(regionId: string): Promise<SituationalBriefing> {
  const hospitals = listHospitalsByRegion(regionId);

  const response = await getAgentPlatformGenAI().models.generateContent({
    model: AGENT_PLATFORM_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${BRIEFING_PROMPT}\n\nRegión: ${regionId}\n\n${JSON.stringify(hospitals)}`,
          },
        ],
      },
    ],
  });

  return {
    briefing: (response.text ?? "").trim(),
    generatedAt: new Date().toISOString(),
    hospitalsConsidered: hospitals.length,
  };
}
