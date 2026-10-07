import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, paintAnvil, type ScenePainter } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

function paintShopWalls(painter: ScenePainter): void {
  painter.rect(color.nightDeep, 0, 0, 128, 72);
  for (let row = 0; row < 7; row++) painter.rect(color.nightSky, 0, row * 10 + 6, 128, 1);
  painter.rect(color.woodDark, 0, 0, 128, 4);
  painter.rect(color.woodMid, 0, 62, 128, 10);
  painter.rect(color.woodDark, 0, 62, 128, 1);
  painter.rect(color.nightHorizon, 98, 12, 20, 16);
  painter.rect(color.ink, 107, 12, 2, 16);
  painter.rect(color.ink, 98, 19, 20, 2);
  painter.disc(color.moon, 104, 16, 1);
}

function paintHearth(painter: ScenePainter): void {
  painter.rect(color.hearthStone, 4, 20, 38, 44);
  painter.rect(color.stoneDark, 4, 20, 38, 3);
  [[4, 30], [22, 38], [6, 48], [26, 56]].forEach(([x, y]) => painter.rect(color.stoneDark, x as number, y as number, 14, 1));
  painter.rect(color.ink, 10, 32, 26, 32);
  painter.rect(color.ember, 12, 50, 22, 14);
  painter.rect(color.emberBright, 15, 44, 16, 20);
  painter.rect(color.gold, 19, 50, 8, 14);
  painter.rect(color.parchment, 22, 56, 3, 8);
  painter.rect(color.ember, 44, 54, 12, 10);
  painter.rect(color.ember, 46, 52, 8, 2);
}

function paintHeroCloak(painter: ScenePainter): void {
  painter.rect(color.crimson, 14, 48, 12, 18);
  painter.rect(color.ember, 14, 48, 3, 18);
  painter.disc(color.skin, 22, 44, 3);
  painter.rect(color.woodDark, 19, 40, 7, 3);
  painter.rect(color.ink, 23, 44, 1, 1);
}

function paintSmith(painter: ScenePainter): void {
  painter.rect(color.woodLight, 66, 42, 10, 14);
  painter.rect(color.copper, 66, 42, 10, 2);
  painter.rect(color.woodDark, 67, 56, 3, 8);
  painter.rect(color.woodDark, 72, 56, 3, 8);
  painter.disc(color.skin, 71, 37, 3);
  painter.rect(color.woodDark, 68, 33, 7, 2);
  painter.rect(color.copper, 68, 40, 7, 3);
  painter.rect(color.skin, 76, 40, 8, 2);
  painter.rect(color.woodPale, 82, 28, 2, 14);
  painter.rect(color.silver, 79, 26, 8, 4);
}

function paintBladeAndSparks(painter: ScenePainter): void {
  painter.rect(color.silver, 80, 49, 30, 2);
  painter.rect(color.parchment, 82, 49, 26, 1);
  painter.rect(color.emberBright, 80, 49, 8, 2);
  painter.rect(color.woodPale, 110, 48, 6, 4);
  [[78, 42], [88, 40], [92, 44], [74, 46], [96, 38], [84, 36], [100, 42]].forEach(([x, y], index) =>
    painter.rect(index % 2 ? color.gold : color.emberBright, x as number, y as number, 1, 1));
}

export function drawFirstSword(): PixelDrawing {
  const painter = createScenePainter();
  paintShopWalls(painter);
  paintHearth(painter);
  paintAnvil(painter, 78, 51, color.silver, color.stone);
  painter.rect(color.woodDark, 84, 65, 16, 6);
  paintSmith(painter);
  paintBladeAndSparks(painter);
  paintHeroCloak(painter);
  painter.rect(color.emberBright, 42, 62, 36, 1);
  return painter.drawing;
}
