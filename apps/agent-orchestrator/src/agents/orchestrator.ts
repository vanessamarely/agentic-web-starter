import type { MedicalResourceRequest, PatientTriageRecord } from "@agentic-web-starter/shared-types";
import { runTriageValidatorAgent, type TriageValidatorOutcome } from "./triageValidator.js";
import { runHospitalRouterAgent, type HospitalRouterOutcome } from "./hospitalRouter.js";
import { runSupplyChainAgent, type SupplyChainOutcome } from "./supplyChainAgent.js";
import type { AiMode } from "./adkRuntime.js";

export interface OrchestrationRequest {
  patient: PatientTriageRecord;
  regionId: string;
  resourceRequests?: MedicalResourceRequest[];
  mode?: AiMode;
}

export interface OrchestrationResult {
  patientId: string;
  mode: AiMode;
  triageValidation: TriageValidatorOutcome;
  hospitalRouting: HospitalRouterOutcome;
  supplyChain: SupplyChainOutcome;
  completedAt: string;
}

/**
 * Runs the full multi-agent pipeline for one incoming patient: validate the
 * reported triage priority, route to the best-fit hospital, and (if any
 * accompany the patient) resolve medical resource requests against regional
 * supply. Agents run triage validation and supply matching independently of
 * hospital routing since none of their tool calls depend on each other's
 * output in this pipeline.
 */
export async function runOrchestration(
  request: OrchestrationRequest,
): Promise<OrchestrationResult> {
  const { patient, regionId, resourceRequests = [], mode = "ai-studio" } = request;

  const [triageValidation, hospitalRouting, supplyChain] = await Promise.all([
    runTriageValidatorAgent(patient, mode),
    runHospitalRouterAgent(patient, regionId, mode),
    runSupplyChainAgent(resourceRequests, mode),
  ]);

  return {
    patientId: patient.id,
    mode,
    triageValidation,
    hospitalRouting,
    supplyChain,
    completedAt: new Date().toISOString(),
  };
}
