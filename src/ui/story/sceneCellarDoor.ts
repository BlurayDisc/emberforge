import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

function paintWalls(painter: ScenePainter): void {
  painter.rect(color.stone, 0, 0, 128, 72);
  for (let row = 0; row < 9; row++) {
    painter.rect(color.stoneDark, 0, row * 8 + 6, 128, 1);
    for (let block = 0; block < 9; block++) painter.rect(color.stoneDark, (block * 16 + (row % 2) * 8) % 128, row * 8, 1, 6);
  }
  painter.rect(color.hearthStone, 0, 62, 128, 10);
  painter.rect(color.stoneDark, 0, 62, 128, 1);
}

function paintDoorway(painter: ScenePainter): void {
  painter.rect(color.woodDark, 52, 8, 52, 56);
  painter.rect(color.ink, 56, 12, 44, 52);
  painter.rect(color.mistDark, 58, 40, 40, 24);
  painter.rect(color.frostBlue, 62, 48, 14, 3);
  painter.rect(color.frostBlue, 80, 54, 14, 3);
  painter.rect(color.frostPale, 68, 45, 8, 2);
  painter.rect(color.frostPale, 84, 51, 6, 2);
  painter.rect(color.mistDark, 50, 56, 14, 4);
  painter.rect(color.frostBlue, 46, 60, 20, 2);
  painter.rect(color.mistDark, 40, 62, 18, 2);
  painter.rect(color.woodMid, 52, 8, 52, 4);
}

function paintOpenDoor(painter: ScenePainter): void {
  painter.rect(color.woodLight, 100, 10, 14, 54);
  for (let plank = 0; plank < 3; plank++) painter.rect(color.woodMid, 103 + plank * 4, 10, 1, 54);
  painter.rect(color.ink, 100, 22, 14, 2);
  painter.rect(color.ink, 100, 48, 14, 2);
  painter.rect(color.silver, 104, 36, 2, 2);
}

function paintKnight(painter: ScenePainter): void {
  painter.rect(color.woodDark, 48, 54, 4, 10);
  painter.rect(color.woodDark, 54, 54, 4, 10);
  painter.rect(color.silver, 46, 18, 2, 44);
  painter.rect(color.parchment, 45, 14, 4, 5);
  painter.rect(color.ribbonWhite, 48, 32, 12, 22);
  painter.rect(color.tabardBlue, 50, 32, 8, 22);
  painter.rect(color.ribbonWhite, 52, 40, 4, 4);
  painter.rect(color.silver, 47, 34, 3, 12);
  painter.rect(color.silver, 58, 34, 3, 10);
  painter.disc(color.silver, 54, 28, 4);
  painter.rect(color.ink, 52, 28, 5, 1);
  painter.rect(color.crimson, 54, 21, 1, 3);
}

function paintTorch(painter: ScenePainter): void {
  painter.rect(color.woodDark, 22, 30, 3, 14);
  painter.rect(color.ink, 20, 28, 7, 3);
  painter.rect(color.ember, 20, 20, 7, 9);
  painter.rect(color.emberBright, 21, 17, 5, 11);
  painter.rect(color.gold, 22, 21, 3, 6);
  painter.rect(color.copper, 14, 40, 20, 1);
  painter.rect(color.woodMid, 8, 36, 1, 1);
}

function paintBarrel(painter: ScenePainter, x: number, y: number, height: number): void {
  painter.rect(color.woodMid, x, y, 14, height);
  painter.rect(color.woodLight, x + 2, y, 3, height);
  painter.rect(color.woodDark, x + 9, y, 2, height);
  painter.rect(color.ink, x, y + 3, 14, 1);
  painter.rect(color.ink, x, y + height - 4, 14, 1);
  painter.rect(color.woodPale, x + 1, y - 1, 12, 1);
}

export function drawCellarDoor(): PixelDrawing {
  const painter = createScenePainter();
  paintWalls(painter);
  paintDoorway(painter);
  paintOpenDoor(painter);
  paintBarrel(painter, 4, 44, 20);
  paintBarrel(painter, 18, 50, 14);
  paintBarrel(painter, 114, 46, 18);
  paintKnight(painter);
  paintTorch(painter);
  painter.rect(color.mistDark, 0, 66, 128, 1);
  return painter.drawing;
}
