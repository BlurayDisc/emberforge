import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter, paintBands, SCENE_HEIGHT } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

const HORIZON_Y = 40;

function paintFeather(painter: ScenePainter, x: number, y: number, size: number): void {
  painter.rect(color.ink, x, y, 1, 2 * size + 2);
  painter.rect(color.ink, x + 1, y + 1, size, size + 1);
  painter.rect(color.stone, x - 1, y + size, 1, 1);
}

// The road east at sunrise. Black feathers lead along it toward a thin dark tower on the horizon.
export function drawRoadEast(): PixelDrawing {
  const painter = createScenePainter();
  paintBands(painter, [color.nightSky, color.nightHorizon, color.dawnRose, color.copper, color.gold], HORIZON_Y + 4);
  painter.disc(color.gold, 96, HORIZON_Y, 9);
  painter.rect(color.hillNight, 0, HORIZON_Y, 128, SCENE_HEIGHT - HORIZON_Y);
  [[0, 36, 30, 4], [24, 34, 28, 6], [100, 35, 28, 5]].forEach(([x, y, width, height]) => painter.rect(color.hillNight, x as number, y as number, width as number, height as number));
  painter.rect(color.ink, 113, 22, 3, 18);
  painter.rect(color.ink, 112, 20, 5, 3);
  [[114, 15], [115, 11], [114, 7]].forEach(([x, y]) => painter.rect(color.stone, x as number, y as number, 1, 3));
  for (let y = HORIZON_Y; y < SCENE_HEIGHT; y++) {
    const progress = (y - HORIZON_Y) / (SCENE_HEIGHT - HORIZON_Y);
    const centerX = Math.round(92 - 36 * progress);
    const halfWidth = Math.round(1 + progress * 22);
    painter.rect(color.woodLight, centerX - halfWidth - 1, y, 2 * halfWidth + 2, 1);
    painter.rect(color.woodPale, centerX - halfWidth, y, 2 * halfWidth, 1);
  }
  paintFeather(painter, 58, 60, 3);
  paintFeather(painter, 70, 51, 2);
  paintFeather(painter, 81, 45, 1);
  return painter.drawing;
}
