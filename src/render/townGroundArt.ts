import { BUILDINGS } from '../content/buildings';
import { createRandom, type Random } from '../kernel/random';
import { createPixelCanvas, type PixelCanvas } from './pixelCanvas';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './pixelStage';
import { PLAZA_CENTER, PLAZA_RADIUS, TOWN_ROADS, type Point, type Road } from './townLayout';

function distanceToSegment(point: Point, start: Point, end: Point): number {
  const lengthSquared = (end.x - start.x) ** 2 + (end.y - start.y) ** 2;
  const progress = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y)) / lengthSquared));
  return Math.hypot(point.x - (start.x + progress * (end.x - start.x)), point.y - (start.y + progress * (end.y - start.y)));
}

function roadCoverage(): Uint8Array {
  const coverage = new Uint8Array(LOGICAL_WIDTH * LOGICAL_HEIGHT);
  for (let y = 0; y < LOGICAL_HEIGHT; y++) {
    for (let x = 0; x < LOGICAL_WIDTH; x++) {
      const point = { x, y };
      const onPlaza = Math.hypot(x - PLAZA_CENTER.x, (y - PLAZA_CENTER.y) * 1.25) < PLAZA_RADIUS;
      const onRoad = TOWN_ROADS.some((road: Road) =>
        road.points.some((start, index) => {
          const end = road.points[index + 1];
          if (!end) return false;
          const wobble = Math.sin((x + y) * 0.09) * 1.2;
          return distanceToSegment(point, start, end) <= road.width / 2 + wobble;
        }),
      );
      coverage[y * LOGICAL_WIDTH + x] = onPlaza || onRoad ? 1 : 0;
    }
  }
  return coverage;
}

function drawGrass(art: PixelCanvas, random: Random): void {
  art.fill('moss', 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  for (let speckle = 0; speckle < 2200; speckle++) {
    const color = random.chance(0.6) ? 'grass' : 'soil';
    art.fill(color, random.nextInt(0, LOGICAL_WIDTH - 1), random.nextInt(0, LOGICAL_HEIGHT - 1), 1, 1);
  }
  for (let flower = 0; flower < 70; flower++) {
    const color = random.pick(['gold', 'blood', 'parchment'] as const);
    art.fill(color, random.nextInt(4, LOGICAL_WIDTH - 5), random.nextInt(4, LOGICAL_HEIGHT - 5), 1, 1);
  }
}

function drawRoads(art: PixelCanvas, coverage: Uint8Array, random: Random): void {
  const isRoad = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < LOGICAL_WIDTH && y < LOGICAL_HEIGHT && coverage[y * LOGICAL_WIDTH + x] === 1;
  for (let y = 0; y < LOGICAL_HEIGHT; y++) {
    for (let x = 0; x < LOGICAL_WIDTH; x++) {
      if (!isRoad(x, y)) continue;
      const isEdge = !isRoad(x - 1, y) || !isRoad(x + 1, y) || !isRoad(x, y - 1) || !isRoad(x, y + 1);
      const rowOffset = (y >> 2) % 2 === 0 ? 0 : 4;
      const isMortar = y % 4 === 0 || (x + rowOffset) % 8 === 0;
      if (isEdge) art.fill('outline', x, y, 1, 1);
      else art.fill(isMortar || random.chance(0.04) ? 'pathDark' : 'pathLight', x, y, 1, 1);
    }
  }
}

function drawTree(art: PixelCanvas, centerX: number, baseY: number): void {
  art.fill('timber', centerX - 2, baseY - 12, 4, 12);
  const canopyRows: Array<[number, number]> = [[-9, 8], [-12, 12], [-15, 14], [-18, 14], [-21, 12], [-24, 8]];
  canopyRows.forEach(([offset, width]) => {
    art.fill('forest', centerX - width / 2, baseY + offset - 4, width, 4);
    art.fill('grass', centerX - width / 2 + 2, baseY + offset - 4, Math.max(2, width / 3), 1);
  });
  art.fill('outline', centerX - 7, baseY - 1, 14, 1);
}

function drawWell(art: PixelCanvas, centerX: number, baseY: number): void {
  art.fill('stoneDark', centerX - 10, baseY - 14, 20, 14);
  art.fill('stone', centerX - 9, baseY - 13, 18, 11);
  art.fill('void', centerX - 6, baseY - 14, 12, 4);
  art.fill('timber', centerX - 11, baseY - 26, 2, 14);
  art.fill('timber', centerX + 9, baseY - 26, 2, 14);
  art.fill('roofRed', centerX - 13, baseY - 30, 26, 5);
  art.fill('roofRedDark', centerX - 13, baseY - 26, 26, 1);
}

function isFreeForTree(x: number, y: number, coverage: Uint8Array): boolean {
  const nearRoad = [-10, 0, 10].some((dx) => [-6, 0, 6].some((dy) => coverage[Math.max(0, Math.min(LOGICAL_HEIGHT - 1, y + dy)) * LOGICAL_WIDTH + Math.max(0, Math.min(LOGICAL_WIDTH - 1, x + dx))] === 1));
  const nearBuilding = BUILDINGS.some((building) => x > building.x - building.width / 2 - 12 && x < building.x + building.width / 2 + 12 && y > building.y - building.height - 8 && y < building.y + 14);
  return !nearRoad && !nearBuilding;
}

function scatterTrees(art: PixelCanvas, coverage: Uint8Array, random: Random): void {
  const trees: Point[] = [];
  for (let attempt = 0; attempt < 400 && trees.length < 16; attempt++) {
    const x = random.nextInt(10, LOGICAL_WIDTH - 10);
    const y = random.nextInt(60, LOGICAL_HEIGHT - 2);
    const crowded = trees.some((tree) => Math.hypot(tree.x - x, tree.y - y) < 26);
    if (!crowded && isFreeForTree(x, y, coverage)) trees.push({ x, y });
  }
  trees.sort((first, second) => first.y - second.y).forEach((tree) => drawTree(art, tree.x, tree.y));
}

export function drawTownGroundArt(): HTMLCanvasElement {
  const art = createPixelCanvas(LOGICAL_WIDTH, LOGICAL_HEIGHT);
  const random = createRandom(11).fork('town-ground');
  const coverage = roadCoverage();
  drawGrass(art, random);
  drawRoads(art, coverage, random);
  scatterTrees(art, coverage, random);
  drawWell(art, PLAZA_CENTER.x, PLAZA_CENTER.y + 8);
  return art.canvas;
}
