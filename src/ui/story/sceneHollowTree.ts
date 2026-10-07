import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, paintBands, type ScenePainter } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

const SPRING_X = 64;
const GROUND_TOP = 56;
const ROOT_ARCHES: readonly (readonly [number, number, number])[] = [[SPRING_X, 56, 13], [40, 57, 7], [88, 57, 7], [22, 60, 5], [106, 60, 5]];
const SPIDER_EYES: readonly (readonly [number, number])[] = [[38, 54], [87, 53], [41, 56], [22, 58], [106, 58]];

function paintLine(painter: ScenePainter, lineColor: string, fromX: number, fromY: number, toX: number, toY: number): void {
  const steps = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
  for (let step = 0; step <= steps; step++) {
    painter.rect(lineColor, Math.round(fromX + ((toX - fromX) * step) / steps), Math.round(fromY + ((toY - fromY) * step) / steps), 1, 1);
  }
}

function paintForestBackdrop(painter: ScenePainter): void {
  paintBands(painter, [color.ink, color.nightDeep, color.nightDeep, color.hillNight], 56);
  const farTrunks: readonly (readonly [number, number])[] = [[3, 5], [14, 4], [108, 4], [120, 6]];
  farTrunks.forEach(([x, width]) => {
    painter.rect(color.ink, x, 0, width, 60);
    painter.rect(color.hillNight, x, 0, 1, 60);
  });
  for (let mist = 0; mist < 40; mist++) painter.rect(color.nightSky, (mist * 37) % 128, 30 + ((mist * 11) % 22), 3, 1);
}

function paintCanopyAndBranches(painter: ScenePainter): void {
  painter.rect(color.ink, 0, 0, 128, 7);
  for (let leaf = 0; leaf < 64; leaf++) painter.rect(color.hillNight, (leaf * 23) % 128, 6 + ((leaf * 7) % 8) % 6, 3, 1);
  for (let thickness = 0; thickness < 4; thickness++) {
    paintLine(painter, color.woodDark, 44, 12 + thickness, 8, 6 + thickness);
    paintLine(painter, color.woodDark, 84, 12 + thickness, 120, 5 + thickness);
  }
  paintLine(painter, color.woodMid, 44, 12, 8, 6);
  paintLine(painter, color.woodMid, 84, 12, 120, 5);
  paintLine(painter, color.woodDark, 54, 8, 40, 0);
  paintLine(painter, color.woodDark, 74, 8, 90, 0);
}

function paintGiantTrunk(painter: ScenePainter): void {
  for (let y = 0; y < 46; y++) {
    const left = 42 - Math.floor(y / 5);
    const right = 86 + Math.floor(y / 5);
    painter.rect(color.woodDark, left, y, right - left, 1);
    painter.rect(color.stone, left, y, 1, 1);
    painter.rect(color.woodMid, left + 1, y, 3, 1);
    painter.rect(color.ink, right - 3, y, 3, 1);
  }
  for (let crack = 0; crack < 7; crack++) painter.rect(color.ink, 48 + crack * 5, 6 + (crack % 3) * 9, 1, 10);
  for (let bark = 0; bark < 6; bark++) painter.rect(color.woodMid, 50 + bark * 6, 14 + (bark % 2) * 12, 1, 6);
  painter.disc(color.ink, SPRING_X, 22, 6);
  painter.rect(color.nightDeep, SPRING_X - 3, 20, 6, 1);
}

function paintRootArches(painter: ScenePainter): void {
  for (let y = 38; y < 62; y++) {
    painter.rect(color.woodDark, 34 - (y - 38), y, 60 + (y - 38) * 2, 1);
    painter.rect(color.woodMid, 36 - (y - 38), y, 2, 1);
  }
  ROOT_ARCHES.forEach(([x, y, radius]) => painter.disc(color.woodMid, x, y, radius + 1));
  ROOT_ARCHES.forEach(([x, y, radius]) => painter.disc(color.ink, x, y, radius));
  for (let strand = 0; strand < 9; strand++) painter.rect(color.ink, 30 + strand * 8, 44 + (strand % 3) * 4, 1, 5);
}

function paintGroundAndStream(painter: ScenePainter): void {
  painter.rect(color.hillNight, 0, GROUND_TOP + 1, 128, 15);
  painter.rect(color.ink, 0, 68, 14, 4);
  painter.rect(color.ink, 114, 68, 14, 4);
  for (let tuft = 0; tuft < 14; tuft++) painter.rect(color.green, (tuft * 19) % 128, 60 + ((tuft * 5) % 11), 1, 2);
  painter.rect(color.ink, SPRING_X - 11, 50, 23, 8);
  for (let y = 56; y < 72; y++) {
    const halfWidth = 10 + Math.floor((y - 56) * 2.2);
    painter.rect(color.nightHorizon, SPRING_X - halfWidth - 1, y, halfWidth * 2 + 3, 1);
    painter.rect(color.ink, SPRING_X - halfWidth, y, halfWidth * 2 + 1, 1);
    if (y % 2 === 0) painter.rect(color.nightSky, SPRING_X - halfWidth + ((y * 5) % 9) + 2, y, 5 + (y % 4) * 2, 1);
  }
  painter.rect(color.nightHorizon, SPRING_X - 5, 52, 10, 1);
  painter.rect(color.nightSky, SPRING_X - 8, 54, 16, 1);
}

function paintColdMist(painter: ScenePainter): void {
  for (let y = 52; y < 62; y++) {
    const halfWidth = 14 + (y - 52) * 2;
    for (let x = SPRING_X - halfWidth; x < SPRING_X + halfWidth; x++) {
      if ((x + y) % 2 === 0 && (x * 7 + y * 3) % 5 < 3) painter.rect(y < 57 ? color.stone : color.nightHorizon, x, y, 1, 1);
    }
  }
  for (let wisp = 0; wisp < 6; wisp++) painter.rect(color.silver, 50 + wisp * 5, 53 + (wisp % 3) * 3, 3, 1);
}

function paintWeb(painter: ScenePainter, cornerX: number, cornerY: number, direction: number): void {
  for (let strand = 0; strand < 4; strand++) paintLine(painter, color.stone, cornerX, cornerY, cornerX + direction * 9, cornerY + strand * 4);
  paintLine(painter, color.silver, cornerX + direction * 4, cornerY + 1, cornerX + direction * 4, cornerY + 7);
  paintLine(painter, color.stone, cornerX + direction * 7, cornerY + 2, cornerX + direction * 7, cornerY + 11);
}

function paintHangingThreads(painter: ScenePainter): void {
  const hangingThreads: readonly (readonly [number, number, number])[] = [[16, 7, 16], [26, 9, 14], [101, 8, 18], [112, 6, 12], [58, 12, 10], [72, 12, 12]];
  hangingThreads.forEach(([x, top, length]) => {
    painter.rect(color.stone, x, top, 1, length);
    painter.rect(color.silver, x, top + length, 2, 1);
  });
  paintWeb(painter, 6, 6, 1);
  paintWeb(painter, 121, 6, -1);
}

function paintSpiderEyes(painter: ScenePainter): void {
  SPIDER_EYES.forEach(([x, y]) => {
    painter.rect(color.crimson, x, y, 1, 1);
    painter.rect(color.crimson, x + 2, y, 1, 1);
    painter.rect(color.emberBright, x, y, 1, 1);
    painter.rect(color.emberBright, x + 2, y, 1, 1);
  });
  painter.rect(color.crimson, 77, 49, 1, 1);
  painter.rect(color.crimson, 79, 49, 1, 1);
}

export function drawHollowTree(): PixelDrawing {
  const painter = createScenePainter();
  paintForestBackdrop(painter);
  paintCanopyAndBranches(painter);
  paintGiantTrunk(painter);
  paintRootArches(painter);
  paintWeb(painter, 48, 40, -1);
  paintWeb(painter, 80, 40, 1);
  paintSpiderEyes(painter);
  paintGroundAndStream(painter);
  paintColdMist(painter);
  paintHangingThreads(painter);
  return painter.drawing;
}
