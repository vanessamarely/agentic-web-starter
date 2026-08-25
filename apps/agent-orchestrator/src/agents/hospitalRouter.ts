import type { HospitalStatus, PatientTriageRecord } from "@agentic-web-starter/shared-types";
import { createAdkAgent, runAdkAgentTurn } from "./adkRuntime.js";
import { hospitalRouterTools } from "../mcp/tools.js";

const hospitalRouterAgent = createAdkAgent({
  name: "hospital_router",
  description: "Routes a patient to the best-fit operational hospital with available capacity.",
  instruction: `You are the Hospital Router agent for a disaster-response medical orchestrator. Given a patient's triage priority and a region, call the checkHospitalCapacity tool to see which operational hospitals currently have available beds. IMMEDIATE patients must be routed to the highest-capability trauma center (trauma level 1) with available beds, preferring ICU availability. DELAYED and MINIMAL patients should be routed to preserve trauma level 1 capacity for more severe cases when a lower-level facility can safely handle them. EXPECTANT patients should be routed to the nearest facility that can still provide comfort care. After calling the tool, respond with exactly one line in the form "HOSPITAL_ID: <id> REASON: <one short sentence in Spanish>". If no hospital has capacity, respond with "HOSPITAL_ID: none REASON: <why, in Spanish>". Keep the literal labels HOSPITAL_ID and REASON in English exactly as shown — only the reason sentence itself should be in Spanish.`,
  tools: hospitalRouterTools,
});

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

  const result = await runAdkAgentTurn(hospitalRouterAgent, userPrompt);

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
