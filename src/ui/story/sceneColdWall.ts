import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

function paintStoneBlocks(painter: ScenePainter): void {
  painter.rect(color.stoneDark, 0, 0, 128, 72);
  for (let row = 0; row < 6; row++) {
    const rowTop = row * 12;
    for (let block = -1; block < 5; block++) {
      const left = block * 28 + (row % 2) * 14;
      painter.rect(color.stone, left + 1, rowTop + 1, 26, 10);
      painter.rect(color.hearthStone, left + 1, rowTop + 8, 26, 3);
      painter.rect(color.mistDark, left + 3, rowTop + 2, 6, 1);
    }
  }
}

function paintFrostDoor(painter: ScenePainter): void {
  painter.rect(color.mistDark, 50, 18, 28, 50);
  painter.rect(color.ink, 53, 24, 22, 44);
  painter.rect(color.frostBlue, 50, 28, 1, 40);
  painter.rect(color.frostBlue, 77, 28, 1, 40);
  painter.rect(color.frostPale, 50, 36, 1, 8);
  painter.rect(color.frostPale, 77, 48, 1, 8);
  painter.rect(color.frostBlue, 53, 22, 22, 1);
  painter.rect(color.frostBlue, 51, 24, 2, 1);
  painter.rect(color.frostBlue, 75, 24, 2, 1);
  painter.rect(color.frostPale, 58, 20, 12, 1);
  painter.rect(color.frostBlue, 54, 21, 4, 1);
  painter.rect(color.frostBlue, 70, 21, 4, 1);
  painter.rect(color.frostBlue, 50, 68, 28, 1);
}

function paintFrostSpread(painter: ScenePainter): void {
  [[44, 32], [82, 40], [47, 52], [80, 60], [40, 44], [86, 28]].forEach(([pointX, pointY]) => {
    painter.rect(color.frostBlue, pointX as number, pointY as number, 3, 1);
    painter.rect(color.frostPale, (pointX as number) + 1, pointY as number, 1, 1);
  });
  painter.rect(color.frostPale, 62, 66, 4, 1);
}

function paintBarrelEdge(painter: ScenePainter, x: number): void {
  painter.rect(color.woodMid, x, 22, 24, 50);
  painter.rect(color.woodLight, x + 4, 22, 5, 50);
  painter.rect(color.woodDark, x + 17, 22, 5, 50);
  painter.rect(color.ink, x, 32, 24, 2);
  painter.rect(color.ink, x, 58, 24, 2);
}

function paintTorchFlame(painter: ScenePainter): void {
  painter.rect(color.woodDark, 108, 40, 6, 32);
  painter.rect(color.ink, 106, 38, 10, 3);
  painter.rect(color.ember, 98, 22, 12, 16);
  painter.rect(color.ember, 94, 28, 5, 5);
  painter.rect(color.emberBright, 100, 24, 9, 14);
  painter.rect(color.emberBright, 96, 29, 4, 3);
  painter.rect(color.gold, 103, 28, 4, 10);
  painter.rect(color.parchment, 104, 33, 2, 5);
  painter.rect(color.ember, 88, 40, 4, 1);
  painter.rect(color.emberBright, 91, 24, 1, 1);
}

export function drawColdWall(): PixelDrawing {
  const painter = createScenePainter();
  paintStoneBlocks(painter);
  paintFrostDoor(painter);
  paintFrostSpread(painter);
  paintBarrelEdge(painter, 0);
  paintBarrelEdge(painter, 128 - 8 + 0 - 0 > 0 ? 112 : 112);
  paintTorchFlame(painter);
  return painter.drawing;
}
