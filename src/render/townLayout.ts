import { BUILDINGS } from '../content/buildings';
import { TOWN_WIDTH } from '../kernel/stageSize';
import type { AnimalKind } from './animalArt';

export interface Point {
  x: number;
  y: number;
}

export interface Road {
  width: number;
  points: readonly Point[];
  // How many guards and villagers walk this road. Roads with neither stay empty.
  guardCount?: number;
  villagerCount?: number;
  animals?: Partial<Record<AnimalKind, number>>;
}

export interface Square {
  center: Point;
  halfWidth: number;
  halfHeight: number;
}

const NORTH_ROW_BASE_LIMIT = 150;
const MAIN_STREET_Y = 154;
const SOUTH_STREET_Y = 259;
const CROSS_LANE_X: readonly number[] = [92, 175, 357, 456];

function streetAcross(baseY: number, wave: number, width: number, extra: Partial<Road>): Road {
  const points: Point[] = [];
  for (let x = -4; x <= TOWN_WIDTH + 4; x += 120) points.push({ x, y: baseY + Math.round(Math.sin(x * 0.011) * wave) });
  return { width, points, ...extra };
}

function streetYAt(road: Road, x: number): number {
  const index = Math.max(0, Math.min(road.points.length - 2, Math.floor((x + 4) / 120)));
  const start = road.points[index] as Point;
  const end = road.points[index + 1] as Point;
  return start.y + ((end.y - start.y) * (x - start.x)) / (end.x - start.x);
}

const MAIN_STREET = streetAcross(MAIN_STREET_Y, 4, 16, { villagerCount: 6, guardCount: 2, animals: { cat: 1, dog: 1 } });
const SOUTH_STREET = streetAcross(SOUTH_STREET_Y, 2, 10, { villagerCount: 3, animals: { cat: 1, hen: 1 } });

// A short lane joins each door to a street. North buildings face the main street. South buildings face the south street.
const DOOR_LANES: readonly Road[] = BUILDINGS.filter((building) => building.style !== 'stall' && building.id !== 'keep').map((building) =>
  building.y < NORTH_ROW_BASE_LIMIT
    ? { width: 10, points: [{ x: building.x, y: streetYAt(MAIN_STREET, building.x) }, { x: building.x, y: building.y + 2 }] }
    : { width: 10, points: [{ x: building.x, y: building.y - 2 }, { x: building.x, y: streetYAt(SOUTH_STREET, building.x) }] },
);

const CROSS_LANES: readonly Road[] = CROSS_LANE_X.map((x) => ({ width: 10, points: [{ x, y: streetYAt(MAIN_STREET, x) }, { x: x + 2, y: streetYAt(SOUTH_STREET, x) }] }));

// The keep road runs from the main street to the keep gate. The south road leaves the town.
const KEEP_ROAD: Road = { width: 16, guardCount: 1, points: [{ x: 270, y: MAIN_STREET_Y }, { x: 271, y: 136 }, { x: 270, y: 130 }] };
const LEAVING_ROAD: Road = { width: 14, points: [{ x: 280, y: MAIN_STREET_Y }, { x: 278, y: 214 }, { x: 282, y: 274 }] };

export const TOWN_ROADS: readonly Road[] = [MAIN_STREET, SOUTH_STREET, KEEP_ROAD, LEAVING_ROAD, ...DOOR_LANES, ...CROSS_LANES];

// Small paved squares: the keep square and a small market square with a well on the south road.
export const TOWN_SQUARES: readonly Square[] = [
  { center: { x: 280, y: 197 }, halfWidth: 20, halfHeight: 12 },
  { center: { x: 270, y: 166 }, halfWidth: 34, halfHeight: 12 },
];

export const WELL_POSITIONS: readonly Point[] = [{ x: 280, y: 198 }];
