import { createRandom, type Random } from '../kernel/random';
import { createPixelCanvas, type PixelCanvas } from './pixelCanvas';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './pixelStage';

const PLAZA_TOP = 150;
const PLAZA_HEIGHT = 44;
const ROAD_LEFT = 200;
const ROAD_WIDTH = 80;

function drawGrass(art: PixelCanvas, random: Random): void {
  art.fill('moss', 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  for (let speckle = 0; speckle < 1600; speckle++) {
    const color = random.chance(0.6) ? 'grass' : 'soil';
    art.fill(color, random.nextInt(0, LOGICAL_WIDTH - 1), random.nextInt(0, LOGICAL_HEIGHT - 1), 1, 1);
  }
}

function drawCobbles(art: PixelCanvas, left: number, top: number, width: number, height: number, random: Random): void {
  art.fill('pathLight', left, top, width, height);
  for (let row = 0; row < height; row += 5) {
    const offset = (row / 5) % 2 === 0 ? 0 : 5;
    for (let column = offset; column < width; column += 10) {
      art.fill('pathDark', left + column, top + row, 1, 5);
    }
    art.fill('pathDark', left, top + row, width, 1);
  }
  for (let chip = 0; chip < width * 0.4; chip++) {
    art.fill('pathDark', left + random.nextInt(0, width - 1), top + random.nextInt(0, height - 1), 1, 1);
  }
  art.fill('outline', left, top + height, width, 1);
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

export function drawTownGroundArt(): HTMLCanvasElement {
  const art = createPixelCanvas(LOGICAL_WIDTH, LOGICAL_HEIGHT);
  const random = createRandom(11).fork('town-ground');
  drawGrass(art, random);
  drawCobbles(art, 0, PLAZA_TOP, LOGICAL_WIDTH, PLAZA_HEIGHT, random);
  drawCobbles(art, ROAD_LEFT, PLAZA_TOP + PLAZA_HEIGHT, ROAD_WIDTH, LOGICAL_HEIGHT - PLAZA_TOP - PLAZA_HEIGHT, random);
  drawTree(art, 22, 258);
  drawTree(art, 458, 252);
  drawTree(art, 120, 262);
  drawTree(art, 372, 264);
  drawWell(art, 240, 226);
  return art.canvas;
}
