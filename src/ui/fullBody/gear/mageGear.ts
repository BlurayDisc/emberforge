import { narrowEyes, paintBrows, paintMouth } from '../faceExpression';
import type { HeroAppearance } from '../../../content/heroAppearance';
import { ICE, ICE_DARK, LEATHER, WHITE, WOOD, type GearDrawer, type Paint } from '../figureColors';

const ORB_ROWS: ReadonlyArray<readonly [number, number, number]> = [
  [32, 1, 5], [31, 2, 7], [30, 3, 9], [30, 4, 9], [30, 5, 9], [30, 6, 9], [30, 7, 9], [31, 8, 7], [32, 9, 5],
];
const EYESHADOW = '#9a6ad8';
const EYELINER = '#1a0f1c';
const LIPSTICK = '#c01e3c';
const LIPSTICK_LIGHT = '#e0587a';
const BLUSH_ROSE = '#e8909a';

// Both eyes look the same way: white on the left, iris on the right of each pair.
function paintMadeUpEyes(paint: Paint, { skin }: HeroAppearance): void {
  [16, 22].forEach((x) => {
    paint(skin, x, 12, 2, 2);
    paint(EYESHADOW, x - 1, 11, 4, 1);
    paint(EYELINER, x, 12, 2, 1);
    paint(WHITE, x, 13, 1, 1);
    paint(ICE_DARK, x + 1, 13, 1, 1);
  });
  paint(EYELINER, 15, 12, 1, 1);
  paint(EYELINER, 24, 12, 1, 1);
}

function paintMakeup(paint: Paint, appearance: HeroAppearance): void {
  paintMadeUpEyes(paint, appearance);
  paint(BLUSH_ROSE, 15, 15, 2, 1);
  paint(BLUSH_ROSE, 23, 15, 2, 1);
  paint(LIPSTICK, 19, 16, 2, 1);
  paint(LIPSTICK_LIGHT, 19, 17, 2, 1);
}
const WAIST_Y = 33;
const HEM_Y = 58;
const CENTER_X = 20;

// A fitted bodice and a narrow waist, then a skirt that flares to the hem. It replaces the base figure body.
function drawFittedDress(paint: Paint, { look, skin, skinShade }: HeroAppearance): void {
  paint(skin, 16, 20, 8, 2);
  paint(skinShade, 18, 22, 4, 1);
  paint(look.cloth, 13, 22, 14, 5);
  paint(look.cloth, 14, 27, 12, 3);
  paint(look.cloth, 15, 30, 10, 3);
  paint(look.clothShade, 14, 25, 3, 1);
  paint(look.clothShade, 23, 25, 3, 1);
  paint(look.trim, 14, 21, 12, 1);
  paint(look.trim, 14, WAIST_Y, 12, 2);
  paint(ICE, 19, WAIST_Y, 2, 2);
  for (let y = WAIST_Y + 2; y < HEM_Y; y++) {
    const halfWidth = 6 + Math.round(((y - WAIST_Y) * 5) / (HEM_Y - WAIST_Y));
    paint(look.cloth, CENTER_X - halfWidth, y, halfWidth * 2, 1);
    paint(look.clothShade, CENTER_X - halfWidth, y, 1, 1);
    paint(look.clothShade, CENTER_X + halfWidth - 1, y, 1, 1);
  }
  paint(look.clothShade, 16, 42, 1, 15);
  paint(look.clothShade, 20, 42, 1, 15);
  paint(look.clothShade, 24, 40, 5, 1);
  paint(look.clothShade, 22, 45, 4, 13);
  paint(look.trim, 22, 45, 1, 13);
  paint(skin, 23, 46, 2, 11);
  paint(look.trim, 9, HEM_Y - 1, 22, 1);
  paint(LEATHER, 15, HEM_Y, 5, 3);
  paint(LEATHER, 21, HEM_Y, 5, 3);
}

export const drawMageGear: GearDrawer = (paint, appearance, erase) => {
  const { look, hair, skin, skinShade } = appearance;
  erase(5, 20, 31, 41);
  drawFittedDress(paint, appearance);

  paint(hair, 12, 9, 2, 18);
  paint(hair, 26, 9, 2, 18);
  paint(hair, 11, 20, 2, 9);
  paint(hair, 27, 20, 2, 9);

  paint(look.clothShade, 8, 7, 24, 2);
  paint(look.cloth, 13, 4, 14, 3);
  paint(look.cloth, 15, 2, 10, 2);
  paint(look.cloth, 17, 1, 6, 1);
  paint(look.cloth, 22, 0, 5, 2);
  paint(look.cloth, 26, 1, 3, 2);
  paint(look.trim, 13, 6, 14, 1);

  paint(WOOD, 3, 12, 2, 48);
  paint(ICE_DARK, 1, 5, 6, 8);
  paint(ICE, 2, 6, 4, 6);
  paint(WHITE, 3, 7, 1, 3);
  paint(look.cloth, 10, 22, 3, 7);
  paint(look.cloth, 7, 27, 5, 3);
  paint(look.trim, 7, 29, 5, 1);
  paint(skin, 3, 28, 5, 3);

  paint(look.cloth, 26, 21, 3, 3);
  paint(look.cloth, 28, 18, 4, 4);
  paint(look.cloth, 30, 15, 4, 4);
  paint(look.cloth, 31, 13, 6, 3);
  paint(look.trim, 31, 13, 6, 1);
  paint(skin, 32, 10, 5, 3);
  paint(skinShade, 32, 12, 5, 1);

  ORB_ROWS.forEach(([x, y, width]) => paint(ICE_DARK, x, y, width, 1));
  paint(ICE, 32, 2, 5, 7);
  paint(ICE, 31, 3, 7, 5);
  paint(WHITE, 33, 4, 3, 3);
  paint(WHITE, 29, 0, 1, 1);
  paint(WHITE, 38, 3, 1, 1);
  paint(ICE, 28, 6, 1, 1);
  paint(WHITE, 37, 9, 1, 1);

  narrowEyes(paint, skinShade);
  paintBrows(paint, hair, 'confident');
  paintMouth(paint, skin, 'smirk');
  paintMakeup(paint, appearance);
};
