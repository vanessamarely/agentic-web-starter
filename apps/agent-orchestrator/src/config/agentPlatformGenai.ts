import { GoogleGenAI } from "@google/genai";

/**
 * A second @google/genai client configured for the Gemini Enterprise Agent
 * Platform (formerly Vertex AI) instead of the Google AI Studio / Gemini
 * Developer API path used by config/genai.ts. Authenticates via Application
 * Default Credentials — on Cloud Run that's the service's own identity, no
 * API key required at all. Requires GOOGLE_CLOUD_PROJECT (and optionally
 * GOOGLE_CLOUD_LOCATION) to be set; falls back to gcloud's configured
 * project when running locally with `gcloud auth application-default login`.
 */
const project = process.env.GOOGLE_CLOUD_PROJECT;
// gemini-3.7-flash is only available in the "global" region on the Gemini
// Enterprise Agent Platform (no regional data residency for this model yet).
const location = process.env.GOOGLE_CLOUD_LOCATION ?? "global";

if (!project) {
  throw new Error(
    "GOOGLE_CLOUD_PROJECT is not set. Required for Gemini Enterprise Agent Platform (Vertex AI) mode.",
  );
}

export const agentPlatformGenAI = new GoogleGenAI({ vertexai: true, project, location });

export const AGENT_PLATFORM_MODEL = "gemini-3.7-flash";
