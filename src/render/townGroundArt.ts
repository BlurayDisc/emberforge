import { LOGICAL_HEIGHT, TOWN_WIDTH } from '../kernel/stageSize';
import { createRandom, type Random } from '../kernel/random';
import { createPixelCanvas, type PixelCanvas } from './pixelCanvas';
import { POND_CENTER, drawGroundTexture, drawTownDecorations } from './townDecorationArt';
import { isOpenGround } from './townPlacement';
import { WELL_POSITIONS, type Point } from './townLayout';
import { roadCoverage } from './townRoadCoverage';

const TREE_MARGIN = 10;

function drawGrass(art: PixelCanvas, random: Random): void {
  art.fill('moss', 0, 0, TOWN_WIDTH, LOGICAL_HEIGHT);
  for (let speckle = 0; speckle < 6600; speckle++) {
    const color = random.chance(0.6) ? 'grass' : 'soil';
    art.fill(color, random.nextInt(0, TOWN_WIDTH - 1), random.nextInt(0, LOGICAL_HEIGHT - 1), 1, 1);
  }
  for (let flower = 0; flower < 210; flower++) {
    const color = random.pick(['gold', 'blood', 'parchment'] as const);
    art.fill(color, random.nextInt(4, TOWN_WIDTH - 5), random.nextInt(4, LOGICAL_HEIGHT - 5), 1, 1);
  }
}

function drawRoads(art: PixelCanvas, coverage: Uint8Array, random: Random): void {
  const isRoad = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < TOWN_WIDTH && y < LOGICAL_HEIGHT && coverage[y * TOWN_WIDTH + x] === 1;
  for (let y = 0; y < LOGICAL_HEIGHT; y++) {
    for (let x = 0; x < TOWN_WIDTH; x++) {
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

// A line of trees along the north edge closes the town and hides the sky.
function drawForestEdge(art: PixelCanvas, random: Random): void {
  for (let x = 6; x < TOWN_WIDTH; x += 20) drawTree(art, x + random.nextInt(-4, 4), random.nextInt(26, 36));
}

function scatterTrees(art: PixelCanvas, coverage: Uint8Array, random: Random): void {
  const trees: Point[] = [];
  for (let attempt = 0; attempt < 1400 && trees.length < 46; attempt++) {
    const x = random.nextInt(10, TOWN_WIDTH - 10);
    const y = random.nextInt(60, LOGICAL_HEIGHT - 2);
    const crowded = Math.hypot(POND_CENTER.x - x, POND_CENTER.y - y) < 34 || trees.some((tree) => Math.hypot(tree.x - x, tree.y - y) < 26);
    if (!crowded && isOpenGround(x, y, coverage, TREE_MARGIN)) trees.push({ x, y });
  }
  trees.sort((first, second) => first.y - second.y).forEach((tree) => drawTree(art, tree.x, tree.y));
}

export function drawTownGroundArt(): HTMLCanvasElement {
  const art = createPixelCanvas(TOWN_WIDTH, LOGICAL_HEIGHT);
  const random = createRandom(11).fork('town-ground');
  const coverage = roadCoverage();
  drawGrass(art, random);
  drawGroundTexture(art, random.fork('texture'));
  drawRoads(art, coverage, random);
  drawTownDecorations(art, coverage, random.fork('decor'));
  scatterTrees(art, coverage, random);
  WELL_POSITIONS.forEach((position) => drawWell(art, position.x, position.y));
  drawForestEdge(art, random.fork('forest-edge'));
  return art.canvas;
}
