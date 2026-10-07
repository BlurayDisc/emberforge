import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, paintAnvil, type ScenePainter, SCENE_WIDTH } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

function paintCaveWall(painter: ScenePainter): void {
  painter.rect(color.ink, 0, 0, SCENE_WIDTH, 72);
  painter.rect(color.woodLight, 5, 4, 118, 64);
  painter.rect(color.woodMid, 6, 5, 116, 62);
  painter.rect(color.woodDark, 6, 5, 116, 1);
  painter.rect(color.woodDark, 6, 5, 1, 62);
  for (let index = 0; index < 22; index++) painter.rect(color.woodDark, (index * 37 + 11) % 110 + 9, (index * 19 + 8) % 56 + 8, 2, 1);
  for (let index = 0; index < 14; index++) painter.rect(color.woodLight, (index * 41 + 29) % 108 + 10, (index * 23 + 13) % 54 + 9, 1, 2);
}

function paintSmith(painter: ScenePainter): void {
  painter.rect(color.woodDark, 13, 15, 3, 12);
  painter.rect(color.stone, 12, 13, 8, 4);
  painter.rect(color.stone, 17, 17, 2, 4);
  painter.disc(color.stone, 25, 24, 4);
  painter.rect(color.silver, 23, 21, 3, 1);
  painter.rect(color.goldDark, 22, 27, 7, 8);
  painter.rect(color.stone, 22, 18, 7, 2);
  painter.rect(color.stone, 21, 35, 9, 10);
  painter.rect(color.woodMid, 24, 35, 1, 10);
  painter.rect(color.stone, 17, 22, 5, 3);
  painter.rect(color.stone, 14, 13, 4, 8);
  painter.rect(color.woodMid, 22, 24, 1, 1);
  painter.rect(color.woodMid, 26, 24, 1, 1);
  paintAnvil(painter, 14, 40, color.silver, color.stone);
  painter.rect(color.goldDark, 14, 43, 24, 1);
  painter.rect(color.silver, 12, 13, 8, 1);
  painter.rect(color.gold, 33, 36, 1, 1);
  painter.rect(color.gold, 36, 40, 1, 1);
  painter.rect(color.gold, 31, 33, 1, 1);
}

function paintSingingWoman(painter: ScenePainter): void {
  painter.rect(color.woodLight, 55, 17, 18, 28);
  painter.rect(color.woodDark, 56, 20, 3, 26);
  painter.rect(color.woodDark, 69, 20, 3, 26);
  painter.disc(color.stone, 64, 24, 5);
  painter.rect(color.silver, 61, 20, 3, 1);
  painter.rect(color.woodPale, 58, 17, 12, 3);
  painter.rect(color.ink, 63, 26, 3, 2);
  painter.rect(color.woodMid, 61, 23, 1, 1);
  painter.rect(color.woodMid, 66, 23, 1, 1);
  painter.rect(color.stone, 59, 30, 10, 14);
  painter.rect(color.goldDark, 59, 30, 10, 1);
  painter.rect(color.woodPale, 58, 44, 12, 2);
  painter.rect(color.woodMid, 64, 32, 1, 12);
  [[75, 26], [80, 20], [74, 14], [84, 11], [50, 14], [45, 22]].forEach(([x, y], index) => {
    painter.rect(color.gold, x as number, y as number, 2, 2);
    painter.rect(color.gold, (x as number) + 2, (y as number) - 4, 1, 5);
    if (index % 2 === 0) painter.rect(color.emberBright, (x as number) + 3, (y as number) - 4, 2, 1);
  });
}

function paintSleepingSerpent(painter: ScenePainter): void {
  for (let x = 10; x < 100; x++) {
    const waveHeight = Math.round(Math.sin(x / 7) * 3);
    painter.rect(color.stone, x, 57 + waveHeight, 1, 5);
    painter.rect(color.woodPale, x, 60 + waveHeight, 1, 2);
    if (x % 4 === 0) painter.rect(color.woodMid, x, 58 + waveHeight, 1, 2);
  }
  painter.disc(color.stone, 105, 57, 6);
  painter.rect(color.stone, 104, 59, 12, 4);
  painter.rect(color.woodPale, 106, 62, 10, 1);
  painter.rect(color.woodMid, 105, 56, 3, 1);
  painter.rect(color.goldDark, 104, 53, 1, 3);
  painter.rect(color.goldDark, 108, 52, 1, 3);
}

function paintCarvedFire(painter: ScenePainter): void {
  for (let x = 14; x < 112; x += 7) {
    const flameHeight = 4 + (x * 5) % 5;
    painter.rect(color.goldDark, x, 50 - flameHeight, 3, flameHeight);
    painter.rect(color.gold, x + 1, 50 - flameHeight + 2, 1, flameHeight - 2);
    painter.rect(color.goldDark, x + 3, 48, 3, 2);
  }
  painter.rect(color.goldDark, 12, 50, 100, 1);
}

function paintWebLine(painter: ScenePainter, fromX: number, fromY: number, stepX: number, stepY: number, length: number): void {
  for (let step = 0; step < length; step++) painter.rect(color.silver, fromX + step * stepX, fromY + step * stepY, 1, 1);
}

function paintTornWebs(painter: ScenePainter): void {
  paintWebLine(painter, 0, 0, 1, 1, 34);
  paintWebLine(painter, 0, 0, 2, 1, 44);
  paintWebLine(painter, 0, 0, 1, 2, 30);
  paintWebLine(painter, 0, 10, 1, 1, 14);
  paintWebLine(painter, 8, 0, 1, 1, 14);
  paintWebLine(painter, 127, 0, -1, 1, 28);
  paintWebLine(painter, 127, 0, -2, 1, 36);
  paintWebLine(painter, 127, 0, -1, 2, 22);
  paintWebLine(painter, 127, 14, -1, 1, 10);
  paintWebLine(painter, 0, 71, 1, -1, 12);
  paintWebLine(painter, 0, 71, 2, -1, 20);
  paintWebLine(painter, 127, 71, -2, -1, 16);
  paintWebLine(painter, 127, 71, -1, -1, 10);
  painter.rect(color.stone, 36, 0, 1, 7);
  painter.rect(color.stone, 92, 0, 1, 11);
  painter.rect(color.stone, 91, 11, 3, 1);
}

// Dwarf relief work behind torn webs: the smith, the singer and the sleeping serpent under a carved fire.
export function drawDwarfMural(): PixelDrawing {
  const painter = createScenePainter();
  paintCaveWall(painter);
  paintCarvedFire(painter);
  paintSmith(painter);
  paintSingingWoman(painter);
  paintSleepingSerpent(painter);
  paintTornWebs(painter);
  return painter.drawing;
}
