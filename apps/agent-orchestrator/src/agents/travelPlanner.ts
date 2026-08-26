import type { TravelPlan, TravelRequest } from "@agentic-web-starter/shared-types";
import { createDualModeAdkAgent, runAdkAgentTurn, type AiMode } from "./adkRuntime.js";

/**
 * Travel planner demo: three independent specialist ADK agents (flights,
 * hotels, activities) run concurrently, then a fourth agent combines their
 * output into a single day-by-day itinerary. None of these agents need
 * tools — the demo shows real ADK LlmAgent orchestration (parallel research
 * agents feeding a sequential synthesis step), not function calling.
 */

const getFlightAgent = createDualModeAdkAgent({
  name: "flight_agent",
  description: "Recommends flight options for a trip.",
  instruction: `You are a flight-booking specialist. Given a trip's origin, destination and dates, suggest 2-3 realistic flight options (airline style, approximate price range, duration) in Spanish. Be concise: at most 4 short lines. Never claim to have searched real inventory — frame it as a recommendation.`,
  tools: [],
});

const getHotelAgent = createDualModeAdkAgent({
  name: "hotel_agent",
  description: "Recommends lodging options for a trip.",
  instruction: `You are a lodging specialist. Given a trip's destination, dates, number of travelers and budget, suggest 2-3 realistic lodging options (neighborhood, style, approximate nightly price) in Spanish. Be concise: at most 4 short lines. Never claim to have searched real inventory — frame it as a recommendation.`,
  tools: [],
});

const getActivityAgent = createDualModeAdkAgent({
  name: "activity_agent",
  description: "Recommends activities for a trip based on traveler interests.",
  instruction: `You are a local-activities specialist. Given a destination and the travelers' stated interests, suggest 3-4 concrete activities or excursions in Spanish. Be concise: at most 4 short lines. Tailor suggestions to the stated interests when given.`,
  tools: [],
});

const getItineraryAgent = createDualModeAdkAgent({
  name: "itinerary_agent",
  description: "Synthesizes flight, hotel and activity recommendations into one day-by-day itinerary.",
  instruction: `You are the itinerary synthesis agent. You receive a flight recommendation, a hotel recommendation and a list of activities for a trip, plus the trip's dates. Combine them into one concise day-by-day itinerary in Spanish (one short line per day), referencing the recommended flight and hotel only at the start/end. Do not repeat the raw inputs verbatim — synthesize them.`,
  tools: [],
});

export interface TravelPlanResult {
  plan: TravelPlan;
  mode: AiMode;
  agentTrace: Array<{ agent: string; output: string }>;
}

function tripSummary(request: TravelRequest): string {
  return `Origin: ${request.origin}. Destination: ${request.destination}. Dates: ${request.startDate} to ${request.endDate}. Travelers: ${request.travelers}. Budget: $${request.budgetUsd} USD total. Interests: ${request.interests || "none specified"}.`;
}

export async function runTravelPlanner(
  request: TravelRequest,
  mode: AiMode = "ai-studio",
): Promise<TravelPlanResult> {
  const summary = tripSummary(request);

  const [flightResult, hotelResult, activityResult] = await Promise.all([
    runAdkAgentTurn(getFlightAgent(mode), summary),
    runAdkAgentTurn(getHotelAgent(mode), summary),
    runAdkAgentTurn(getActivityAgent(mode), summary),
  ]);

  const itineraryPrompt = `${summary}\n\nFlight recommendation:\n${flightResult.finalText}\n\nHotel recommendation:\n${hotelResult.finalText}\n\nActivities:\n${activityResult.finalText}`;
  const itineraryResult = await runAdkAgentTurn(getItineraryAgent(mode), itineraryPrompt);

  return {
    mode,
    plan: {
      flights: flightResult.finalText,
      hotels: hotelResult.finalText,
      activities: activityResult.finalText,
      itinerary: itineraryResult.finalText,
    },
    agentTrace: [
      { agent: "flight_agent", output: flightResult.finalText },
      { agent: "hotel_agent", output: hotelResult.finalText },
      { agent: "activity_agent", output: activityResult.finalText },
      { agent: "itinerary_agent", output: itineraryResult.finalText },
    ],
  };
}
