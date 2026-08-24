import type { HospitalStatus, PatientTriageRecord } from "@agentic-web-starter/shared-types";
import { runAgentTurn } from "./agentRuntime.js";
import { hospitalRouterTools } from "../mcp/tools.js";

const SYSTEM_INSTRUCTION = `You are the Hospital Router agent for a disaster-response medical orchestrator. Given a patient's triage priority and a region, call the checkHospitalCapacity tool to see which operational hospitals currently have available beds. IMMEDIATE patients must be routed to the highest-capability trauma center (trauma level 1) with available beds, preferring ICU availability. DELAYED and MINIMAL patients should be routed to preserve trauma level 1 capacity for more severe cases when a lower-level facility can safely handle them. EXPECTANT patients should be routed to the nearest facility that can still provide comfort care. After calling the tool, respond with exactly one line in the form "HOSPITAL_ID: <id> REASON: <one short sentence>". If no hospital has capacity, respond with "HOSPITAL_ID: none REASON: <why>".`;

export interface HospitalRouterOutcome {
  hospitalId: string | null;
  reason: string;
  consideredHospitals: HospitalStatus[];
  toolCalls: Array<{ name: string; args: Record<string, unknown>; result: unknown }>;
}

export async function runHospitalRouterAgent(
  patient: PatientTriageRecord,
  regionId: string,
): Promise<HospitalRouterOutcome> {
  const userPrompt = `Patient "${patient.patientLabel}" has triage priority ${patient.priority}. Region: ${regionId}. Find the best hospital to route this patient to.`;

  const result = await runAgentTurn({
    systemInstruction: SYSTEM_INSTRUCTION,
    userPrompt,
    tools: hospitalRouterTools,
    maxToolRoundTrips: 2,
  });

  const capacityCall = result.toolCallsExecuted.find(
    (call) => call.name === "checkHospitalCapacity",
  )?.result as { hospitals: HospitalStatus[] } | undefined;

  const match = result.finalText.match(/HOSPITAL_ID:\s*([\w-]+)\s*REASON:\s*(.+)/i);

  return {
    hospitalId: match && match[1] !== "none" ? (match[1] ?? null) : null,
    reason: match?.[2]?.trim() ?? result.finalText,
    consideredHospitals: capacityCall?.hospitals ?? [],
    toolCalls: result.toolCallsExecuted,
  };
}
