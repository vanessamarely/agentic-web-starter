import { z } from "zod";
import { TriagePrioritySchema } from "./triage.js";

export const MedicalResourceTypeSchema = z.enum([
  "BLOOD_O_NEG",
  "IV_FLUIDS",
  "ANTIBIOTICS",
  "SURGICAL_KIT",
  "VENTILATOR",
  "ANALGESICS",
  "SPLINTS",
  "OXYGEN",
]);
export type MedicalResourceType = z.infer<typeof MedicalResourceTypeSchema>;

export const ResourceRequestStatusSchema = z.enum([
  "PENDING",
  "ROUTED",
  "FULFILLED",
  "CANCELLED",
]);
export type ResourceRequestStatus = z.infer<typeof ResourceRequestStatusSchema>;

export const MedicalResourceRequestSchema = z.object({
  id: z.string().uuid(),
  requestedAt: z.string().datetime(),
  resourceType: MedicalResourceTypeSchema,
  quantity: z.number().int().positive(),
  urgency: TriagePrioritySchema,
  requestingFacilityId: z.string().min(1).max(120),
  regionId: z.string().min(1).max(120),
  status: ResourceRequestStatusSchema.default("PENDING"),
  fulfilledByFacilityId: z.string().min(1).max(120).optional(),
  notes: z.string().max(1000).optional(),
});
export type MedicalResourceRequest = z.infer<typeof MedicalResourceRequestSchema>;

export const TraumaLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);
export type TraumaLevel = z.infer<typeof TraumaLevelSchema>;

export const HospitalStatusSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  regionId: z.string().min(1).max(120),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  traumaLevel: TraumaLevelSchema,
  operational: z.boolean(),
  capacityTotalBeds: z.number().int().nonnegative(),
  capacityAvailableBeds: z.number().int().nonnegative(),
  icuAvailableBeds: z.number().int().nonnegative(),
  suppliesOnHand: z.record(MedicalResourceTypeSchema, z.number().int().nonnegative()),
  lastUpdated: z.string().datetime(),
});
export type HospitalStatus = z.infer<typeof HospitalStatusSchema>;
