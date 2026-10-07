import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter, paintBands, paintStars, SCENE_HEIGHT, SCENE_WIDTH } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

const WATER_Y = 46;

function paintFarTrees(painter: ScenePainter): void {
  painter.rect(color.hillNight, 0, 30, SCENE_WIDTH, WATER_Y - 30);
  for (let x = 0; x < SCENE_WIDTH; x += 7) painter.rect(color.nightDeep, x, 24 + (x * 5) % 9, 6, 22 - (x * 5) % 9);
  for (let x = 3; x < 56; x += 7) painter.disc(color.nightDeep, x, 30 + (x % 4), 4);
}

function paintMillBuilding(painter: ScenePainter): void {
  painter.rect(color.stone, 70, 24, 30, 24);
  painter.rect(color.silver, 70, 24, 30, 1);
  painter.rect(color.woodMid, 70, 24, 30, 6);
  painter.rect(color.woodDark, 70, 29, 30, 1);
  ([[74, 33], [84, 36], [92, 33], [76, 41], [88, 43]] as const).forEach(([x, y]) => painter.rect(color.woodPale, x, y, 4, 2));
  painter.rect(color.woodLight, 69, 24, 2, 24);
  painter.rect(color.woodLight, 99, 24, 2, 24);
  painter.rect(color.ink, 66, 20, 38, 3);
  painter.rect(color.woodDark, 69, 16, 32, 4);
  painter.rect(color.ink, 76, 13, 18, 3);
  painter.rect(color.woodPale, 69, 20, 32, 1);
  painter.rect(color.ink, 80, 33, 9, 15);
  painter.rect(color.gold, 81, 34, 7, 3);
  painter.rect(color.emberBright, 91, 28, 5, 4);
  painter.rect(color.ink, 93, 28, 1, 4);
}

function paintWaterWheel(painter: ScenePainter): void {
  painter.rect(color.woodDark, 60, 25, 14, 3);
  painter.disc(color.woodDark, 62, 38, 11);
  painter.disc(color.hillNight, 62, 38, 8);
  painter.disc(color.nightDeep, 62, 38, 7);
  for (let spoke = -9; spoke <= 9; spoke++) {
    painter.rect(color.woodLight, 62 + spoke, 38, 1, 1);
    painter.rect(color.woodLight, 62, 38 + spoke, 1, 1);
    painter.rect(color.woodMid, 62 + Math.round(spoke * 0.7), 38 + Math.round(spoke * 0.7), 1, 1);
    painter.rect(color.woodMid, 62 + Math.round(spoke * 0.7), 38 - Math.round(spoke * 0.7), 1, 1);
  }
  painter.disc(color.woodPale, 62, 38, 2);
  for (let paddle = 0; paddle < 8; paddle++) {
    const angle = (paddle * Math.PI) / 4;
    painter.rect(color.woodPale, Math.round(62 + Math.cos(angle) * 11) - 1, Math.round(38 + Math.sin(angle) * 11) - 1, 3, 3);
  }
  painter.rect(color.silver, 52, 42, 3, 1);
  painter.rect(color.silver, 53, 46, 1, 2);
}

function paintPond(painter: ScenePainter): void {
  painter.rect(color.nightSky, 0, WATER_Y, SCENE_WIDTH, SCENE_HEIGHT - WATER_Y);
  painter.rect(color.nightDeep, 0, WATER_Y + 8, SCENE_WIDTH, SCENE_HEIGHT - WATER_Y - 8);
  painter.rect(color.woodDark, 70, WATER_Y, 30, 3);
  painter.rect(color.woodMid, 72, WATER_Y + 3, 26, 3);
  painter.rect(color.emberBright, 82, WATER_Y + 3, 3, 1);
  painter.rect(color.gold, 83, WATER_Y + 5, 1, 4);
  for (let x = 2; x < SCENE_WIDTH; x += 11) painter.rect(color.nightHorizon, x, WATER_Y + 4 + (x % 5) * 3, 6, 1);
  ([[14, 60], [30, 64], [22, 56], [48, 66]] as const).forEach(([x, y]) => {
    painter.rect(color.green, x, y, 5, 2);
    painter.rect(color.hillNight, x + 1, y + 2, 3, 1);
  });
  painter.rect(color.crimson, 24, 55, 1, 1);
}

function paintBrookAndMist(painter: ScenePainter): void {
  for (let y = 30; y < WATER_Y; y++) {
    painter.rect(color.nightHorizon, 12 + Math.floor((y - 30) / 3), y, 4 + (y - 30) / 4, 1);
    painter.rect(color.silver, 13 + Math.floor((y - 30) / 3), y, 1, 1);
  }
  for (let x = 0; x < 62; x += 9) {
    painter.rect(color.silver, x, WATER_Y - 4 + (x % 3) * 2, 5, 1);
    painter.rect(color.nightHorizon, x + 3, WATER_Y - 3 + (x % 2) * 3, 7, 1);
    painter.rect(color.silver, x + 2, WATER_Y + 3 + (x % 4), 3, 1);
  }
}

function paintMillerWithPie(painter: ScenePainter): void {
  painter.rect(color.stone, 82, 36, 5, 12);
  painter.rect(color.parchment, 81, 38, 7, 9);
  painter.rect(color.dawnRose, 83, 31, 3, 3);
  painter.rect(color.parchment, 82, 29, 5, 2);
  painter.rect(color.ink, 83, 32, 1, 1);
  painter.rect(color.ink, 85, 32, 1, 1);
  painter.rect(color.dawnRose, 87, 40, 3, 2);
  painter.rect(color.silver, 89, 41, 6, 1);
  painter.rect(color.copper, 89, 39, 7, 2);
  painter.rect(color.goldDark, 90, 38, 5, 1);
  painter.rect(color.gold, 91, 38, 3, 1);
}

// A watermill at evening. A calm cold pond, a brook from dark trees with pale mist, and the miller with a pie.
export function drawSunkenMill(): PixelDrawing {
  const painter = createScenePainter();
  paintBands(painter, [color.nightSky, color.nightHorizon, color.dawnRose, color.copper], 34);
  paintStars(painter, color.moon, 8, 14);
  paintFarTrees(painter);
  paintMillBuilding(painter);
  paintWaterWheel(painter);
  paintPond(painter);
  paintBrookAndMist(painter);
  paintMillerWithPie(painter);
  painter.rect(color.woodMid, 66, 48, 40, 1);
  painter.rect(color.hillNight, 100, 46, 28, 3);
  painter.rect(color.hillNight, 0, SCENE_HEIGHT - 2, SCENE_WIDTH, 2);
  return painter.drawing;
}
