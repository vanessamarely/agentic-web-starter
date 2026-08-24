import type {
  ConsciousnessLevel,
  MCPToolDefinition,
  PatientTriageRecord,
  Vitals,
} from "@agentic-web-starter/shared-types";

const OFFLINE_QUEUE_KEY = "triage.offlineQueue.v1";

/**
 * Parses a free-text vitals blob (e.g. pasted or dictated field notes) into
 * structured Vitals. Tolerant of ordering and missing fields; anything it
 * cannot confidently extract is simply omitted rather than guessed.
 */
function extractVitalsFromText(text: string): Partial<Vitals> {
  const result: Partial<Vitals> = {};

  const rr = text.match(/\b(?:rr|resp(?:iratory)?(?:\s*rate)?)\D{0,5}(\d{1,3})/i);
  if (rr?.[1]) result.respiratoryRate = Number.parseInt(rr[1], 10);

  const pulse = text.match(/\b(?:hr|pulse|heart\s*rate)\D{0,5}(\d{1,3})/i);
  if (pulse?.[1]) result.pulseRate = Number.parseInt(pulse[1], 10);

  const capRefill = text.match(/\bcap(?:illary)?\s*refill\D{0,5}(\d+(?:\.\d+)?)/i);
  if (capRefill?.[1]) result.capillaryRefillSeconds = Number.parseFloat(capRefill[1]);

  const spo2 = text.match(/\bspo2\D{0,5}(\d{1,3})/i);
  if (spo2?.[1]) result.spo2 = Number.parseInt(spo2[1], 10);

  const systolic = text.match(/\b(?:bp|systolic)\D{0,5}(\d{2,3})/i);
  if (systolic?.[1]) result.systolicBP = Number.parseInt(systolic[1], 10);

  const consciousnessMap: Array<[RegExp, ConsciousnessLevel]> = [
    [/\bunresponsive\b/i, "UNRESPONSIVE"],
    [/\bresponds?\s*to\s*pain\b/i, "PAIN"],
    [/\bverbal\b/i, "VERBAL"],
    [/\balert\b/i, "ALERT"],
  ];
  for (const [pattern, level] of consciousnessMap) {
    if (pattern.test(text)) {
      result.consciousness = level;
      break;
    }
  }

  if (/\bnot?\s*ambulatory\b|\bcannot\s*walk\b|\bunable\s*to\s*walk\b/i.test(text)) {
    result.ambulatory = false;
  } else if (/\bambulatory\b|\bwalking\s*wounded\b/i.test(text)) {
    result.ambulatory = true;
  }

  return result;
}

export const extractVitalsTool: MCPToolDefinition<
  { rawText: string },
  Partial<Vitals>
> = {
  name: "extractVitals",
  description:
    "Parses free-text field notes (typed or dictated) into structured patient vitals fields.",
  parameters: {
    type: "object",
    properties: {
      rawText: {
        type: "string",
        description: "Free-text vitals/field notes, e.g. 'RR 32, HR 128, cap refill 3s, unresponsive'.",
      },
    },
    required: ["rawText"],
  },
  handler: ({ rawText }) => extractVitalsFromText(rawText),
};

export const updateTriageBadgeTool: MCPToolDefinition<
  { elementId: string; priority: PatientTriageRecord["priority"] },
  { updated: boolean }
> = {
  name: "updateTriageBadge",
  description:
    "Updates the color and label of an on-screen triage badge element to reflect the current priority.",
  parameters: {
    type: "object",
    properties: {
      elementId: {
        type: "string",
        description: "DOM id of the badge element to update.",
      },
      priority: {
        type: "string",
        description: "Triage priority to render on the badge.",
        enum: ["IMMEDIATE", "DELAYED", "MINIMAL", "EXPECTANT"],
      },
    },
    required: ["elementId", "priority"],
  },
  handler: ({ elementId, priority }) => {
    const el = document.getElementById(elementId);
    if (!el) return { updated: false };
    const labels: Record<PatientTriageRecord["priority"], string> = {
      IMMEDIATE: "IMMEDIATE",
      DELAYED: "DELAYED",
      MINIMAL: "MINIMAL",
      EXPECTANT: "EXPECTANT",
    };
    const colors: Record<PatientTriageRecord["priority"], string> = {
      IMMEDIATE: "#dc2626",
      DELAYED: "#eab308",
      MINIMAL: "#16a34a",
      EXPECTANT: "#1f2937",
    };
    el.textContent = labels[priority];
    el.style.backgroundColor = colors[priority];
    el.dataset.priority = priority;
    return { updated: true };
  },
};

function readOfflineQueue(): PatientTriageRecord[] {
  try {
    const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PatientTriageRecord[];
  } catch {
    return [];
  }
}

function writeOfflineQueue(records: PatientTriageRecord[]): void {
  window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(records));
}

export const cacheOfflineRecordTool: MCPToolDefinition<
  { record: PatientTriageRecord },
  { queueSize: number }
> = {
  name: "cacheOfflineRecord",
  description:
    "Persists a patient triage record to local storage so it survives a lost connection, for later sync to the cloud orchestrator.",
  parameters: {
    type: "object",
    properties: {
      record: {
        type: "object",
        description: "A complete PatientTriageRecord to cache offline.",
      },
    },
    required: ["record"],
  },
  handler: ({ record }) => {
    const queue = readOfflineQueue();
    const withoutExisting = queue.filter((r) => r.id !== record.id);
    writeOfflineQueue([...withoutExisting, { ...record, offlineSynced: false }]);
    return { queueSize: withoutExisting.length + 1 };
  },
};

export function getOfflineQueue(): PatientTriageRecord[] {
  return readOfflineQueue();
}

export function clearSyncedFromOfflineQueue(syncedIds: readonly string[]): void {
  const remaining = readOfflineQueue().filter((r) => !syncedIds.includes(r.id));
  writeOfflineQueue(remaining);
}

export const webMcpTools: MCPToolDefinition[] = [
  extractVitalsTool as MCPToolDefinition,
  updateTriageBadgeTool as MCPToolDefinition,
  cacheOfflineRecordTool as MCPToolDefinition,
];

/**
 * Ambient typing for the real WebMCP browser API, per the current W3C Web
 * Machine Learning Community Group spec (github.com/webmachinelearning/webmcp,
 * index.bs). The entry point lives on `Document`, not `navigator`:
 *
 *   partial interface Document {
 *     readonly attribute ModelContext modelContext;
 *   };
 *   interface ModelContext {
 *     Promise<undefined> registerTool(ModelContextTool tool, optional options);
 *     Promise<sequence<RegisteredTool>> getTools(optional options);
 *     Promise<DOMString> executeTool(RegisteredTool tool, optional object input, optional options);
 *     attribute EventHandler ontoolchange;
 *   };
 *
 * There is no bulk "provideContext" or "unregisterTool" — each tool is
 * registered individually, and unregistering happens by aborting the
 * AbortSignal passed at registration time. Ships as an Origin Trial in
 * Chrome 149+ / Edge 150+, or locally via chrome://flags/#enable-webmcp-testing.
 */
interface ModelContextToolExecuteOptions {
  signal: AbortSignal;
}

interface ModelContextTool {
  name: string;
  title?: string;
  description: string;
  inputSchema?: object;
  execute: (input: Record<string, unknown>, options: ModelContextToolExecuteOptions) => Promise<unknown>;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
}

interface ModelContext {
  registerTool: (
    tool: ModelContextTool,
    options?: { exposedTo?: string[]; signal?: AbortSignal },
  ) => Promise<undefined>;
}

declare global {
  interface Document {
    readonly modelContext?: ModelContext;
  }
}

const READ_ONLY_TOOLS = new Set(["extractVitals"]);

/** True only when this browser actually implements document.modelContext (the real WebMCP API), not just our local dispatch. */
export function isNativeWebMcpSupported(): boolean {
  return typeof document !== "undefined" && document.modelContext !== undefined;
}

/**
 * Publishes this page's tools to `document.modelContext` when the browser
 * implements the real WebMCP API, so an actual browser-level agent can
 * discover and call them — in addition to the demo's own on-device/local
 * code paths, which call the same tool handlers directly regardless of
 * whether the flag/origin-trial is enabled.
 */
export function registerWebMcpTools(): void {
  const modelContext = document.modelContext;
  if (!modelContext) return;
  for (const tool of webMcpTools) {
    void modelContext.registerTool({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.parameters,
      execute: (input) => Promise.resolve(tool.handler(input)),
      annotations: { readOnlyHint: READ_ONLY_TOOLS.has(tool.name) },
    });
  }
}
