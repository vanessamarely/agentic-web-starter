import type { MedicalResourceRequest } from "@agentic-web-starter/shared-types";
import { createDualModeAdkAgent, runAdkAgentTurn, type AiMode } from "./adkRuntime.js";
import { supplyChainTools } from "../mcp/tools.js";
import { getHospitalById } from "../data/hospitals.js";

const getSupplyChainAgent = createDualModeAdkAgent({
  name: "supply_chain_agent",
  description: "Matches pending medical resource requests to regional hospital stock and commits allocations.",
  instruction: `You are the Supply Chain agent for a disaster-response medical orchestrator. For each pending medical resource request, call queryEmergencySupply to find hospitals in the request's region that can fulfil the requested quantity, then call allocateSupply exactly once against the best match (prefer the hospital with the most available stock, breaking ties by whichever you queried first) to commit the allocation, always passing the original request's id as requestId. If no hospital can fulfil a request, do not call allocateSupply for it. After handling every request, respond in Spanish with one short line per request in the form "REQUEST <id>: <ALLOCATED to hospital <hospitalId>|UNFULFILLED> - <one short reason in Spanish>".`,
  tools: supplyChainTools,
});

export interface SupplyChainOutcome {
  summary: string;
  allocations: Array<{
    requestId: string;
    resourceType: string;
    quantity: number;
    hospitalId: string | null;
    hospitalName: string | null;
  }>;
  unfulfilled: Array<{ requestId: string; resourceType: string; quantity: number }>;
  toolCalls: Array<{ name: string; args: Record<string, unknown>; result: unknown }>;
}

export async function runSupplyChainAgent(
  requests: readonly MedicalResourceRequest[],
  mode: AiMode = "ai-studio",
): Promise<SupplyChainOutcome> {
  if (requests.length === 0) {
    return { summary: "No pending resource requests.", allocations: [], unfulfilled: [], toolCalls: [] };
  }

  const userPrompt = requests
    .map(
      (r) =>
        `Request ${r.id}: ${r.quantity}x ${r.resourceType} needed at facility ${r.requestingFacilityId} in region ${r.regionId}, urgency ${r.urgency}.`,
    )
    .join("\n");

  const result = await runAdkAgentTurn(getSupplyChainAgent(mode), userPrompt);

  const allocationCalls = result.toolCallsExecuted.filter((call) => call.name === "allocateSupply");
  const allocations = allocationCalls.map((call) => {
    const hospitalId = (call.args.hospitalId as string | undefined) ?? null;
    return {
      requestId: (call.args.requestId as string | undefined) ?? "",
      resourceType: (call.args.resourceType as string | undefined) ?? "",
      quantity: (call.args.quantity as number | undefined) ?? 0,
      hospitalId,
      hospitalName: hospitalId ? (getHospitalById(hospitalId)?.name ?? hospitalId) : null,
    };
  });

  const fulfilledRequestIds = new Set(allocations.map((a) => a.requestId));
  const unfulfilled = requests
    .filter((r) => !fulfilledRequestIds.has(r.id))
    .map((r) => ({ requestId: r.id, resourceType: r.resourceType, quantity: r.quantity }));

  return {
    summary: result.finalText,
    allocations,
    unfulfilled,
    toolCalls: result.toolCallsExecuted,
  };
}
