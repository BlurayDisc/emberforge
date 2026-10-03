import type { TownDefinition } from '../content/towns';
import { createRandom, type Random } from '../kernel/random';
import { createDrawing, type PixelDrawing } from './pixelDraw';

export const WORLD_MAP_WIDTH = 200;
export const WORLD_MAP_HEIGHT = 125;

const OCEAN = '#2d5b86';
const OCEAN_LIGHT = '#3a6e9c';
const COAST = '#e6d79e';
const ROAD = '#6b4a2a';

const BIOME_COLORS: Readonly<Record<string, string>> = {
  farmland: '#6fa34a',
  barrow: '#7b9168',
  marsh: '#4d7a5c',
  mines: '#8b6b4a',
  mountain: '#8e8e96',
  frozen: '#dde9f1',
  desert: '#d9b560',
  volcano: '#8a3b2b',
  fortress: '#50405f',
  abyss: '#2b2030',
};

// Smooth value noise on a coarse grid. It gives the coast and the biome borders a natural shape.
function createNoise(random: Random, cellSize: number): (x: number, y: number) => number {
  const columns = Math.ceil(WORLD_MAP_WIDTH / cellSize) + 2;
  const rows = Math.ceil(WORLD_MAP_HEIGHT / cellSize) + 2;
  const lattice = Array.from({ length: columns * rows }, () => random.nextFloat());
  const at = (column: number, row: number): number => lattice[row * columns + column] ?? 0;
  return (x, y) => {
    const gridX = x / cellSize;
    const gridY = y / cellSize;
    const column = Math.floor(gridX);
    const row = Math.floor(gridY);
    const blendX = gridX - column;
    const blendY = gridY - row;
    const top = at(column, row) * (1 - blendX) + at(column + 1, row) * blendX;
    const bottom = at(column, row + 1) * (1 - blendX) + at(column + 1, row + 1) * blendX;
    return top * (1 - blendY) + bottom * blendY;
  };
}

interface MapPoint {
  x: number;
  y: number;
}

function townPoint(town: TownDefinition): MapPoint {
  return { x: (town.mapX / 100) * WORLD_MAP_WIDTH, y: (town.mapY / 100) * WORLD_MAP_HEIGHT };
}

function distanceToSegment(point: MapPoint, from: MapPoint, to: MapPoint): number {
  const lengthSquared = (to.x - from.x) ** 2 + (to.y - from.y) ** 2;
  const along = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - from.x) * (to.x - from.x) + (point.y - from.y) * (to.y - from.y)) / lengthSquared));
  return Math.hypot(point.x - (from.x + along * (to.x - from.x)), point.y - (from.y + along * (to.y - from.y)));
}

function drawTree(drawing: PixelDrawing, x: number, y: number, leaf: string): void {
  drawing.fill('#4a3322', x, y + 2, 1, 1);
  drawing.fill(leaf, x - 1, y, 3, 2);
  drawing.fill(leaf, x, y - 1, 1, 1);
}

function drawPeak(drawing: PixelDrawing, x: number, y: number, rock: string, snow: string): void {
  drawing.fill(rock, x - 2, y + 1, 5, 1);
  drawing.fill(rock, x - 1, y, 3, 1);
  drawing.fill(snow, x, y - 1, 1, 1);
  drawing.fill('#3d3d46', x + 1, y + 1, 2, 1);
}

function drawDune(drawing: PixelDrawing, x: number, y: number): void {
  drawing.fill('#b98f3f', x - 1, y, 3, 1);
  drawing.fill('#efd48a', x, y - 1, 1, 1);
}

function drawDecoration(drawing: PixelDrawing, biome: string, x: number, y: number): void {
  if (biome === 'farmland') drawTree(drawing, x, y, '#3f7a35');
  else if (biome === 'barrow') drawing.fill('#a9b19a', x, y, 2, 2);
  else if (biome === 'marsh') drawTree(drawing, x, y, '#2f5a45');
  else if (biome === 'mines' || biome === 'mountain') drawPeak(drawing, x, y, '#6f6f78', '#f4f4f8');
  else if (biome === 'frozen') drawPeak(drawing, x, y, '#a9c4d8', '#ffffff');
  else if (biome === 'desert') drawDune(drawing, x, y);
  else if (biome === 'volcano') drawPeak(drawing, x, y, '#4a2a22', '#ff9a3c');
  else if (biome === 'fortress') drawing.fill('#2c2238', x, y - 1, 2, 3);
  else drawing.fill('#6a1f2a', x, y, 2, 1);
}

// The world is drawn from the town list: land grows around each town and along the road between
// them, and every land pixel takes the biome of its nearest town. The map seed is fixed, so the
// map is the same on every start.
export function drawWorldMap(towns: readonly TownDefinition[]): HTMLCanvasElement {
  const drawing = createDrawing(WORLD_MAP_WIDTH, WORLD_MAP_HEIGHT);
  const random = createRandom(2024).fork('world-map');
  const coastNoise = createNoise(random.fork('coast'), 14);
  const detailNoise = createNoise(random.fork('detail'), 5);
  const warpNoise = createNoise(random.fork('warp'), 22);
  const points = towns.map(townPoint);

  const isLand = (x: number, y: number): boolean => {
    const point = { x, y };
    const nearTown = points.some((town) => Math.hypot(town.x - x, town.y - y) < 17 + coastNoise(x, y) * 14);
    if (nearTown) return true;
    return points.some((town, index) => {
      const next = points[index + 1];
      return next !== undefined && distanceToSegment(point, town, next) < 7 + coastNoise(x + 40, y) * 8;
    });
  };

  const land = Array.from({ length: WORLD_MAP_HEIGHT }, (_, y) => Array.from({ length: WORLD_MAP_WIDTH }, (_, x) => isLand(x, y)));
  const isLandAt = (x: number, y: number): boolean => land[y]?.[x] === true;

  for (let y = 0; y < WORLD_MAP_HEIGHT; y++) {
    for (let x = 0; x < WORLD_MAP_WIDTH; x++) {
      if (!isLandAt(x, y)) {
        drawing.fill((x + y) % 7 === 0 && detailNoise(x, y) > 0.6 ? OCEAN_LIGHT : OCEAN, x, y, 1, 1);
        continue;
      }
      const isCoast = !isLandAt(x - 1, y) || !isLandAt(x + 1, y) || !isLandAt(x, y - 1) || !isLandAt(x, y + 1);
      if (isCoast) {
        drawing.fill(COAST, x, y, 1, 1);
        continue;
      }
      const warpedX = x + (warpNoise(x, y) - 0.5) * 18;
      const warpedY = y + (warpNoise(x + 70, y) - 0.5) * 18;
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      points.forEach((town, index) => {
        const distance = Math.hypot(town.x - warpedX, town.y - warpedY);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      const base = BIOME_COLORS[towns[nearestIndex]?.biome ?? 'farmland'] ?? '#6fa34a';
      const shade = detailNoise(x, y);
      drawing.fill(base, x, y, 1, 1);
      if (shade > 0.68) drawing.fill('rgba(255, 255, 255, 0.10)', x, y, 1, 1);
      else if (shade < 0.28) drawing.fill('rgba(0, 0, 0, 0.12)', x, y, 1, 1);
    }
  }

  // Roads join the towns in level order.
  for (let index = 0; index + 1 < points.length; index++) {
    const from = points[index];
    const to = points[index + 1];
    if (!from || !to) continue;
    const steps = Math.ceil(Math.hypot(to.x - from.x, to.y - from.y));
    for (let step = 0; step < steps; step += 2) {
      const fraction = step / steps;
      const wobble = Math.sin(fraction * Math.PI * 3 + index) * 2;
      drawing.fill(ROAD, Math.round(from.x + (to.x - from.x) * fraction + wobble), Math.round(from.y + (to.y - from.y) * fraction), 1, 1);
    }
  }

  const decorationRandom = random.fork('decorations');
  for (let attempt = 0; attempt < 520; attempt++) {
    const x = decorationRandom.nextInt(3, WORLD_MAP_WIDTH - 4);
    const y = decorationRandom.nextInt(3, WORLD_MAP_HEIGHT - 4);
    const isInland = [-3, 3].every((offset) => isLandAt(x + offset, y) && isLandAt(x, y + offset));
    const nearTown = points.some((town) => Math.hypot(town.x - x, town.y - y) < 8);
    if (!isInland || nearTown) continue;
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    points.forEach((town, index) => {
      const distance = Math.hypot(town.x - x, town.y - y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    drawDecoration(drawing, towns[nearestIndex]?.biome ?? 'farmland', x, y);
  }
  return drawing.canvas;
}
