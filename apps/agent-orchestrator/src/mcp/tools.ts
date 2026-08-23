import type {
  ConsciousnessLevel,
  HospitalStatus,
  MCPToolDefinition,
  MedicalResourceType,
  TriagePriority,
} from "@agentic-web-starter/shared-types";
import {
  decrementSupply,
  listHospitalsByRegion,
} from "../data/hospitals.js";

const TRIAGE_PRIORITIES: readonly TriagePriority[] = [
  "IMMEDIATE",
  "DELAYED",
  "MINIMAL",
  "EXPECTANT",
];

const CONSCIOUSNESS_LEVELS: readonly ConsciousnessLevel[] = [
  "ALERT",
  "VERBAL",
  "PAIN",
  "UNRESPONSIVE",
];

const RESOURCE_TYPES: readonly MedicalResourceType[] = [
  "BLOOD_O_NEG",
  "IV_FLUIDS",
  "ANTIBIOTICS",
  "SURGICAL_KIT",
  "VENTILATOR",
  "ANALGESICS",
  "SPLINTS",
  "OXYGEN",
];

function heuristicPriority(args: {
  respiratoryRate: number;
  pulseRate: number;
  capillaryRefillSeconds: number;
  consciousness: ConsciousnessLevel;
  ambulatory: boolean;
}): TriagePriority {
  if (args.consciousness === "UNRESPONSIVE" && args.respiratoryRate === 0) return "EXPECTANT";
  if (args.respiratoryRate > 30 || args.respiratoryRate === 0) return "IMMEDIATE";
  if (args.capillaryRefillSeconds > 2 || args.pulseRate > 120) return "IMMEDIATE";
  if (args.consciousness === "PAIN" || args.consciousness === "UNRESPONSIVE") return "IMMEDIATE";
  if (!args.ambulatory) return "DELAYED";
  return "MINIMAL";
}

export interface ValidateClinicalUrgencyArgs {
  respiratoryRate: number;
  pulseRate: number;
  capillaryRefillSeconds: number;
  consciousness: ConsciousnessLevel;
  ambulatory: boolean;
  reportedPriority: TriagePriority;
}

export interface ValidateClinicalUrgencyResult {
  isConsistent: boolean;
  recommendedPriority: TriagePriority;
  confidence: number;
  rationale: string;
}

export const validateClinicalUrgencyTool: MCPToolDefinition<
  Record<string, unknown> & ValidateClinicalUrgencyArgs,
  ValidateClinicalUrgencyResult
> = {
  name: "validateClinicalUrgency",
  description:
    "Cross-checks a field responder's reported START triage priority against raw vitals using the authoritative server-side decision tree, and flags disagreement.",
  parameters: {
    type: "object",
    properties: {
      respiratoryRate: { type: "integer", description: "Breaths per minute." },
      pulseRate: { type: "integer", description: "Beats per minute." },
      capillaryRefillSeconds: { type: "number", description: "Capillary refill time in seconds." },
      consciousness: {
        type: "string",
        description: "AVPU consciousness level.",
        enum: CONSCIOUSNESS_LEVELS,
      },
      ambulatory: { type: "boolean", description: "Whether the patient can walk unassisted." },
      reportedPriority: {
        type: "string",
        description: "The triage priority reported by the field responder.",
        enum: TRIAGE_PRIORITIES,
      },
    },
    required: [
      "respiratoryRate",
      "pulseRate",
      "capillaryRefillSeconds",
      "consciousness",
      "ambulatory",
      "reportedPriority",
    ],
  },
  handler: (args) => {
    const recommended = heuristicPriority(args);
    const isConsistent = recommended === args.reportedPriority;
    return {
      isConsistent,
      recommendedPriority: recommended,
      confidence: isConsistent ? 0.95 : 0.6,
      rationale: isConsistent
        ? "Reported priority matches the START decision tree for these vitals."
        : `Vitals suggest ${recommended} rather than the reported ${args.reportedPriority}.`,
    };
  },
};

export interface QueryEmergencySupplyArgs {
  resourceType: MedicalResourceType;
  quantity: number;
  regionId: string;
}

export interface EmergencySupplyMatch {
  hospitalId: string;
  hospitalName: string;
  availableQuantity: number;
  operational: boolean;
}

export const queryEmergencySupplyTool: MCPToolDefinition<
  Record<string, unknown> & QueryEmergencySupplyArgs,
  { matches: EmergencySupplyMatch[] }
> = {
  name: "queryEmergencySupply",
  description:
    "Searches regional hospitals for a medical resource type and returns which facilities can currently fulfil the requested quantity.",
  parameters: {
    type: "object",
    properties: {
      resourceType: {
        type: "string",
        description: "The medical resource being requested.",
        enum: RESOURCE_TYPES,
      },
      quantity: { type: "integer", description: "Quantity required." },
      regionId: { type: "string", description: "Region identifier to search within." },
    },
    required: ["resourceType", "quantity", "regionId"],
  },
  handler: ({ resourceType, quantity, regionId }) => {
    const hospitals = listHospitalsByRegion(regionId);
    const matches: EmergencySupplyMatch[] = hospitals
      .map((h) => ({
        hospitalId: h.id,
        hospitalName: h.name,
        availableQuantity: h.suppliesOnHand[resourceType] ?? 0,
        operational: h.operational,
      }))
      .filter((m) => m.operational && m.availableQuantity >= quantity)
      .sort((a, b) => b.availableQuantity - a.availableQuantity);
    return { matches };
  },
};

export interface CheckHospitalCapacityArgs {
  regionId: string;
  minTraumaLevel?: number;
}

export const checkHospitalCapacityTool: MCPToolDefinition<
  Record<string, unknown> & CheckHospitalCapacityArgs,
  { hospitals: HospitalStatus[] }
> = {
  name: "checkHospitalCapacity",
  description:
    "Lists operational hospitals in a region with available beds, optionally filtered by minimum trauma center level (1 = highest capability).",
  parameters: {
    type: "object",
    properties: {
      regionId: { type: "string", description: "Region identifier to search within." },
      minTraumaLevel: {
        type: "integer",
        description: "Only include hospitals with this trauma level or better (numerically lower or equal).",
      },
    },
    required: ["regionId"],
  },
  handler: ({ regionId, minTraumaLevel }) => {
    const hospitals = listHospitalsByRegion(regionId)
      .filter((h) => h.operational && h.capacityAvailableBeds > 0)
      .filter((h) => (minTraumaLevel ? h.traumaLevel <= minTraumaLevel : true))
      .sort((a, b) => b.capacityAvailableBeds - a.capacityAvailableBeds);
    return { hospitals };
  },
};

export interface AllocateSupplyArgs {
  requestId: string;
  hospitalId: string;
  resourceType: MedicalResourceType;
  quantity: number;
}

export const allocateSupplyTool: MCPToolDefinition<
  Record<string, unknown> & AllocateSupplyArgs,
  { hospital: HospitalStatus | null }
> = {
  name: "allocateSupply",
  description:
    "Commits an allocation of a medical resource from a specific hospital's on-hand stock, decrementing its inventory.",
  parameters: {
    type: "object",
    properties: {
      requestId: { type: "string", description: "Identifier of the resource request being fulfilled, echoed back unchanged." },
      hospitalId: { type: "string", description: "Hospital identifier to allocate from." },
      resourceType: {
        type: "string",
        description: "The medical resource to allocate.",
        enum: RESOURCE_TYPES,
      },
      quantity: { type: "integer", description: "Quantity to allocate." },
    },
    required: ["requestId", "hospitalId", "resourceType", "quantity"],
  },
  handler: ({ hospitalId, resourceType, quantity }) => {
    const hospital = decrementSupply(hospitalId, resourceType, quantity) ?? null;
    return { hospital };
  },
};

export const triageValidatorTools: MCPToolDefinition[] = [
  validateClinicalUrgencyTool as MCPToolDefinition,
];

export const supplyChainTools: MCPToolDefinition[] = [
  queryEmergencySupplyTool as MCPToolDefinition,
  allocateSupplyTool as MCPToolDefinition,
];

export const hospitalRouterTools: MCPToolDefinition[] = [
  checkHospitalCapacityTool as MCPToolDefinition,
];

export const allOrchestratorTools: MCPToolDefinition[] = [
  ...triageValidatorTools,
  ...supplyChainTools,
  ...hospitalRouterTools,
];
