import type { PixelCanvas } from '../pixelCanvas';
import { BONE, GOLD, LEATHER, RUSTED_IRON, WOOD } from './goblinChiefColors';
import { ditherRect, flatPolygon, line, shadedPolygon } from './goblinChiefShapes';

export function drawMaulHaft(art: PixelCanvas): void {
  shadedPolygon(art, [[66, 24], [71, 24], [73, 67], [68, 67]], WOOD);
  for (let wrapY = 32; wrapY < 58; wrapY += 5) line(art, LEATHER.dark, [67, wrapY], [72, wrapY + 2]);
  art.fill(GOLD.base, 68, 65, 5, 2);
}

export function drawMaulHead(art: PixelCanvas): void {
  flatPolygon(art, [[63, 9], [65, 1], [68, 9]], RUSTED_IRON.base);
  flatPolygon(art, [[71, 9], [74, 0], [77, 9]], RUSTED_IRON.light);
  flatPolygon(art, [[78, 12], [79, 16], [78, 21]], RUSTED_IRON.base);
  flatPolygon(art, [[60, 12], [57, 17], [60, 22]], RUSTED_IRON.dark);
  shadedPolygon(art, [[60, 9], [78, 9], [79, 25], [60, 25]], RUSTED_IRON);
  art.fill(RUSTED_IRON.light, 61, 10, 16, 1);
  art.fill(RUSTED_IRON.light, 60, 11, 1, 12);
  ditherRect(art, '#7a3b22', 68, 17, 10, 7);
  art.fill(RUSTED_IRON.dark, 62, 12, 1, 5);
  art.fill(RUSTED_IRON.light, 70, 12, 2, 1);
  art.fill(GOLD.dark, 60, 19, 19, 2);
  art.fill(GOLD.base, 60, 19, 19, 1);
  art.fill(GOLD.light, 60, 19, 6, 1);
  art.fill(BONE.base, 67, 26, 4, 3);
  art.fill(BONE.dark, 68, 27, 2, 1);
}
