import { z } from "zod";

export const TravelRequestSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  travelers: z.number().int().min(1).max(20),
  budgetUsd: z.number().int().min(0),
  interests: z.string().max(280).optional(),
});

export type TravelRequest = z.infer<typeof TravelRequestSchema>;

export interface TravelPlan {
  flights: string;
  hotels: string;
  activities: string;
  itinerary: string;
}
