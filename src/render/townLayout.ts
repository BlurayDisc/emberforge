export interface Point {
  x: number;
  y: number;
}

export interface Road {
  width: number;
  points: readonly Point[];
}

export const TOWN_ROADS: readonly Road[] = [
  { width: 20, points: [{ x: 240, y: 272 }, { x: 242, y: 232 }, { x: 236, y: 200 }, { x: 240, y: 176 }] },
  { width: 14, points: [{ x: 236, y: 176 }, { x: 186, y: 170 }, { x: 140, y: 158 }, { x: 108, y: 142 }] },
  { width: 14, points: [{ x: 244, y: 176 }, { x: 296, y: 168 }, { x: 340, y: 154 }, { x: 372, y: 142 }] },
  { width: 16, points: [{ x: 240, y: 178 }, { x: 238, y: 150 }, { x: 240, y: 118 }] },
  { width: 14, points: [{ x: 238, y: 224 }, { x: 196, y: 234 }, { x: 150, y: 240 }, { x: 114, y: 244 }] },
  { width: 14, points: [{ x: 246, y: 228 }, { x: 300, y: 232 }, { x: 358, y: 240 }, { x: 408, y: 242 }] },
];

export const PLAZA_CENTER: Point = { x: 240, y: 178 };
export const PLAZA_RADIUS = 30;
