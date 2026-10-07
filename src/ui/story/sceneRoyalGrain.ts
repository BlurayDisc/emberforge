import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter, SCENE_WIDTH } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

const SACK_WIDTH = 22;
const SACK_HEIGHT = 15;

function paintDenBackground(painter: ScenePainter): void {
  painter.rect(color.ink, 0, 0, SCENE_WIDTH, 72);
  painter.rect(color.woodDark, 0, 6, SCENE_WIDTH, 52);
  for (let index = 0; index < 14; index++) painter.rect(color.woodMid, (index * 29 + 5) % 120, (index * 13 + 9) % 44 + 8, 4, 1);
  painter.rect(color.woodMid, 0, 58, SCENE_WIDTH, 14);
  painter.rect(color.woodDark, 0, 58, SCENE_WIDTH, 1);
  painter.rect(color.woodLight, 82, 0, 6, 6);
  painter.rect(color.windowWarm, 83, 0, 4, 5);
}

// Pixel rows, so the beam is the same every time and cuts the dark in a hard diagonal.
function paintLightShaft(painter: ScenePainter): void {
  for (let row = 5; row < 60; row++) {
    const left = 83 - Math.floor(row * 0.55);
    painter.rect(color.woodLight, left, row, 8 + Math.floor(row / 4), 1);
  }
  painter.rect(color.woodPale, 44, 56, 26, 3);
  painter.rect(color.woodLight, 40, 58, 36, 2);
}

function paintRoyalSeal(painter: ScenePainter, x: number, y: number): void {
  painter.rect(color.crimson, x, y, 8, 8);
  [1, 3, 5].forEach((pointX) => painter.rect(color.gold, x + pointX, y + 1, 1, 1));
  painter.rect(color.gold, x + 1, y + 2, 5, 1);
  painter.rect(color.gold, x + 3, y + 4, 1, 3);
  [[2, 4], [4, 4], [2, 6], [4, 6]].forEach(([grainX, grainY]) => painter.rect(color.emberBright, x + (grainX ?? 0), y + (grainY ?? 0), 1, 1));
}

function paintSack(painter: ScenePainter, x: number, y: number, isLit: boolean): void {
  const body = isLit ? color.parchment : color.woodPale;
  const shade = isLit ? color.woodPale : color.woodLight;
  painter.rect(shade, x, y + 3, SACK_WIDTH, SACK_HEIGHT - 3);
  painter.rect(body, x + 1, y + 3, SACK_WIDTH - 3, SACK_HEIGHT - 5);
  painter.rect(shade, x + 3, y, SACK_WIDTH - 6, 4);
  painter.rect(body, x + 4, y, SACK_WIDTH - 9, 2);
  painter.rect(color.woodDark, x + 4, y + 3, SACK_WIDTH - 8, 1);
  painter.rect(color.woodDark, x, y + SACK_HEIGHT - 1, SACK_WIDTH, 1);
  painter.rect(color.woodLight, x + 2, y + 10, 4, 1);
  paintRoyalSeal(painter, x + 7, y + 5);
}

function paintSackStack(painter: ScenePainter): void {
  ([[34, 44], [56, 44], [78, 44]] as [number, number][]).forEach(([x, y]) => paintSack(painter, x, y, false));
  ([[45, 30], [67, 30]] as [number, number][]).forEach(([x, y]) => paintSack(painter, x, y, false));
  paintSack(painter, 56, 16, true);
}

function paintDustAndGrains(painter: ScenePainter): void {
  ([[80, 12], [77, 20], [82, 27], [72, 34], [76, 40], [70, 47], [66, 22], [74, 16]] as [number, number][]).forEach(([x, y]) => painter.rect(color.parchment, x, y, 1, 1));
  ([[50, 60], [54, 62], [58, 61], [62, 63], [47, 62], [66, 60], [70, 62], [52, 65]] as [number, number][]).forEach(([x, y]) => painter.rect(color.gold, x, y, 1, 1));
  painter.rect(color.goldDark, 60, 64, 1, 1);
}

function paintGoblinClutter(painter: ScenePainter): void {
  painter.rect(color.woodLight, 6, 46, 20, 14);
  painter.rect(color.woodDark, 6, 52, 20, 1);
  painter.rect(color.woodDark, 15, 46, 1, 14);
  painter.rect(color.woodPale, 104, 54, 14, 6);
  painter.rect(color.parchment, 108, 56, 6, 1);
}

// Sacks behind the chief's throne, each with the royal seal, lit by a crack in the roof.
export function drawRoyalGrain(): PixelDrawing {
  const painter = createScenePainter();
  paintDenBackground(painter);
  paintGoblinClutter(painter);
  paintLightShaft(painter);
  paintSackStack(painter);
  paintDustAndGrains(painter);
  return painter.drawing;
}
