import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter, paintBands, paintStars, SCENE_HEIGHT, SCENE_WIDTH } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

const GROUND_Y = 50;
const FIRE_X = 64;

function paintPine(painter: ScenePainter, x: number, baseY: number, height: number, tone: string): void {
  painter.rect(color.woodDark, x, baseY - 3, 2, 3);
  for (let layer = 0; layer < 4; layer++) {
    const halfWidth = 2 + layer * 2;
    const top = baseY - height + layer * Math.floor(height / 4);
    painter.rect(tone, x + 1 - halfWidth, top + Math.floor(height / 4) - 2, 2 * halfWidth, Math.floor(height / 4) + 1);
    painter.rect(tone, x + 1 - Math.floor(halfWidth / 2), top, halfWidth, 3);
  }
}

function paintForest(painter: ScenePainter): void {
  for (let x = 2; x < SCENE_WIDTH; x += 9) paintPine(painter, x, GROUND_Y - 6, 26 + (x % 3) * 3, color.nightDeep);
  for (let x = 8; x < SCENE_WIDTH; x += 13) paintPine(painter, x, GROUND_Y, 30 + (x % 4) * 3, color.hillNight);
  painter.rect(color.hillNight, 0, GROUND_Y - 1, SCENE_WIDTH, 2);
}

function paintFire(painter: ScenePainter): void {
  painter.disc(color.woodMid, FIRE_X, GROUND_Y + 11, 9);
  painter.rect(color.woodDark, FIRE_X - 8, GROUND_Y + 9, 16, 3);
  painter.rect(color.ink, FIRE_X - 6, GROUND_Y + 10, 12, 2);
  painter.rect(color.woodPale, FIRE_X - 6, GROUND_Y + 7, 12, 2);
  painter.rect(color.woodPale, FIRE_X - 7, GROUND_Y + 8, 2, 2);
  painter.rect(color.ember, FIRE_X - 5, GROUND_Y + 2, 10, 6);
  painter.rect(color.ember, FIRE_X - 3, GROUND_Y - 2, 6, 5);
  painter.rect(color.emberBright, FIRE_X - 3, GROUND_Y + 2, 6, 5);
  painter.rect(color.emberBright, FIRE_X - 1, GROUND_Y - 5, 3, 6);
  painter.rect(color.gold, FIRE_X - 2, GROUND_Y + 4, 4, 3);
  painter.rect(color.parchment, FIRE_X - 1, GROUND_Y + 5, 2, 2);
  [[-6, -8], [5, -11], [-2, -14], [8, -6], [2, -18], [-9, -3]].forEach(([dx, dy], index) =>
    painter.rect(index % 2 ? color.gold : color.emberBright, FIRE_X + (dx as number), GROUND_Y + (dy as number), 1, 1));
}

function paintSeatedFigure(painter: ScenePainter, x: number, y: number, cloak: string, facing: 1 | -1): void {
  painter.rect(cloak, x, y + 4, 7, 9);
  painter.rect(color.ink, x + 1, y + 13, 6, 2);
  painter.disc(color.ink, x + 3, y + 1, 2);
  const lit = facing === 1 ? x + 5 : x;
  painter.rect(color.copper, lit, y + 5, 2, 8);
  painter.rect(color.dawnRose, x + (facing === 1 ? 4 : 2), y, 1, 2);
}

function paintSwordHero(painter: ScenePainter, x: number, y: number): void {
  paintSeatedFigure(painter, x, y, color.stone, 1);
  painter.rect(color.silver, x - 2, y - 12, 2, 20);
  painter.rect(color.parchment, x - 2, y - 12, 1, 18);
  painter.rect(color.goldDark, x - 4, y + 7, 6, 1);
  painter.rect(color.copper, x + 7, y + 3, 4, 1);
}

function paintArcher(painter: ScenePainter, x: number, y: number): void {
  paintSeatedFigure(painter, x, y, color.green, -1);
  painter.rect(color.woodPale, x - 3, y - 3, 1, 14);
  painter.rect(color.woodPale, x - 2, y - 4, 1, 2);
  painter.rect(color.woodPale, x - 2, y + 10, 1, 2);
  painter.rect(color.parchment, x - 4, y - 3, 1, 14);
  painter.rect(color.woodDark, x + 7, y + 1, 2, 7);
}

function paintSmith(painter: ScenePainter, x: number, y: number): void {
  paintSeatedFigure(painter, x, y, color.woodLight, 1);
  painter.rect(color.woodDark, x + 1, y + 6, 5, 7);
  painter.rect(color.woodPale, x + 1, y + 6, 5, 1);
  painter.rect(color.copper, x + 5, y + 6, 3, 2);
  painter.rect(color.woodMid, x + 1, y - 1, 5, 1);
}

function paintTalkingCompany(painter: ScenePainter): void {
  paintSwordHero(painter, 24, 53);
  paintSmith(painter, 42, 57);
  paintArcher(painter, 84, 56);
  painter.rect(color.parchment, 34, 50, 3, 1);
  painter.rect(color.parchment, 92, 51, 2, 2);
}

// Night camp beside a forest trail. A smith and two heroes talk around a fire under the stars.
export function drawCampfire(): PixelDrawing {
  const painter = createScenePainter();
  paintBands(painter, [color.nightDeep, color.nightSky, color.nightHorizon], GROUND_Y);
  paintStars(painter, color.moon, 22, 24);
  paintForest(painter);
  painter.rect(color.hillNight, 0, GROUND_Y, SCENE_WIDTH, SCENE_HEIGHT - GROUND_Y);
  painter.rect(color.woodDark, 0, GROUND_Y + 14, SCENE_WIDTH, SCENE_HEIGHT - GROUND_Y - 14);
  paintFire(painter);
  paintTalkingCompany(painter);
  return painter.drawing;
}
