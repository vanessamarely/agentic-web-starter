import { Type, type Content, type FunctionDeclaration, type Schema } from "@google/genai";
import type { MCPToolDefinition, MCPToolPropertySchema } from "@agentic-web-starter/shared-types";
import { genAI, GEMINI_MODEL } from "../config/genai.js";

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

export function toGeminiFunctionDeclarations(
  tools: readonly MCPToolDefinition[],
): FunctionDeclaration[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: toGeminiSchema(tool.parameters),
  }));
}

export interface AgentTurnOptions {
  systemInstruction: string;
  userPrompt: string;
  tools: readonly MCPToolDefinition[];
  maxToolRoundTrips?: number;
}

export interface AgentTurnResult {
  finalText: string;
  toolCallsExecuted: Array<{ name: string; args: Record<string, unknown>; result: unknown }>;
}

/**
 * Drives a single Gemini function-calling agent turn: sends the prompt with
 * the tool manifest, executes any requested tool calls against real local
 * handlers, feeds the results back, and repeats until the model returns a
 * final text answer (or the round-trip budget is exhausted).
 */
export async function runAgentTurn(options: AgentTurnOptions): Promise<AgentTurnResult> {
  const { systemInstruction, userPrompt, tools, maxToolRoundTrips = 4 } = options;
  const toolsByName = new Map(tools.map((tool) => [tool.name, tool]));
  const functionDeclarations = toGeminiFunctionDeclarations(tools);

  const contents: Content[] = [{ role: "user", parts: [{ text: userPrompt }] }];
  const toolCallsExecuted: AgentTurnResult["toolCallsExecuted"] = [];

  for (let round = 0; round <= maxToolRoundTrips; round += 1) {
    const response = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined,
      },
    });

    const functionCalls = response.functionCalls ?? [];
    if (functionCalls.length === 0) {
      return { finalText: response.text ?? "", toolCallsExecuted };
    }

    const modelParts = response.candidates?.[0]?.content?.parts ?? [];
    contents.push({ role: "model", parts: modelParts });

    const functionResponseParts = await Promise.all(
      functionCalls.map(async (call) => {
        const name = call.name ?? "";
        const args = (call.args ?? {}) as Record<string, unknown>;
        const tool = toolsByName.get(name);
        const result = tool
          ? await tool.handler(args)
          : { error: `Unknown tool requested by model: ${name}` };
        toolCallsExecuted.push({ name, args, result });
        return {
          functionResponse: {
            name,
            response: { result },
          },
        };
      }),
    );

    contents.push({ role: "user", parts: functionResponseParts });
  }

  return {
    finalText: "Agent exceeded the maximum number of tool round-trips without a final answer.",
    toolCallsExecuted,
  };
}
