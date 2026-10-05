import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter, paintBands, paintStars } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

function paintWingedShadow(painter: ScenePainter): void {
  painter.rect(color.ink, 92, 24, 9, 4);
  painter.rect(color.ink, 89, 23, 3, 3);
  painter.rect(color.ink, 101, 27, 7, 2);
  for (let step = 0; step < 12; step++) {
    const lift = Math.floor(step * 0.7);
    painter.rect(color.ink, 91 - step, 24 - lift, 1, 3);
    painter.rect(color.ink, 100 + step, 24 - lift, 1, 3);
  }
}

// Midsummer night: the north tower with a broken window, and the winged shadow that carried the princess east.
export function drawBrokenTower(): PixelDrawing {
  const painter = createScenePainter();
  paintBands(painter, [color.nightDeep, color.nightSky, color.nightHorizon], 62);
  paintStars(painter, color.parchment, 24, 40);
  painter.disc(color.moon, 98, 22, 9);
  paintWingedShadow(painter);
  painter.rect(color.hillNight, 0, 62, 128, 10);
  painter.rect(color.stone, 6, 52, 58, 12);
  for (let tooth = 0; tooth < 8; tooth++) painter.rect(color.stone, 6 + tooth * 8, 48, 4, 4);
  painter.rect(color.stone, 28, 16, 18, 38);
  for (let tooth = 0; tooth < 4; tooth++) painter.rect(color.stone, 28 + tooth * 5, 12, 3, 4);
  painter.rect(color.woodMid, 28, 16, 2, 38);
  painter.rect(color.ink, 34, 24, 5, 9);
  [[40, 30], [42, 34], [41, 38]].forEach(([x, y]) => painter.rect(color.stone, x as number, y as number, 1, 2));
  painter.rect(color.parchment, 33, 28, 1, 9);
  painter.rect(color.gold, 12, 56, 2, 3);
  painter.rect(color.gold, 52, 56, 2, 3);
  [[48, 40], [56, 48], [44, 56]].forEach(([x, y]) => painter.rect(color.ink, x as number, y as number, 1, 3));
  return painter.drawing;
}
