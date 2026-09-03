/**
 * A minimal, dependency-free JSON-schema-like shape used to describe MCP /
 * WebMCP / Gemini function-calling tool parameters without pulling in a
 * schema-conversion library. It is intentionally compatible with both the
 * Gemini function-declaration format and the WebMCP tool-manifest shape.
 */
export interface MCPToolPropertySchema {
  type: "string" | "number" | "integer" | "boolean" | "array" | "object";
  description?: string;
  enum?: readonly (string | number)[];
  items?: MCPToolPropertySchema;
  properties?: Record<string, MCPToolPropertySchema>;
  required?: readonly string[];
}

export interface MCPToolParameterSchema {
  type: "object";
  properties: Record<string, MCPToolPropertySchema>;
  required?: readonly string[];
}

/**
 * A tool an agent (on-device or cloud) can discover and invoke.
 * `TArgs`/`TResult` give call sites full type safety even though the
 * schema itself is described in plain JSON-schema form for interop.
 */
export interface MCPToolDefinition<
  TArgs extends Record<string, unknown> = Record<string, unknown>,
  TResult = unknown,
> {
  name: string;
  description: string;
  parameters: MCPToolParameterSchema;
  handler: (args: TArgs) => Promise<TResult> | TResult;
}

/**
 * Serializable subset of an MCPToolDefinition, suitable for sending to a
 * model (Gemini function declarations, or a WebMCP tool manifest) without
 * leaking the local handler closure.
 */
export type MCPToolManifestEntry = Pick<
  MCPToolDefinition,
  "name" | "description" | "parameters"
>;

export function toToolManifest(
  tools: readonly MCPToolDefinition[],
): MCPToolManifestEntry[] {
  return tools.map(({ name, description, parameters }) => ({
    name,
    description,
    parameters,
  }));
}
