import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter, paintBands, paintStars, SCENE_HEIGHT } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

const GROUND_Y = 62;

function paintCastleOnHill(painter: ScenePainter): void {
  painter.disc(color.royalPurpleDark, 52, 56, 30);
  painter.rect(color.royalPurpleDark, 36, 26, 34, 14);
  ([[34, 16], [44, 20], [55, 13], [65, 18]] as const).forEach(([x, y]) => {
    painter.rect(color.royalPurpleDark, x, y, 6, 12);
    painter.rect(color.royalPurpleDark, x + 1, y - 2, 4, 2);
  });
  ([[37, 29], [47, 26], [58, 22], [67, 27], [50, 32], [41, 24]] as const).forEach(([x, y]) => painter.rect(color.windowWarm, x, y, 1, 2));
  painter.rect(color.crimson, 58, 8, 1, 5);
  painter.rect(color.crimson, 59, 8, 3, 2);
}

function paintBellTower(painter: ScenePainter): void {
  painter.rect(color.woodDark, 6, 18, 9, 28);
  painter.rect(color.woodMid, 6, 18, 2, 28);
  painter.rect(color.ink, 9, 22, 3, 5);
  painter.rect(color.gold, 10, 24, 1, 2);
  for (let row = 0; row < 8; row++) painter.rect(color.woodDark, 6 + Math.floor(row / 2), 10 + row, 9 - Math.floor(row / 2) * 2, 1);
  painter.rect(color.woodDark, 10, 4, 1, 6);
}

function paintTimberHouse(painter: ScenePainter, x: number, top: number, width: number, bottom: number, roofColor: string): void {
  painter.rect(color.woodMid, x, top, width, bottom - top);
  painter.rect(color.woodDark, x, top + 3, width, 1);
  for (let step = 0; step < 5; step++) painter.rect(roofColor, x - 1 + step, top - 5 + step, width + 2 - step * 2, 1);
  painter.rect(roofColor, x - 1, top - 1, width + 2, 2);
  painter.rect(color.windowWarm, x + 2, top + 5, 3, 3);
  if (width > 12) painter.rect(color.windowWarm, x + width - 6, top + 5, 3, 3);
  painter.rect(color.woodDark, x + 3, top + 5, 1, 3);
}

function paintSmoke(painter: ScenePainter, x: number, y: number): void {
  ([[0, 0], [1, -3], [0, -6], [2, -9], [1, -12]] as const).forEach(([dx, dy]) => painter.rect(color.stone, x + dx, y + dy, 2, 2));
}

function paintBackTown(painter: ScenePainter): void {
  ([[0, 44, 16, color.woodDark], [18, 46, 12, color.woodDark], [31, 44, 12, color.ink], [44, 47, 10, color.woodDark], [56, 45, 12, color.woodDark], [68, 47, 10, color.ink]] as const).forEach(([x, top, width, roof]) =>
    paintTimberHouse(painter, x as number, top as number, width as number, GROUND_Y - 4, roof as string));
  painter.rect(color.woodDark, 22, 36, 3, 6);
  paintSmoke(painter, 22, 34);
  painter.rect(color.woodDark, 60, 38, 3, 5);
  paintSmoke(painter, 60, 36);
}

function paintInn(painter: ScenePainter): void {
  painter.rect(color.woodMid, 78, 28, 50, 36);
  painter.rect(color.woodDark, 78, 36, 50, 2);
  for (let beam = 0; beam < 6; beam++) painter.rect(color.woodDark, 80 + beam * 9, 38, 1, 24);
  for (let step = 0; step < 6; step++) painter.rect(color.woodDark, 76 + step * 2, 20 + step, 54 - step * 4, 1);
  painter.rect(color.woodDark, 76, 26, 54, 2);
  painter.rect(color.ink, 112, 12, 5, 10);
  paintSmoke(painter, 113, 10);
  painter.rect(color.windowWarm, 82, 42, 6, 6);
  painter.rect(color.woodDark, 85, 42, 1, 6);
  painter.rect(color.windowWarm, 116, 42, 6, 6);
  painter.rect(color.woodDark, 119, 42, 1, 6);
  painter.rect(color.ink, 92, 40, 13, 24);
  painter.rect(color.windowWarm, 93, 41, 11, 23);
  painter.rect(color.goldDark, 93, 41, 11, 2);
  painter.rect(color.gold, 110, 30, 1, 5);
  painter.rect(color.goldDark, 108, 33, 6, 4);
  painter.rect(color.gold, 109, 34, 4, 2);
}

function paintMartaHoldingSoup(painter: ScenePainter): void {
  painter.disc(color.crimson, 98, 54, 8);
  painter.rect(color.crimson, 91, 56, 15, 8);
  painter.rect(color.parchment, 93, 52, 10, 12);
  painter.rect(color.ribbonWhite, 94, 52, 8, 1);
  painter.disc(color.skin, 98, 41, 4);
  painter.rect(color.parchment, 94, 36, 9, 3);
  painter.rect(color.parchment, 96, 34, 5, 2);
  painter.rect(color.ink, 96, 41, 1, 1);
  painter.rect(color.ink, 100, 41, 1, 1);
  painter.rect(color.crimson, 98, 44, 2, 1);
  painter.rect(color.ember, 94, 43, 1, 1);
  painter.rect(color.crimson, 83, 50, 10, 4);
  painter.rect(color.skin, 80, 51, 3, 3);
  painter.rect(color.woodPale, 77, 52, 7, 4);
  painter.rect(color.ember, 78, 51, 5, 1);
  ([[79, 47], [80, 44], [79, 41]] as const).forEach(([x, y]) => painter.rect(color.parchment, x, y, 1, 2));
}

function paintSmithFromBehind(painter: ScenePainter): void {
  painter.rect(color.ink, 60, 62, 12, 2);
  painter.rect(color.woodLight, 61, 50, 10, 13);
  painter.rect(color.woodMid, 61, 50, 2, 13);
  painter.rect(color.woodPale, 63, 56, 6, 7);
  painter.rect(color.skin, 63, 42, 6, 6);
  painter.rect(color.woodMid, 62, 41, 8, 3);
  painter.rect(color.woodLight, 71, 52, 4, 3);
  painter.rect(color.skin, 74, 53, 2, 2);
  painter.rect(color.ribbonWhite, 66, 51, 2, 3);
  painter.rect(color.ink, 62, 63, 3, 2);
  painter.rect(color.ink, 67, 63, 3, 2);
}

function paintStreet(painter: ScenePainter): void {
  painter.rect(color.woodDark, 0, GROUND_Y - 4, 128, 4);
  painter.rect(color.woodMid, 0, GROUND_Y, 128, SCENE_HEIGHT - GROUND_Y);
  painter.rect(color.woodDark, 0, GROUND_Y + 5, 128, 1);
  painter.rect(color.woodLight, 70, GROUND_Y, 44, 3);
  painter.rect(color.woodPale, 86, GROUND_Y + 1, 24, 2);
  painter.rect(color.windowWarm, 93, GROUND_Y + 1, 11, 2);
  painter.rect(color.woodDark, 0, GROUND_Y + 9, 128, 1);
}

// Hollowbrook at dusk: the town glows warm, and Marta gives the smith a bowl of soup.
export function drawTownAtDusk(): PixelDrawing {
  const painter = createScenePainter();
  paintBands(painter, [color.duskViolet, color.royalPurple, color.dawnRose, color.duskOrange, color.copper], 45);
  paintStars(painter, color.moon, 6, 14);
  paintCastleOnHill(painter);
  paintBellTower(painter);
  paintBackTown(painter);
  paintInn(painter);
  paintStreet(painter);
  paintMartaHoldingSoup(painter);
  paintSmithFromBehind(painter);
  return painter.drawing;
}
