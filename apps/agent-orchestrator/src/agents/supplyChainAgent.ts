import type { MedicalResourceRequest } from "@agentic-web-starter/shared-types";
import { runAgentTurn } from "./agentRuntime.js";
import { supplyChainTools } from "../mcp/tools.js";

const SYSTEM_INSTRUCTION = `You are the Supply Chain agent for a disaster-response medical orchestrator. For each pending medical resource request, call queryEmergencySupply to find hospitals in the request's region that can fulfil the requested quantity, then call allocateSupply exactly once against the best match (prefer the hospital with the most available stock, breaking ties by whichever you queried first) to commit the allocation, always passing the original request's id as requestId. If no hospital can fulfil a request, do not call allocateSupply for it. After handling every request, respond with one short line per request in the form "REQUEST <id>: <ALLOCATED to hospital <hospitalId>|UNFULFILLED> - <one short reason>".`;

export interface SupplyChainOutcome {
  summary: string;
  allocations: Array<{ requestId: string; hospitalId: string | null; resourceType: string }>;
}

export async function runSupplyChainAgent(
  requests: readonly MedicalResourceRequest[],
): Promise<SupplyChainOutcome> {
  if (requests.length === 0) {
    return { summary: "No pending resource requests.", allocations: [] };
  }

  const userPrompt = requests
    .map(
      (r) =>
        `Request ${r.id}: ${r.quantity}x ${r.resourceType} needed at facility ${r.requestingFacilityId} in region ${r.regionId}, urgency ${r.urgency}.`,
    )
    .join("\n");

  const result = await runAgentTurn({
    systemInstruction: SYSTEM_INSTRUCTION,
    userPrompt,
    tools: supplyChainTools,
    maxToolRoundTrips: requests.length * 2 + 2,
  });

  const allocationCalls = result.toolCallsExecuted.filter((call) => call.name === "allocateSupply");

  return {
    summary: result.finalText,
    allocations: allocationCalls.map((call) => ({
      requestId: (call.args.requestId as string | undefined) ?? "",
      hospitalId: (call.args.hospitalId as string | undefined) ?? null,
      resourceType: (call.args.resourceType as string | undefined) ?? "",
    })),
  };
}
