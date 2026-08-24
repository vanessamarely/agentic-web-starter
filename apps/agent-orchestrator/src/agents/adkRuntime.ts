import {
  Agent,
  FunctionTool,
  InMemoryRunner,
  getFunctionCalls,
  getFunctionResponses,
  isFinalResponse,
  stringifyContent,
} from "@google/adk";
import { Type, type Schema } from "@google/genai";
import type { MCPToolDefinition, MCPToolPropertySchema } from "@agentic-web-starter/shared-types";
import { GEMINI_MODEL } from "../config/genai.js";

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
export function createAdkAgent(definition: AdkAgentDefinition): Agent {
  return new Agent({
    name: definition.name,
    model: GEMINI_MODEL,
    description: definition.description,
    instruction: definition.instruction,
    tools: definition.tools.map(toAdkTool),
  });
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
