import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, paintAnvil, paintBands } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

// The small shop in Hollowbrook at dusk, with a lit window and an anvil outside.
export function drawSmithShop(): PixelDrawing {
  const painter = createScenePainter();
  paintBands(painter, [color.nightSky, color.nightHorizon, color.dawnRose, color.copper], 48);
  painter.rect(color.hillNight, 0, 44, 128, 28);
  painter.rect(color.woodMid, 0, 62, 128, 10);
  painter.rect(color.woodLight, 24, 30, 52, 32);
  for (let plank = 0; plank < 6; plank++) painter.rect(color.woodMid, 24 + plank * 9, 30, 1, 32);
  for (let row = 0; row < 12; row++) painter.rect(color.crimson, 50 - (4 + row * 2) - 2, 17 + row, 2 * (4 + row * 2) + 4, 1);
  painter.rect(color.woodDark, 30, 8, 7, 14);
  [[31, 4], [33, 1], [32, -2]].forEach(([x, y]) => painter.rect(color.stone, x as number, Math.max(y as number, 0), 3, 2));
  painter.rect(color.ink, 40, 42, 11, 20);
  painter.rect(color.goldDark, 48, 52, 1, 2);
  painter.rect(color.ink, 55, 36, 15, 12);
  painter.rect(color.gold, 56, 37, 13, 10);
  painter.rect(color.ink, 62, 37, 1, 10);
  painter.rect(color.ink, 56, 41, 13, 1);
  painter.rect(color.woodPale, 76, 33, 12, 1);
  painter.rect(color.woodPale, 78, 34, 1, 3);
  painter.rect(color.woodPale, 78, 36, 10, 9);
  painter.rect(color.silver, 80, 39, 6, 2);
  painter.rect(color.silver, 82, 39, 2, 5);
  paintAnvil(painter, 92, 52, color.silver, color.stone);
  return painter.drawing;
}
