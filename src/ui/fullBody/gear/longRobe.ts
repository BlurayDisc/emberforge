import type { HeroAppearance } from '../../../content/heroAppearance';
import { LEATHER, type Paint } from '../figureColors';

export function drawLongRobe(paint: Paint, { look }: HeroAppearance): void {
  paint(look.cloth, 10, 20, 20, 38);
  paint(look.clothShade, 19, 38, 2, 19);
  paint(look.clothShade, 13, 44, 1, 13);
  paint(look.clothShade, 26, 44, 1, 13);
  paint(look.clothShade, 14, 20, 12, 2);
  paint(look.trim, 10, 36, 20, 2);
  paint(look.trim, 10, 57, 20, 1);
  paint(LEATHER, 14, 58, 5, 3);
  paint(LEATHER, 21, 58, 5, 3);
  paint(look.cloth, 5, 28, 6, 9);
  paint(look.cloth, 29, 28, 6, 9);
  paint(look.clothShade, 5, 34, 6, 2);
  paint(look.clothShade, 29, 34, 6, 2);
  paint(look.trim, 5, 36, 6, 1);
  paint(look.trim, 29, 36, 6, 1);
}
