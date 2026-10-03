import { BUILDINGS } from '../content/buildings';
import type { Random } from '../kernel/random';
import type { PixelCanvas } from './pixelCanvas';
import { LOGICAL_HEIGHT, TOWN_WIDTH } from '../kernel/stageSize';
import { isOpenGround } from './townPlacement';
import type { Point } from './townLayout';

const DECORATION_MARGIN = 8;
export const POND_CENTER: Point = { x: 30, y: 62 };

function pickOpenPoint(coverage: Uint8Array, random: Random, margin: number, taken: readonly Point[], spacing: number): Point | null {
  for (let attempt = 0; attempt < 60; attempt++) {
    const point = { x: random.nextInt(8, TOWN_WIDTH - 8), y: random.nextInt(44, LOGICAL_HEIGHT - 4) };
    if (isOpenGround(point.x, point.y, coverage, margin) && taken.every((other) => Math.hypot(other.x - point.x, other.y - point.y) >= spacing)) return point;
  }
  return null;
}

export function drawGroundTexture(art: PixelCanvas, random: Random): void {
  drawGrassTufts(art, random);
  drawBuildingShadows(art, BUILDINGS);
}

function drawGrassTufts(art: PixelCanvas, random: Random): void {
  for (let tuft = 0; tuft < 780; tuft++) {
    const x = random.nextInt(2, TOWN_WIDTH - 4);
    const y = random.nextInt(2, LOGICAL_HEIGHT - 3);
    art.fill('grassLight', x, y, 1, 2);
    art.fill('grassLight', x + 2, y + 1, 1, 1);
  }
  for (let patch = 0; patch < 120; patch++) {
    art.fill('mossDark', random.nextInt(0, TOWN_WIDTH - 12), random.nextInt(0, LOGICAL_HEIGHT - 4), random.nextInt(5, 11), 2);
  }
}

function drawFlowerCluster(art: PixelCanvas, center: Point, random: Random): void {
  for (let flower = 0; flower < 7; flower++) {
    const x = center.x + random.nextInt(-5, 5);
    const y = center.y + random.nextInt(-3, 3);
    art.fill('bushLight', x, y + 1, 1, 1);
    art.fill(random.pick(['petalPink', 'petalBlue', 'gold', 'parchment'] as const), x, y, 2, 2);
  }
}

function drawBush(art: PixelCanvas, center: Point): void {
  art.fill('outline', center.x - 5, center.y - 1, 10, 1);
  art.fill('bush', center.x - 5, center.y - 6, 10, 5);
  art.fill('bush', center.x - 3, center.y - 8, 6, 2);
  art.fill('bushLight', center.x - 3, center.y - 7, 3, 2);
  art.fill('bushLight', center.x + 1, center.y - 4, 2, 1);
  art.fill('gold', center.x + 2, center.y - 5, 1, 1);
}

function drawRock(art: PixelCanvas, center: Point): void {
  art.fill('outline', center.x - 3, center.y, 7, 1);
  art.fill('rock', center.x - 3, center.y - 3, 6, 3);
  art.fill('stoneLight', center.x - 2, center.y - 3, 3, 1);
  art.fill('stoneDark', center.x + 1, center.y - 1, 2, 1);
}

function drawHayBale(art: PixelCanvas, center: Point): void {
  art.fill('outline', center.x - 5, center.y - 7, 11, 8);
  art.fill('hay', center.x - 4, center.y - 6, 9, 6);
  art.fill('hayDark', center.x - 4, center.y - 3, 9, 1);
  art.fill('hayDark', center.x - 1, center.y - 6, 1, 6);
}

function drawPond(art: PixelCanvas, center: Point, random: Random): void {
  art.fill('outline', center.x - 17, center.y - 8, 34, 16);
  art.fill('outline', center.x - 14, center.y - 10, 28, 20);
  art.fill('water', center.x - 15, center.y - 8, 30, 16);
  art.fill('water', center.x - 12, center.y - 9, 24, 18);
  for (let glint = 0; glint < 6; glint++) art.fill('waterLight', center.x + random.nextInt(-10, 8), center.y + random.nextInt(-6, 5), 3, 1);
  for (const side of [-1, 1]) {
    art.fill('reed', center.x + side * 14, center.y - 14, 1, 7);
    art.fill('reed', center.x + side * 14 + 2, center.y - 12, 1, 5);
    art.fill('timber', center.x + side * 14, center.y - 16, 1, 3);
  }
}

function drawLampPost(art: PixelCanvas, base: Point): void {
  art.fill('shadowSoft', base.x - 3, base.y, 8, 2);
  art.fill('outline', base.x - 1, base.y - 17, 4, 18);
  art.fill('timber', base.x, base.y - 16, 2, 16);
  art.fill('outline', base.x - 3, base.y - 23, 8, 7);
  art.fill('lamp', base.x - 2, base.y - 22, 6, 5);
  art.fill('plaster', base.x - 1, base.y - 21, 2, 2);
}

function drawBuildingShadows(art: PixelCanvas, buildings: ReadonlyArray<{ x: number; y: number; width: number }>): void {
  for (const building of buildings) art.fill('shadowSoft', building.x - building.width / 2 - 2, building.y - 2, building.width + 10, 5);
}

const LAMP_SPACING = 120;
const LAMP_BASE_Y = 172;

export function drawTownDecorations(art: PixelCanvas, coverage: Uint8Array, random: Random): void {
  const placed: Point[] = [];
  const place = (margin: number, spacing: number, draw: (point: Point) => void): void => {
    const point = pickOpenPoint(coverage, random, margin, placed, spacing);
    if (!point) return;
    placed.push(point);
    draw(point);
  };
  drawPond(art, POND_CENTER, random);
  placed.push(POND_CENTER);
  for (let index = 0; index < 27; index++) place(DECORATION_MARGIN, 18, (point) => drawFlowerCluster(art, point, random));
  for (let index = 0; index < 20; index++) place(DECORATION_MARGIN, 20, (point) => drawBush(art, point));
  for (let index = 0; index < 15; index++) place(DECORATION_MARGIN, 18, (point) => drawRock(art, point));
  for (let index = 0; index < 6; index++) place(DECORATION_MARGIN + 4, 30, (point) => drawHayBale(art, point));
  for (let x = 60; x < TOWN_WIDTH; x += LAMP_SPACING) {
    if (isOpenGround(x, LAMP_BASE_Y, coverage, 3)) drawLampPost(art, { x, y: LAMP_BASE_Y });
  }
}
