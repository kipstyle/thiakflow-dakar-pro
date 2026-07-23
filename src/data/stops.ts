// Points stylisés sur un viewBox 800x500 représentant la presqu'île de Dakar
export interface Stop {
  id: string;
  name: string;
  x: number;
  y: number;
  zone: "A" | "B" | "C";
}

export const stops: Stop[] = [
  { id: "almadies", name: "Almadies", x: 90, y: 180, zone: "B" },
  { id: "ouakam", name: "Ouakam", x: 180, y: 230, zone: "B" },
  { id: "fann", name: "Fann", x: 320, y: 290, zone: "A" },
  { id: "medina", name: "Médina", x: 430, y: 260, zone: "A" },
  { id: "sandaga", name: "Sandaga", x: 540, y: 300, zone: "A" },
  { id: "colobane", name: "Colobane", x: 470, y: 340, zone: "A" },
];

// Contour approximatif de la presqu'île
export const peninsulaPath =
  "M40,200 C60,120 180,80 320,120 C420,150 520,140 640,180 C720,210 760,260 740,320 C700,400 560,430 420,410 C320,395 220,410 140,380 C60,350 20,280 40,200 Z";
