import { z } from "zod";

/**
 * START (Simple Triage And Rapid Treatment) mass-casualty priority levels.
 * IMMEDIATE = red tag, DELAYED = yellow tag, MINIMAL = green tag, EXPECTANT = black tag.
 */
export const TriagePrioritySchema = z.enum([
  "IMMEDIATE",
  "DELAYED",
  "MINIMAL",
  "EXPECTANT",
]);
export type TriagePriority = z.infer<typeof TriagePrioritySchema>;

export const ConsciousnessLevelSchema = z.enum([
  "ALERT",
  "VERBAL",
  "PAIN",
  "UNRESPONSIVE",
]);
export type ConsciousnessLevel = z.infer<typeof ConsciousnessLevelSchema>;

export const VitalsSchema = z.object({
  respiratoryRate: z.number().int().min(0).max(80),
  pulseRate: z.number().int().min(0).max(260),
  capillaryRefillSeconds: z.number().min(0).max(30),
  consciousness: ConsciousnessLevelSchema,
  ambulatory: z.boolean(),
  systolicBP: z.number().int().min(0).max(300).optional(),
  spo2: z.number().int().min(0).max(100).optional(),
});
export type Vitals = z.infer<typeof VitalsSchema>;

export const PatientTriageRecordSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  patientLabel: z.string().min(1).max(120),
  vitals: VitalsSchema,
  injuries: z.string().max(2000),
  clinicalNotes: z.string().max(4000).default(""),
  priority: TriagePrioritySchema,
  priorityRationale: z.string().max(1000).default(""),
  suggestedByAI: z.boolean().default(false),
  location: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      description: z.string().max(200).optional(),
    })
    .optional(),
  offlineSynced: z.boolean().default(false),
  responderId: z.string().min(1).max(120).optional(),
});
export type PatientTriageRecord = z.infer<typeof PatientTriageRecordSchema>;

export const TriageValidationResultSchema = z.object({
  patientId: z.string().uuid(),
  isConsistent: z.boolean(),
  recommendedPriority: TriagePrioritySchema,
  confidence: z.number().min(0).max(1),
  rationale: z.string().max(1000),
});
export type TriageValidationResult = z.infer<typeof TriageValidationResultSchema>;
