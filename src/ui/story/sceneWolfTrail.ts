import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter, paintBands, SCENE_HEIGHT, SCENE_WIDTH } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

const TREE_LINE_Y = 34;

function paintOldTree(painter: ScenePainter, x: number, crownY: number, trunkWidth: number): void {
  painter.rect(color.ink, x, crownY, trunkWidth, TREE_LINE_Y - crownY);
  painter.rect(color.nightSky, x, crownY + 6, 1, 10);
  painter.disc(color.hillNight, x + 1, crownY, 8);
  painter.disc(color.nightDeep, x + 2, crownY + 2, 7);
  painter.disc(color.hillNight, x - 3, crownY - 3, 3);
}

function paintOldWood(painter: ScenePainter): void {
  painter.rect(color.nightDeep, 0, 12, SCENE_WIDTH, TREE_LINE_Y - 12);
  for (let x = 2; x < SCENE_WIDTH; x += 9) paintOldTree(painter, x, 14 + (x * 7) % 9, 3 + (x % 3));
  for (let x = 6; x < SCENE_WIDTH; x += 13) painter.rect(color.ink, x, 22, 3, 12);
  painter.rect(color.ink, 0, TREE_LINE_Y - 3, SCENE_WIDTH, 4);
}

function paintTreeLineMist(painter: ScenePainter): void {
  for (let x = 0; x < SCENE_WIDTH; x += 10) {
    painter.rect(color.silver, x, TREE_LINE_Y - 2 + (x % 3), 4, 1);
    painter.rect(color.nightHorizon, x + 4, TREE_LINE_Y + (x % 2) * 2, 6, 1);
  }
}

function brookCenterX(y: number): number {
  return Math.round(92 + (y - TREE_LINE_Y) * 0.55);
}

function paintBrook(painter: ScenePainter): void {
  for (let y = TREE_LINE_Y; y < SCENE_HEIGHT; y++) {
    const halfWidth = 2 + Math.floor((y - TREE_LINE_Y) / 3);
    painter.rect(color.woodDark, brookCenterX(y) - halfWidth - 1, y, 2 * halfWidth + 2, 1);
    painter.rect(color.nightHorizon, brookCenterX(y) - halfWidth, y, 2 * halfWidth, 1);
    if (y % 4 === 0) painter.rect(color.silver, brookCenterX(y) - halfWidth + 2 + (y % 8), y, 3, 1);
  }
}

function paintTrail(painter: ScenePainter): void {
  for (let y = TREE_LINE_Y; y < SCENE_HEIGHT; y++) {
    const progress = (y - TREE_LINE_Y) / (SCENE_HEIGHT - TREE_LINE_Y);
    const centerX = Math.round(60 - 20 * progress);
    const halfWidth = Math.round(3 + progress * 26);
    painter.rect(color.woodMid, centerX - halfWidth - 1, y, 2 * halfWidth + 2, 1);
    painter.rect(color.woodLight, centerX - halfWidth, y, 2 * halfWidth, 1);
    if (y % 3 === 0) painter.rect(color.woodDark, centerX - halfWidth + 3 + (y % 7), y, 3, 1);
  }
}

function paintPawPrint(painter: ScenePainter, x: number, y: number): void {
  painter.rect(color.woodDark, x, y + 1, 2, 2);
  painter.rect(color.woodDark, x - 1, y, 1, 1);
  painter.rect(color.woodDark, x + 2, y, 1, 1);
}

function paintPawPrintTrack(painter: ScenePainter): void {
  for (let step = 0; step < 9; step++) {
    const y = TREE_LINE_Y + 3 + step * 4;
    const progress = (y - TREE_LINE_Y) / (SCENE_HEIGHT - TREE_LINE_Y);
    const centerX = Math.round(60 - 20 * progress);
    paintPawPrint(painter, centerX + (step % 2 ? 3 : -3) + Math.round(progress * 6), y);
  }
}

function paintKneelingHero(painter: ScenePainter, x: number, y: number): void {
  painter.rect(color.ink, x - 1, y + 17, 12, 2);
  painter.rect(color.woodDark, x + 6, y + 13, 5, 5);
  painter.rect(color.woodDark, x + 1, y + 15, 7, 3);
  painter.rect(color.crimson, x, y + 4, 9, 12);
  painter.rect(color.ember, x + 1, y + 4, 2, 11);
  painter.rect(color.woodDark, x + 6, y + 5, 3, 11);
  painter.rect(color.crimson, x + 1, y + 2, 7, 3);
  painter.disc(color.dawnRose, x + 5, y + 1, 2);
  painter.rect(color.woodPale, x + 3, y - 2, 5, 2);
  painter.rect(color.dawnRose, x + 9, y + 8, 3, 2);
  painter.rect(color.silver, x + 12, y + 7, 1, 11);
  painter.rect(color.parchment, x + 12, y + 7, 1, 8);
  painter.rect(color.goldDark, x + 10, y + 7, 5, 1);
  painter.rect(color.woodPale, x + 12, y + 5, 1, 2);
}

function paintDeadWolf(painter: ScenePainter, x: number, y: number): void {
  painter.rect(color.nightDeep, x - 2, y + 7, 26, 2);
  painter.rect(color.stone, x + 4, y + 2, 14, 5);
  painter.rect(color.silver, x + 5, y + 2, 12, 1);
  for (let rib = 0; rib < 4; rib++) painter.rect(color.ink, x + 6 + rib * 3, y + 3, 1, 3);
  painter.rect(color.stone, x - 3, y + 3, 7, 4);
  painter.rect(color.stone, x - 6, y + 5, 4, 2);
  painter.rect(color.ink, x - 1, y + 4, 1, 1);
  painter.rect(color.stone, x + 17, y + 3, 7, 2);
  painter.rect(color.silver, x + 22, y + 3, 4, 1);
  painter.rect(color.stone, x + 6, y + 7, 1, 3);
  painter.rect(color.stone, x + 14, y + 7, 1, 3);
}

// Dusk on a trail along a brook. One hero kneels by paw prints that run out of the Old Wood. A thin wolf lies dead nearby.
export function drawWolfTrail(): PixelDrawing {
  const painter = createScenePainter();
  painter.rect(color.nightHorizon, 0, 0, SCENE_WIDTH, TREE_LINE_Y);
  paintBands(painter, [color.nightSky, color.nightHorizon, color.dawnRose], 16);
  painter.rect(color.hillNight, 0, TREE_LINE_Y, SCENE_WIDTH, SCENE_HEIGHT - TREE_LINE_Y);
  paintOldWood(painter);
  paintBrook(painter);
  paintTrail(painter);
  paintPawPrintTrack(painter);
  paintTreeLineMist(painter);
  paintDeadWolf(painter, 66, 56);
  paintKneelingHero(painter, 22, 46);
  return painter.drawing;
}
