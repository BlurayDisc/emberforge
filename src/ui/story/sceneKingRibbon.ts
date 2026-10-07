import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter, SCENE_WIDTH } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

function paintHallBackground(painter: ScenePainter): void {
  painter.rect(color.woodDark, 0, 0, SCENE_WIDTH, 72);
  painter.disc(color.woodMid, 64, 28, 30);
  for (let column = 0; column < 8; column++) painter.rect(color.ink, column * 18 + 6, 0, 1, 54);
  painter.rect(color.woodMid, 0, 54, SCENE_WIDTH, 18);
  for (let row = 0; row < 4; row++) painter.rect(color.woodDark, 0, 57 + row * 5, SCENE_WIDTH, 1);
}

// The Forge Window: stained glass with a gold flame, and its light falling across the floor.
function paintForgeWindow(painter: ScenePainter): void {
  painter.rect(color.stone, 10, 4, 28, 38);
  painter.rect(color.royalPurpleDark, 12, 6, 24, 36);
  painter.disc(color.royalPurpleDark, 24, 8, 11);
  painter.rect(color.royalPurple, 14, 10, 20, 30);
  painter.rect(color.crimson, 14, 30, 20, 10);
  painter.disc(color.goldDark, 24, 27, 7);
  painter.rect(color.gold, 22, 18, 4, 14);
  painter.rect(color.gold, 20, 24, 8, 8);
  painter.rect(color.windowWarm, 23, 22, 2, 8);
  painter.rect(color.emberBright, 23, 31, 2, 3);
  painter.rect(color.stone, 23, 6, 2, 36);
  painter.rect(color.stone, 12, 24, 24, 1);
  for (let step = 0; step < 18; step++) painter.rect(color.woodLight, 28 + step * 2, 44 + step, 16, 1);
  painter.rect(color.goldDark, 30, 56, 22, 3);
  painter.rect(color.gold, 34, 59, 16, 2);
  painter.rect(color.windowWarm, 38, 61, 8, 1);
}

// The small white-oak throne of the princess stands empty in the far corner.
function paintPrincessThrone(painter: ScenePainter): void {
  painter.rect(color.woodPale, 100, 28, 14, 26);
  painter.rect(color.parchment, 102, 30, 10, 14);
  painter.rect(color.woodPale, 100, 44, 14, 3);
  painter.rect(color.parchment, 100, 47, 14, 7);
  painter.rect(color.gold, 105, 26, 4, 2);
  painter.rect(color.goldDark, 100, 28, 14, 1);
  painter.rect(color.crimson, 104, 38, 6, 4);
  painter.rect(color.woodMid, 98, 54, 18, 2);
}

function paintKingHead(painter: ScenePainter): void {
  painter.rect(color.gold, 57, 11, 12, 5);
  [57, 60, 63, 66].forEach((x) => painter.rect(color.gold, x, 9, 2, 3));
  painter.rect(color.crimson, 62, 12, 2, 2);
  painter.rect(color.parchment, 55, 16, 16, 8);
  painter.rect(color.skin, 58, 17, 10, 8);
  painter.rect(color.ink, 59, 20, 2, 1);
  painter.rect(color.ink, 65, 20, 2, 1);
  painter.rect(color.crimson, 62, 23, 2, 1);
  painter.rect(color.parchment, 55, 24, 16, 6);
  painter.rect(color.parchment, 57, 30, 12, 6);
  painter.rect(color.silver, 55, 29, 2, 7);
  painter.rect(color.silver, 69, 29, 2, 7);
  painter.rect(color.parchment, 59, 36, 8, 4);
  painter.rect(color.silver, 61, 39, 4, 1);
  painter.rect(color.skin, 61, 27, 4, 1);
  painter.rect(color.skin, 61, 22, 4, 1);
}

function paintKingBody(painter: ScenePainter): void {
  painter.rect(color.royalPurple, 46, 32, 36, 40);
  painter.rect(color.royalPurpleDark, 46, 32, 4, 40);
  painter.rect(color.royalPurpleDark, 78, 32, 4, 40);
  painter.rect(color.parchment, 52, 32, 4, 12);
  painter.rect(color.parchment, 70, 32, 4, 12);
  painter.rect(color.goldDark, 62, 40, 4, 32);
  painter.rect(color.gold, 46, 32, 36, 1);
  painter.rect(color.royalPurple, 36, 42, 14, 10);
  painter.rect(color.royalPurpleDark, 36, 50, 14, 2);
  painter.rect(color.gold, 36, 42, 2, 10);
  painter.rect(color.skin, 33, 46, 4, 4);
}

function paintSmith(painter: ScenePainter): void {
  painter.rect(color.woodMid, 14, 41, 12, 5);
  painter.rect(color.woodDark, 14, 41, 12, 2);
  painter.rect(color.woodMid, 13, 46, 12, 2);
  painter.rect(color.skin, 24, 44, 3, 4);
  painter.rect(color.ink, 26, 45, 1, 1);
  painter.rect(color.woodLight, 10, 48, 18, 24);
  painter.rect(color.woodPale, 14, 54, 10, 18);
  painter.rect(color.woodDark, 14, 54, 10, 1);
  painter.rect(color.woodLight, 26, 49, 8, 5);
  painter.rect(color.woodMid, 18, 48, 2, 6);
  painter.rect(color.woodPale, 26, 50, 10, 4);
  painter.rect(color.ribbonWhite, 29, 49, 2, 6);
  painter.rect(color.ribbonWhite, 31, 54, 1, 4);
  painter.rect(color.skin, 33, 50, 4, 4);
  painter.rect(color.skin, 33, 46, 4, 3);
}

export function drawKingRibbon(): PixelDrawing {
  const painter = createScenePainter();
  paintHallBackground(painter);
  paintForgeWindow(painter);
  paintPrincessThrone(painter);
  paintKingBody(painter);
  paintKingHead(painter);
  paintSmith(painter);
  return painter.drawing;
}
