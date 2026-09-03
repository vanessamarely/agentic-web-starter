import type { PatientTriageRecord } from "@agentic-web-starter/shared-types";
import { createDualModeAdkAgent, runAdkAgentTurn, type AiMode } from "./adkRuntime.js";
import { triageValidatorTools } from "../mcp/tools.js";

const getTriageValidatorAgent = createDualModeAdkAgent({
  name: "triage_validator",
  description: "Cross-checks a field responder's reported START triage priority against raw vitals.",
  instruction: `You are the Triage Validator agent for a disaster-response medical orchestrator. Your only job is to cross-check a field responder's reported START triage priority against the patient's raw vitals by calling the validateClinicalUrgency tool exactly once with the patient's vitals and reported priority. After receiving the tool result, respond in Spanish with a single concise sentence stating whether the priority is confirmed or should be escalated/downgraded, and why. Never invent vitals; only use the ones provided.`,
  tools: triageValidatorTools,
});

export interface TriageValidatorOutcome {
  summary: string;
  isConsistent: boolean | null;
  recommendedPriority: PatientTriageRecord["priority"] | null;
  toolCalls: Array<{ name: string; args: Record<string, unknown>; result: unknown }>;
}

export async function runTriageValidatorAgent(
  patient: PatientTriageRecord,
  mode: AiMode = "ai-studio",
): Promise<TriageValidatorOutcome> {
  const userPrompt = `Patient "${patient.patientLabel}" vitals: respiratory rate ${patient.vitals.respiratoryRate}/min, pulse ${patient.vitals.pulseRate}/min, capillary refill ${patient.vitals.capillaryRefillSeconds}s, consciousness ${patient.vitals.consciousness}, ambulatory ${patient.vitals.ambulatory}. Reported priority: ${patient.priority}. Injuries: ${patient.injuries || "none noted"}.`;

  const result = await runAdkAgentTurn(getTriageValidatorAgent(mode), userPrompt);

  const validation = result.toolCallsExecuted.find(
    (call) => call.name === "validateClinicalUrgency",
  )?.result as
    | { isConsistent: boolean; recommendedPriority: PatientTriageRecord["priority"] }
    | undefined;

  return {
    summary: result.finalText,
    isConsistent: validation?.isConsistent ?? null,
    recommendedPriority: validation?.recommendedPriority ?? null,
    toolCalls: result.toolCallsExecuted,
  };
}
