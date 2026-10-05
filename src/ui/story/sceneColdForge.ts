import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, paintAnvil, SCENE_WIDTH } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

// The dwarf-smiths' forge after the Long Dark: cold stone, a few last coals.
export function drawColdForge(): PixelDrawing {
  const painter = createScenePainter();
  painter.rect(color.woodDark, 0, 0, SCENE_WIDTH, 72);
  for (let row = 0; row < 8; row++) painter.rect(color.woodMid, 0, row * 9 + 8, SCENE_WIDTH, 1);
  painter.rect(color.stone, 56, 0, 18, 22);
  painter.rect(color.ink, 61, 0, 8, 22);
  painter.rect(color.stone, 38, 20, 54, 44);
  painter.rect(color.woodMid, 38, 20, 54, 3);
  painter.rect(color.ink, 49, 32, 32, 32);
  [[56, 58], [60, 56], [66, 59], [71, 57], [63, 61]].forEach(([x, y]) => painter.rect(color.emberBright, x as number, y as number, 2, 2));
  [[58, 55], [68, 56], [74, 60]].forEach(([x, y]) => painter.rect(color.ember, x as number, y as number, 1, 1));
  painter.rect(color.woodMid, 0, 64, SCENE_WIDTH, 8);
  painter.rect(color.woodDark, 0, 64, SCENE_WIDTH, 1);
  paintAnvil(painter, 98, 50, color.silver, color.stone);
  painter.rect(color.woodPale, 14, 60, 18, 2);
  painter.rect(color.silver, 11, 57, 5, 7);
  return painter.drawing;
}
