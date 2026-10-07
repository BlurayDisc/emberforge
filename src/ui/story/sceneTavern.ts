import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

function paintRoom(painter: ScenePainter): void {
  painter.rect(color.woodMid, 0, 0, 128, 54);
  for (let plank = 0; plank < 14; plank++) painter.rect(color.woodDark, plank * 9 + 3, 0, 1, 54);
  painter.rect(color.woodDark, 0, 0, 128, 5);
  [16, 52, 90, 120].forEach((x) => painter.rect(color.woodDark, x, 0, 4, 54));
  painter.rect(color.woodLight, 0, 54, 128, 18);
  for (let row = 0; row < 3; row++) painter.rect(color.woodMid, 0, 58 + row * 5, 128, 1);
}

function paintFireplace(painter: ScenePainter): void {
  painter.rect(color.stone, 4, 16, 40, 40);
  painter.rect(color.stoneDark, 4, 16, 40, 3);
  [[4, 24], [20, 32], [8, 40], [28, 46]].forEach(([x, y]) => painter.rect(color.stoneDark, x as number, y as number, 12, 1));
  painter.rect(color.ink, 10, 26, 28, 30);
  painter.rect(color.ember, 14, 46, 20, 10);
  painter.rect(color.emberBright, 17, 41, 14, 15);
  painter.rect(color.gold, 21, 45, 6, 11);
  painter.rect(color.woodDark, 12, 55, 24, 2);
  painter.rect(color.silver, 12, 31, 24, 1);
  painter.rect(color.ink, 15, 33, 18, 9);
  painter.rect(color.stoneDark, 14, 31, 20, 2);
  painter.rect(color.copper, 16, 34, 16, 2);
  painter.rect(color.parchment, 20, 28, 1, 2);
  painter.rect(color.parchment, 27, 26, 1, 3);
}

function paintLantern(painter: ScenePainter, x: number): void {
  painter.rect(color.ink, x + 2, 0, 1, 9);
  painter.rect(color.ink, x, 9, 5, 7);
  painter.rect(color.gold, x + 1, 10, 3, 5);
  painter.rect(color.parchment, x + 2, 11, 1, 2);
  painter.rect(color.goldDark, x - 2, 17, 9, 1);
}

function paintMug(painter: ScenePainter, x: number, y: number): void {
  painter.rect(color.silver, x, y, 3, 4);
  painter.rect(color.gold, x, y, 3, 1);
  painter.rect(color.silver, x + 3, y + 1, 1, 2);
}

function paintTable(painter: ScenePainter): void {
  painter.rect(color.woodDark, 54, 52, 4, 14);
  painter.rect(color.woodDark, 104, 52, 4, 14);
  painter.rect(color.woodPale, 50, 46, 70, 4);
  painter.rect(color.woodLight, 50, 50, 70, 3);
  painter.rect(color.woodDark, 50, 53, 70, 1);
  paintMug(painter, 62, 42);
  paintMug(painter, 90, 42);
  paintMug(painter, 108, 42);
  painter.rect(color.copper, 74, 43, 8, 3);
  painter.rect(color.parchment, 76, 41, 4, 2);
  painter.rect(color.crimson, 98, 43, 5, 3);
}

function paintDiner(painter: ScenePainter, x: number, tunic: string, hair: string): void {
  painter.rect(tunic, x, 33, 9, 14);
  painter.disc(color.copper, x + 4, 28, 3);
  painter.rect(hair, x + 1, 24, 7, 3);
  painter.rect(color.ink, x + 3, 28, 1, 1);
  painter.rect(color.ink, x + 6, 28, 1, 1);
}

function paintBarmaid(painter: ScenePainter): void {
  painter.rect(color.crimson, 70, 44, 12, 22);
  painter.rect(color.parchment, 72, 50, 8, 14);
  painter.disc(color.copper, 76, 38, 4);
  painter.rect(color.woodPale, 72, 33, 9, 3);
  painter.rect(color.parchment, 72, 32, 9, 2);
  painter.rect(color.crimson, 80, 44, 8, 3);
  painter.rect(color.parchment, 86, 44, 5, 3);
  painter.rect(color.ink, 75, 38, 1, 1);
  painter.rect(color.ink, 78, 38, 1, 1);
}

function paintShelf(painter: ScenePainter): void {
  painter.rect(color.woodPale, 100, 22, 26, 2);
  painter.rect(color.woodDark, 100, 24, 26, 1);
  [102, 108, 114, 120].forEach((x, index) => painter.rect(index % 2 ? color.copper : color.silver, x, 18, 3, 4));
  painter.rect(color.crimson, 92, 8, 8, 10);
  painter.rect(color.gold, 94, 10, 4, 6);
}

function paintBarrel(painter: ScenePainter): void {
  painter.rect(color.woodMid, 116, 56, 12, 16);
  painter.rect(color.woodPale, 118, 56, 3, 16);
  painter.rect(color.ink, 116, 60, 12, 1);
  painter.rect(color.ink, 116, 67, 12, 1);
}

export function drawTavern(): PixelDrawing {
  const painter = createScenePainter();
  paintRoom(painter);
  paintFireplace(painter);
  paintLantern(painter, 66);
  paintDiner(painter, 58, color.green, color.woodDark);
  paintDiner(painter, 96, color.tabardBlue, color.goldDark);
  paintTable(painter);
  paintBarmaid(painter);
  paintShelf(painter);
  paintBarrel(painter);
  painter.rect(color.ember, 10, 60, 30, 2);
  painter.rect(color.gold, 66, 58, 1, 1);
  return painter.drawing;
}
