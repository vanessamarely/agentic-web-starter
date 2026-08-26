import {
  Agent,
  FunctionTool,
  Gemini,
  InMemoryRunner,
  getFunctionCalls,
  getFunctionResponses,
  isFinalResponse,
  stringifyContent,
} from "@google/adk";
import { Type, type Schema } from "@google/genai";
import type { MCPToolDefinition, MCPToolPropertySchema } from "@agentic-web-starter/shared-types";
import { GEMINI_MODEL } from "../config/genai.js";

/**
 * Which Gemini backend an ADK agent authenticates against: Google AI Studio
 * (an API key, the free/personal-credits path) or the Gemini Enterprise
 * Agent Platform (Application Default Credentials, e.g. Cloud Run's own
 * service identity — no key at all, billed against GCP credits).
 */
export type AiMode = "ai-studio" | "agent-platform";

/**
 * Builds the ADK model for a given mode. AI Studio mode passes the model
 * name as a plain string — ADK's Gemini integration resolves the API key
 * itself from GOOGLE_GENAI_API_KEY / GOOGLE_API_KEY / GEMINI_API_KEY. Agent
 * Platform mode passes an explicit `Gemini` instance instead of relying on
 * env vars, so only this one agent runs against the Agent Platform rather
 * than flipping the whole process.
 *
 * This uses `vertexai: true`, not the newer `enterprise: true` used by
 * config/agentPlatformGenai.ts for direct (non-ADK) @google/genai calls —
 * @google/adk's own Gemini wrapper (GeminiParams) only exposes `vertexai` as
 * of @google/adk 2.0.0, it hasn't picked up the `enterprise` rename yet.
 * `vertexai` itself is still fully supported by the underlying @google/genai
 * SDK, just no longer the option its own docs recommend for direct use.
 */
function resolveAdkModel(mode: AiMode): string | Gemini {
  if (mode === "ai-studio") return GEMINI_MODEL;

  const project = process.env.GOOGLE_CLOUD_PROJECT;
  if (!project) {
    throw new Error(
      "GOOGLE_CLOUD_PROJECT is not set. Required to run an agent in Gemini Enterprise Agent Platform mode.",
    );
  }
  const location = process.env.GOOGLE_CLOUD_LOCATION ?? "global";
  const apiKey = process.env.AGENT_PLATFORM_API_KEY;
  // Verified live: ADK's Gemini wrapper accepts an apiKey alongside
  // vertexai/project/location (an Express Mode-style credential) as an
  // alternative to Application Default Credentials — unlike the direct
  // @google/genai client, ADK still requires project/location even then.
  return apiKey
    ? new Gemini({ model: GEMINI_MODEL, vertexai: true, apiKey, project, location })
    : new Gemini({ model: GEMINI_MODEL, vertexai: true, project, location });
}

const JSON_SCHEMA_TYPE_TO_GEMINI_TYPE: Record<MCPToolPropertySchema["type"], Type> = {
  string: Type.STRING,
  number: Type.NUMBER,
  integer: Type.INTEGER,
  boolean: Type.BOOLEAN,
  array: Type.ARRAY,
  object: Type.OBJECT,
};

function toGeminiSchema(property: MCPToolPropertySchema): Schema {
  const schema: Schema = {
    type: JSON_SCHEMA_TYPE_TO_GEMINI_TYPE[property.type],
  };
  if (property.description) schema.description = property.description;
  if (property.enum) schema.enum = property.enum.map(String);
  if (property.items) schema.items = toGeminiSchema(property.items);
  if (property.properties) {
    schema.properties = Object.fromEntries(
      Object.entries(property.properties).map(([key, value]) => [key, toGeminiSchema(value)]),
    );
  }
  if (property.required) schema.required = [...property.required];
  return schema;
}

/** Adapts one of this project's shared MCPToolDefinition tools (the same shape the web-client's WebMCP tools use) into a real ADK FunctionTool. */
function toAdkTool(tool: MCPToolDefinition): FunctionTool {
  return new FunctionTool({
    name: tool.name,
    description: tool.description,
    parameters: toGeminiSchema(tool.parameters),
    execute: (input) => tool.handler(input as Record<string, unknown>),
  });
}

export interface AdkAgentDefinition {
  name: string;
  description: string;
  instruction: string;
  tools: MCPToolDefinition[];
}

/** Builds a real ADK LlmAgent backed by gemini-3.7-flash and this project's shared tool definitions. */
export function createAdkAgent(definition: AdkAgentDefinition, mode: AiMode = "ai-studio"): Agent {
  return new Agent({
    name: definition.name,
    model: resolveAdkModel(mode),
    description: definition.description,
    instruction: definition.instruction,
    tools: definition.tools.map(toAdkTool),
  });
}

/**
 * Lazily builds and caches one ADK agent per mode from the same definition,
 * so both the AI Studio and Agent Platform variants of a demo share one
 * instruction/tool definition instead of drifting apart.
 */
export function createDualModeAdkAgent(definition: AdkAgentDefinition): (mode: AiMode) => Agent {
  const cache = new Map<AiMode, Agent>();
  return (mode: AiMode) => {
    let agent = cache.get(mode);
    if (!agent) {
      agent = createAdkAgent(definition, mode);
      cache.set(mode, agent);
    }
    return agent;
  };
}

export interface AdkAgentTurnResult {
  finalText: string;
  toolCallsExecuted: Array<{ name: string; args: Record<string, unknown>; result: unknown }>;
}

/**
 * Runs one turn of a real ADK agent via InMemoryRunner and collects a flat
 * tool-call trace by correlating function-call/function-response event pairs
 * by their shared `id` — ADK executes tools internally (unlike a hand-rolled
 * function-calling loop), so this trace is assembled from the event stream
 * rather than intercepted directly.
 */
export async function runAdkAgentTurn(agent: Agent, userPrompt: string): Promise<AdkAgentTurnResult> {
  const runner = new InMemoryRunner({ agent });
  const pendingCalls = new Map<string, { name: string; args: Record<string, unknown> }>();
  const toolCallsExecuted: AdkAgentTurnResult["toolCallsExecuted"] = [];
  let finalText = "";

  for await (const event of runner.runEphemeral({
    userId: "agentic-web-starter",
    newMessage: { role: "user", parts: [{ text: userPrompt }] },
  })) {
    for (const call of getFunctionCalls(event)) {
      if (call.id) {
        pendingCalls.set(call.id, {
          name: call.name ?? "",
          args: (call.args ?? {}) as Record<string, unknown>,
        });
      }
    }
    for (const response of getFunctionResponses(event)) {
      const pending = response.id ? pendingCalls.get(response.id) : undefined;
      toolCallsExecuted.push({
        name: pending?.name ?? response.name ?? "",
        args: pending?.args ?? {},
        result: response.response,
      });
      if (response.id) pendingCalls.delete(response.id);
    }
    if (isFinalResponse(event)) {
      finalText = stringifyContent(event);
    }
  }

  return { finalText, toolCallsExecuted };
}
