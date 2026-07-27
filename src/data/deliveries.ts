export type Zone = "A" | "B" | "C";
export type Status = "Disponible" | "En rupture";

export interface Delivery {
  ref: string;
  from: string;
  to: string;
  distanceKm: number;
  priceFcfa: number;
  pickupTime: string;
  zone: Zone;
  status: Status;
  fromCoords: [number, number];
  toCoords: [number, number];
}

export const deliveries: Delivery[] = [
  { ref: "#TF-D101", from: "Colobane", to: "Plateau", distanceKm: 3.8, priceFcfa: 4800, pickupTime: "14:10", zone: "A", status: "Disponible", fromCoords: [14.708, -17.443], toCoords: [14.665, -17.429] },
  { ref: "#TF-D102", from: "Sandaga", to: "Fann", distanceKm: 4.5, priceFcfa: 5500, pickupTime: "14:25", zone: "A", status: "Disponible", fromCoords: [14.668, -17.433], toCoords: [14.685, -17.464] },
  { ref: "#TF-D103", from: "Médina", to: "Ouakam", distanceKm: 2.9, priceFcfa: 3900, pickupTime: "14:40", zone: "B", status: "Disponible", fromCoords: [14.682, -17.447], toCoords: [14.721, -17.487] },
  { ref: "#TF-D104", from: "Marché HLM", to: "Pikine", distanceKm: 6.1, priceFcfa: 6000, pickupTime: "15:00", zone: "C", status: "En rupture", fromCoords: [14.704, -17.437], toCoords: [14.761, -17.390] },
  { ref: "#TF-D105", from: "Ouest Foire", to: "Almadies", distanceKm: 3.2, priceFcfa: 4500, pickupTime: "15:15", zone: "B", status: "Disponible", fromCoords: [14.735, -17.485], toCoords: [14.743, -17.518] },
  { ref: "#TF-D106", from: "Port de Dakar", to: "Point E", distanceKm: 2.5, priceFcfa: 3500, pickupTime: "15:30", zone: "A", status: "Disponible", fromCoords: [14.668, -17.428], toCoords: [14.703, -17.465] },
];

export const zoneLabels: Record<Zone | "ALL", string> = {
  ALL: "Tous",
  A: "Zone A (Centre)",
  B: "Zone B (VDN/Almadies)",
  C: "Zone C (Banlieue)",
};

export const formatFcfa = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";