import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter, SCENE_WIDTH } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

function paintBanner(painter: ScenePainter, x: number): void {
  painter.rect(color.crimson, x, 8, 14, 28);
  painter.rect(color.gold, x, 8, 14, 2);
  painter.rect(color.crimson, x + 3, 36, 8, 3);
  painter.rect(color.crimson, x + 5, 39, 4, 2);
  painter.rect(color.gold, x + 5, 18, 4, 4);
}

// King Aldric on his throne. The small white-oak throne of the princess stands empty, with a flower on it.
export function drawThroneHall(): PixelDrawing {
  const painter = createScenePainter();
  painter.rect(color.woodDark, 0, 0, SCENE_WIDTH, 72);
  painter.rect(color.woodMid, 0, 52, SCENE_WIDTH, 20);
  for (let row = 0; row < 5; row++) painter.rect(color.woodDark, 0, 54 + row * 4, SCENE_WIDTH, 1);
  paintBanner(painter, 10);
  paintBanner(painter, 104);
  painter.rect(color.crimson, 50, 52, 28, 20);
  painter.rect(color.gold, 50, 52, 1, 20);
  painter.rect(color.gold, 77, 52, 1, 20);
  painter.rect(color.woodLight, 52, 12, 24, 34);
  painter.rect(color.goldDark, 52, 12, 24, 2);
  painter.rect(color.woodPale, 55, 16, 18, 28);
  painter.rect(color.crimson, 58, 32, 12, 16);
  painter.rect(color.parchment, 61, 23, 6, 6);
  painter.rect(color.silver, 61, 28, 6, 3);
  painter.rect(color.gold, 60, 19, 8, 3);
  [60, 63, 66].forEach((x) => painter.rect(color.gold, x, 17, 2, 2));
  painter.rect(color.ink, 62, 25, 1, 1);
  painter.rect(color.ink, 65, 25, 1, 1);
  painter.rect(color.woodLight, 52, 46, 24, 6);
  painter.rect(color.parchment, 86, 38, 10, 14);
  painter.rect(color.woodPale, 86, 48, 10, 4);
  painter.rect(color.green, 90, 42, 1, 6);
  painter.rect(color.crimson, 89, 40, 3, 3);
  return painter.drawing;
}
