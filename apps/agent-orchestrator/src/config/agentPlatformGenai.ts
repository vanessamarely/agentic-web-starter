import { GoogleGenAI } from "@google/genai";

/**
 * A second @google/genai client configured for the Gemini Enterprise Agent
 * Platform (formerly Vertex AI) instead of the Google AI Studio / Gemini
 * Developer API path used by config/genai.ts.
 *
 * Two authentication options are supported, verified directly against the
 * installed @google/genai@2.18.0 (both succeed a live generateContent call):
 *
 *   1. AGENT_PLATFORM_API_KEY set: authenticates with that key (Vertex AI
 *      "Express Mode"-style — `{ enterprise: true, apiKey }`). No gcloud
 *      login needed on the machine running this.
 *   2. AGENT_PLATFORM_API_KEY unset: falls back to Application Default
 *      Credentials — on Cloud Run that's the service's own identity; locally
 *      it's whatever `gcloud auth application-default login` configured.
 *
 * Either way GOOGLE_CLOUD_PROJECT (and optionally GOOGLE_CLOUD_LOCATION) must
 * be set — the ADK-based demos (2 and 5) need `project`/`location` set
 * explicitly even in API-key mode, unlike this direct-call client.
 *
 * Built lazily (not at module load) so a missing GOOGLE_CLOUD_PROJECT only
 * breaks Agent Platform mode when it's actually used, rather than crashing
 * the whole server on boot for anyone only using AI Studio mode.
 */
export const AGENT_PLATFORM_MODEL = "gemini-3.7-flash";

let cachedClient: GoogleGenAI | undefined;

export function getAgentPlatformGenAI(): GoogleGenAI {
  if (cachedClient) return cachedClient;

  const project = process.env.GOOGLE_CLOUD_PROJECT;
  if (!project) {
    throw new Error(
      "GOOGLE_CLOUD_PROJECT is not set. Required for Gemini Enterprise Agent Platform (Vertex AI) mode.",
    );
  }
  // gemini-3.7-flash is only available in the "global" region on the Gemini
  // Enterprise Agent Platform (no regional data residency for this model yet).
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? "global";
  const apiKey = process.env.AGENT_PLATFORM_API_KEY;

  // `enterprise` is the @google/genai SDK's current recommended option for
  // this (its own type declarations mark `vertexai` as still valid but
  // superseded — "The `enterprise` flag is recommended instead").
  cachedClient = apiKey
    ? new GoogleGenAI({ enterprise: true, apiKey, project, location })
    : new GoogleGenAI({ enterprise: true, project, location });
  return cachedClient;
}
