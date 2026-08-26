import type { MCPToolDefinition } from "@agentic-web-starter/shared-types";
import { findLabEntry, MEDICAL_REPORT_SECTIONS, type LabEntry } from "../data/medicalReportData";
import { summarizeMedicalResult } from "../ai/nano/medicalPanelAi";

export const listLabResultsTool: MCPToolDefinition<Record<string, never>, { entries: Array<Pick<LabEntry, "id" | "term" | "flag">> }> = {
  name: "listLabResults",
  description:
    "Lists every lab/medical result currently shown in the contextual medical panel, with its id and flag (high/low/normal/warning/info).",
  parameters: { type: "object", properties: {} },
  handler: () => ({
    entries: MEDICAL_REPORT_SECTIONS.flatMap((section) =>
      section.entries.map(({ id, term, flag }) => ({ id, term, flag })),
    ),
  }),
};

export const getLabResultTool: MCPToolDefinition<{ entryId: string }, LabEntry | { error: string }> = {
  name: "getLabResult",
  description: "Returns the full clinical detail (term, value, reference range, flag, raw note) for one lab result by id.",
  parameters: {
    type: "object",
    properties: {
      entryId: { type: "string", description: "Id of the lab result, from listLabResults." },
    },
    required: ["entryId"],
  },
  handler: ({ entryId }) => findLabEntry(entryId) ?? { error: `No lab result with id "${entryId}"` },
};

export const explainLabResultTool: MCPToolDefinition<
  { entryId: string },
  { explanation: string; simulated: boolean } | { error: string }
> = {
  name: "explainLabResult",
  description:
    "Generates a plain-language explanation of one lab result using on-device AI (Chrome's Summarizer / Prompt API), in Spanish.",
  parameters: {
    type: "object",
    properties: {
      entryId: { type: "string", description: "Id of the lab result, from listLabResults." },
    },
    required: ["entryId"],
  },
  handler: async ({ entryId }) => {
    const entry = findLabEntry(entryId);
    if (!entry) return { error: `No lab result with id "${entryId}"` };
    const { text, simulated } = await summarizeMedicalResult(entry.raw);
    return { explanation: text, simulated };
  },
};

export const medicalPanelTools: MCPToolDefinition[] = [
  listLabResultsTool as MCPToolDefinition,
  getLabResultTool as MCPToolDefinition,
  explainLabResultTool as MCPToolDefinition,
];

/** Publishes the medical panel's tools to document.modelContext (real WebMCP), same pattern as registerWebMcpTools in mcp/webMcpTools.ts. */
export function registerMedicalPanelWebMcpTools(): void {
  const modelContext = document.modelContext;
  if (!modelContext) return;
  for (const tool of medicalPanelTools) {
    void modelContext.registerTool({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.parameters,
      execute: (input) => Promise.resolve(tool.handler(input)),
      annotations: { readOnlyHint: true },
    });
  }
}
