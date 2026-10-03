import type { ClassLook } from '../../../content/heroAppearance';
import { LEATHER, type Paint } from '../figureColors';

// The figure is centred between columns 19 and 20. Every row is drawn as a pair of mirrored halves.
function paintCentred(paint: Paint, color: string, leftColumn: number, y: number, height = 1): void {
  paint(color, leftColumn, y, 40 - 2 * leftColumn, height);
}

// A fitted tunic with a narrow waist and a small flare at the hem, then slim legs and boots.
// It replaces the wide base torso and legs, which the caller erases first.
export function drawSlimTunicAndLegs(paint: Paint, look: ClassLook): void {
  paintCentred(paint, look.cloth, 13, 20, 3);
  paintCentred(paint, look.cloth, 15, 23, 4);
  paintCentred(paint, look.cloth, 16, 27, 3);
  paintCentred(paint, look.clothShade, 16, 30, 1);
  paintCentred(paint, LEATHER, 16, 31, 1);
  paint(look.trim, 19, 31, 2, 1);
  paintCentred(paint, look.cloth, 15, 32, 3);
  paintCentred(paint, look.cloth, 14, 35, 2);
  paintCentred(paint, look.clothShade, 14, 37, 2);
  paintCentred(paint, look.trim, 14, 38, 1);

  [15, 21].forEach((leftColumn) => {
    paint(look.clothShade, leftColumn, 39, 4, 7);
    paint(LEATHER, leftColumn, 46, 4, 9);
    paint(look.trim, leftColumn, 46, 4, 1);
    paint(LEATHER, leftColumn - 1, 55, 5, 6);
    paint(look.trim, leftColumn, 55, 4, 1);
  });
}
