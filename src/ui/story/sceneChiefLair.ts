import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter, SCENE_WIDTH } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

function paintCaveBackground(painter: ScenePainter): void {
  painter.rect(color.ink, 0, 0, SCENE_WIDTH, 72);
  painter.rect(color.woodDark, 0, 8, SCENE_WIDTH, 50);
  for (let index = 0; index < 16; index++) painter.rect(color.woodMid, (index * 31 + 7) % 120, (index * 17 + 10) % 40 + 8, 3, 1);
  painter.rect(color.woodMid, 0, 58, SCENE_WIDTH, 14);
  painter.rect(color.woodDark, 0, 58, SCENE_WIDTH, 1);
}

function paintTornBanner(painter: ScenePainter, x: number, length: number): void {
  painter.rect(color.woodPale, x - 1, 6, 12, 1);
  painter.rect(color.crimson, x, 7, 10, length);
  painter.rect(color.ember, x + 4, 7, 1, length);
  for (let tooth = 0; tooth < 5; tooth++) painter.rect(color.crimson, x + tooth * 2, 7 + length, 1, tooth % 2 + 1);
  painter.rect(color.woodDark, x + 7, 7 + length - 6, 3, 6);
}

function paintCrateThrone(painter: ScenePainter): void {
  painter.rect(color.woodLight, 44, 34, 40, 26);
  painter.rect(color.woodPale, 40, 46, 16, 14);
  painter.rect(color.woodPale, 72, 46, 16, 14);
  painter.rect(color.woodMid, 48, 20, 32, 16);
  ([[44, 34, 40, 1], [64, 34, 1, 26], [40, 53, 48, 1], [47, 20, 1, 16], [64, 20, 1, 16], [48, 28, 32, 1]] as [number, number, number, number][]).forEach(([x, y, width, height]) => painter.rect(color.woodDark, x, y, width, height));
  ([[41, 48], [74, 49], [50, 22], [68, 22]] as [number, number][]).forEach(([x, y]) => painter.rect(color.silver, x, y, 1, 1));
}

function paintSlumpedChief(painter: ScenePainter): void {
  painter.rect(color.greenDark, 46, 36, 36, 20);
  painter.rect(color.green, 50, 33, 28, 18);
  painter.rect(color.greenDark, 54, 44, 20, 1);
  painter.rect(color.woodPale, 54, 37, 20, 3);
  painter.rect(color.copper, 66, 40, 3, 3);
  painter.rect(color.green, 42, 38, 8, 6);
  painter.rect(color.green, 78, 38, 8, 6);
  painter.rect(color.greenDark, 41, 43, 8, 3);
  painter.rect(color.greenDark, 79, 43, 8, 3);
  painter.rect(color.green, 40, 46, 5, 4);
  painter.rect(color.green, 83, 46, 5, 4);
  painter.rect(color.greenDark, 48, 52, 12, 8);
  painter.rect(color.greenDark, 68, 52, 12, 8);
  painter.rect(color.woodDark, 46, 58, 15, 3);
  painter.rect(color.woodDark, 67, 58, 15, 3);
  painter.rect(color.green, 55, 25, 18, 14);
  painter.rect(color.greenDark, 55, 36, 18, 3);
  painter.rect(color.green, 53, 29, 3, 5);
  painter.rect(color.green, 72, 29, 3, 5);
  painter.rect(color.ink, 58, 32, 3, 1);
  painter.rect(color.ink, 67, 32, 3, 1);
  painter.rect(color.crimson, 62, 28, 1, 5);
  painter.rect(color.parchment, 59, 36, 1, 2);
  painter.rect(color.parchment, 68, 36, 1, 2);
  painter.rect(color.silver, 56, 21, 16, 4);
  [56, 60, 64, 68].forEach((x) => painter.rect(color.silver, x, 18, 3, 3));
  painter.rect(color.stone, 56, 24, 16, 1);
}

function paintBones(painter: ScenePainter): void {
  painter.rect(color.parchment, 96, 62, 8, 2);
  painter.disc(color.parchment, 106, 63, 2);
  painter.rect(color.ink, 105, 62, 1, 1);
  painter.rect(color.parchment, 14, 60, 6, 1);
  painter.rect(color.parchment, 100, 66, 10, 1);
  painter.rect(color.stone, 30, 62, 3, 2);
}

function paintDimFire(painter: ScenePainter): void {
  painter.rect(color.hearthStone, 104, 54, 16, 6);
  painter.rect(color.woodDark, 106, 51, 12, 3);
  painter.rect(color.ember, 109, 49, 5, 4);
  painter.rect(color.emberBright, 110, 50, 3, 2);
  painter.rect(color.copper, 111, 46, 1, 1);
  painter.rect(color.woodMid, 96, 40, 28, 8);
  painter.rect(color.woodMid, 100, 32, 20, 8);
}

function paintHeroIntrusion(painter: ScenePainter): void {
  painter.rect(color.woodDark, 0, 54, 24, 18);
  painter.rect(color.woodMid, 0, 56, 22, 14);
  painter.rect(color.woodPale, 0, 58, 20, 4);
  painter.rect(color.ink, 0, 68, 24, 4);
  painter.rect(color.silver, 22, 63, 12, 1);
  painter.rect(color.stone, 22, 64, 10, 1);
  painter.rect(color.silver, 33, 63, 2, 1);
  painter.rect(color.crimson, 2, 52, 14, 6);
}

// The Goblin Chief after the fight: slumped on a crate throne, a hero's boot and sword tip at the edge.
export function drawChiefLair(): PixelDrawing {
  const painter = createScenePainter();
  paintCaveBackground(painter);
  paintTornBanner(painter, 22, 24);
  paintTornBanner(painter, 96, 18);
  paintDimFire(painter);
  paintCrateThrone(painter);
  paintSlumpedChief(painter);
  paintBones(painter);
  paintHeroIntrusion(painter);
  return painter.drawing;
}
