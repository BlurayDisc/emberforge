import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter, paintBands, paintStars, SCENE_HEIGHT, SCENE_WIDTH } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

const HORIZON_Y = 34;

function paintFarmhouse(painter: ScenePainter, x: number, y: number): void {
  painter.rect(color.woodMid, x, y, 26, 14);
  painter.rect(color.woodDark, x, y + 11, 26, 3);
  painter.rect(color.ink, x - 2, y - 2, 30, 3);
  painter.rect(color.woodDark, x, y - 5, 26, 3);
  painter.rect(color.ink, x + 3, y - 8, 20, 3);
  painter.rect(color.ink, x + 7, y - 11, 12, 3);
  painter.rect(color.stone, x + 20, y - 12, 3, 5);
  painter.rect(color.gold, x + 4, y + 3, 6, 5);
  painter.rect(color.emberBright, x + 4, y + 6, 6, 2);
  painter.rect(color.ink, x + 6, y + 3, 1, 5);
  painter.rect(color.woodLight, x + 16, y + 4, 5, 10);
  painter.rect(color.gold, x - 4, y + 4, 4, 12);
}

function paintWheatRows(painter: ScenePainter): void {
  painter.rect(color.goldDark, 0, HORIZON_Y, SCENE_WIDTH, SCENE_HEIGHT - HORIZON_Y);
  for (let y = HORIZON_Y + 2; y < SCENE_HEIGHT; y += 3 + Math.floor((y - HORIZON_Y) / 12)) {
    painter.rect(color.gold, 0, y, SCENE_WIDTH, 1);
    for (let x = (y * 7) % 5; x < SCENE_WIDTH; x += 5) painter.rect(color.copper, x, y + 1, 1, 1);
  }
  painter.rect(color.woodLight, 0, HORIZON_Y, SCENE_WIDTH, 1);
}

function paintToppledScarecrow(painter: ScenePainter, x: number, y: number, length: number): void {
  painter.rect(color.woodPale, x, y, length, 1);
  painter.rect(color.woodDark, x, y + 1, length, 1);
  painter.rect(color.woodPale, x + length / 2, y - 3, 1, 7);
  painter.rect(color.crimson, x + length / 2 - 1, y - 1, 3, 3);
  painter.rect(color.gold, x + length / 2 - 2, y + 3, 1, 1);
  painter.rect(color.gold, x + length / 2 + 2, y - 4, 1, 1);
  painter.rect(color.gold, x - 2, y - 2, 3, 3);
  painter.rect(color.ink, x - 2, y - 1, 1, 1);
  painter.rect(color.ink, x, y - 1, 1, 1);
  painter.rect(color.ink, x - 2, y + 1, 3, 1);
}

function paintLanternFarmer(painter: ScenePainter, x: number, y: number, coat: string): void {
  painter.rect(color.dawnRose, x, y, 2, 2);
  painter.rect(color.parchment, x - 1, y - 1, 4, 1);
  painter.rect(coat, x - 1, y + 2, 4, 4);
  painter.rect(color.ink, x, y + 6, 1, 2);
  painter.rect(color.ink, x + 1, y + 6, 1, 2);
  painter.rect(color.woodPale, x + 3, y + 3, 1, 1);
  painter.rect(color.emberBright, x + 3, y + 4, 2, 2);
  painter.rect(color.gold, x + 3, y + 4, 1, 1);
  painter.rect(color.gold, x + 2, y + 8, 5, 1);
}

function paintOldFarmerWithBread(painter: ScenePainter, x: number, y: number): void {
  painter.rect(color.ink, x + 3, y + 28, 14, 2);
  painter.rect(color.woodDark, x + 4, y + 20, 5, 9);
  painter.rect(color.woodDark, x + 11, y + 20, 5, 9);
  painter.rect(color.woodLight, x + 2, y + 8, 16, 14);
  painter.rect(color.woodPale, x + 2, y + 8, 16, 2);
  painter.rect(color.woodMid, x + 2, y + 17, 16, 2);
  painter.rect(color.woodLight, x - 1, y + 10, 4, 6);
  painter.disc(color.dawnRose, x + 10, y + 3, 4);
  painter.rect(color.parchment, x + 6, y + 6, 9, 5);
  painter.rect(color.silver, x + 8, y + 8, 5, 3);
  painter.rect(color.ink, x + 8, y + 3, 1, 1);
  painter.rect(color.ink, x + 12, y + 3, 1, 1);
  painter.rect(color.parchment, x + 6, y - 2, 9, 1);
  painter.rect(color.woodPale, x + 3, y - 5, 15, 3);
  painter.rect(color.woodPale, x + 7, y - 7, 7, 2);
  painter.rect(color.woodDark, x + 7, y - 3, 7, 1);
  painter.rect(color.woodLight, x + 17, y + 12, 7, 3);
  painter.rect(color.dawnRose, x + 23, y + 11, 3, 4);
  painter.rect(color.copper, x + 21, y + 6, 11, 5);
  painter.rect(color.woodPale, x + 22, y + 5, 9, 1);
  painter.rect(color.gold, x + 23, y + 5, 6, 1);
  painter.rect(color.goldDark, x + 22, y + 10, 9, 1);
  painter.rect(color.goldDark, x + 25, y + 7, 1, 2);
  painter.rect(color.goldDark, x + 28, y + 7, 1, 2);
}

// Harvest fields at dusk. Toppled straw scarecrows lie in the stubble, farmers walk out with lanterns, and an old farmer offers bread.
export function drawScarecrowField(): PixelDrawing {
  const painter = createScenePainter();
  paintBands(painter, [color.nightSky, color.nightHorizon, color.dawnRose, color.copper, color.gold], HORIZON_Y + 4);
  paintStars(painter, color.moon, 5, 12);
  painter.disc(color.gold, 30, HORIZON_Y, 8);
  painter.rect(color.hillNight, 0, HORIZON_Y - 4, 46, 5);
  painter.rect(color.hillNight, 46, HORIZON_Y - 2, 30, 3);
  painter.rect(color.hillNight, 76, HORIZON_Y - 5, 52, 6);
  paintFarmhouse(painter, 92, HORIZON_Y - 10);
  paintWheatRows(painter);
  painter.rect(color.gold, 88, 36, 24, 1);
  paintToppledScarecrow(painter, 4, 44, 14);
  paintToppledScarecrow(painter, 86, 47, 10);
  paintToppledScarecrow(painter, 104, 58, 16);
  paintLanternFarmer(painter, 78, 38, color.green);
  paintLanternFarmer(painter, 108, 46, color.crimson);
  paintLanternFarmer(painter, 20, 40, color.stone);
  paintOldFarmerWithBread(painter, 48, 40);
  return painter.drawing;
}
