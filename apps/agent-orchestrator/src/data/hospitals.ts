import type { HospitalStatus } from "@agentic-web-starter/shared-types";

/**
 * In-memory regional hospital registry seeded for a simulated earthquake
 * response in the Eje Cafetero region of Colombia. In production this would
 * be backed by a real facility-status feed; the shape and mutation API are
 * what matter for the orchestrator's routing and supply-matching agents.
 */
const hospitals: HospitalStatus[] = [
  {
    id: "hosp-armenia-san-juan",
    name: "Hospital San Juan de Dios - Armenia",
    regionId: "eje-cafetero",
    location: { lat: 4.5339, lng: -75.6811 },
    traumaLevel: 1,
    operational: true,
    capacityTotalBeds: 220,
    capacityAvailableBeds: 18,
    icuAvailableBeds: 2,
    suppliesOnHand: {
      BLOOD_O_NEG: 12,
      IV_FLUIDS: 340,
      ANTIBIOTICS: 500,
      SURGICAL_KIT: 14,
      VENTILATOR: 3,
      ANALGESICS: 800,
      SPLINTS: 60,
      OXYGEN: 40,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "hosp-pereira-san-jorge",
    name: "Hospital Universitario San Jorge - Pereira",
    regionId: "eje-cafetero",
    location: { lat: 4.8087, lng: -75.6906 },
    traumaLevel: 1,
    operational: true,
    capacityTotalBeds: 300,
    capacityAvailableBeds: 42,
    icuAvailableBeds: 6,
    suppliesOnHand: {
      BLOOD_O_NEG: 30,
      IV_FLUIDS: 600,
      ANTIBIOTICS: 900,
      SURGICAL_KIT: 25,
      VENTILATOR: 8,
      ANALGESICS: 1200,
      SPLINTS: 90,
      OXYGEN: 70,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "hosp-manizales-santa-sofia",
    name: "Clínica Santa Sofía - Manizales",
    regionId: "eje-cafetero",
    location: { lat: 5.0689, lng: -75.5174 },
    traumaLevel: 2,
    operational: true,
    capacityTotalBeds: 150,
    capacityAvailableBeds: 9,
    icuAvailableBeds: 1,
    suppliesOnHand: {
      BLOOD_O_NEG: 4,
      IV_FLUIDS: 150,
      ANTIBIOTICS: 200,
      SURGICAL_KIT: 6,
      VENTILATOR: 1,
      ANALGESICS: 300,
      SPLINTS: 20,
      OXYGEN: 15,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "hosp-calarca-field",
    name: "Field Hospital - Calarcá (mobile trauma unit)",
    regionId: "eje-cafetero",
    location: { lat: 4.5301, lng: -75.6438 },
    traumaLevel: 3,
    operational: true,
    capacityTotalBeds: 40,
    capacityAvailableBeds: 22,
    icuAvailableBeds: 0,
    suppliesOnHand: {
      BLOOD_O_NEG: 2,
      IV_FLUIDS: 80,
      ANTIBIOTICS: 60,
      SURGICAL_KIT: 3,
      VENTILATOR: 0,
      ANALGESICS: 150,
      SPLINTS: 45,
      OXYGEN: 10,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "hosp-ibague-federico-lleras",
    name: "Hospital Federico Lleras Acosta - Ibagué",
    regionId: "tolima",
    location: { lat: 4.4389, lng: -75.2322 },
    traumaLevel: 2,
    operational: false,
    capacityTotalBeds: 180,
    capacityAvailableBeds: 0,
    icuAvailableBeds: 0,
    suppliesOnHand: {
      BLOOD_O_NEG: 0,
      IV_FLUIDS: 20,
      ANTIBIOTICS: 40,
      SURGICAL_KIT: 0,
      VENTILATOR: 0,
      ANALGESICS: 50,
      SPLINTS: 5,
      OXYGEN: 0,
    },
    lastUpdated: new Date().toISOString(),
  },
];

export function listHospitals(): HospitalStatus[] {
  return hospitals;
}

export function getHospitalById(id: string): HospitalStatus | undefined {
  return hospitals.find((h) => h.id === id);
}

export function listHospitalsByRegion(regionId: string): HospitalStatus[] {
  return hospitals.filter((h) => h.regionId === regionId);
}

export function decrementSupply(
  hospitalId: string,
  resourceType: keyof HospitalStatus["suppliesOnHand"],
  quantity: number,
): HospitalStatus | undefined {
  const hospital = getHospitalById(hospitalId);
  if (!hospital) return undefined;
  const current = hospital.suppliesOnHand[resourceType] ?? 0;
  hospital.suppliesOnHand[resourceType] = Math.max(0, current - quantity);
  hospital.lastUpdated = new Date().toISOString();
  return hospital;
}
