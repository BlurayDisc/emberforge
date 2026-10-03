import { narrowEyes, paintBrows } from '../faceExpression';
import { GOLD, INK, LEATHER, RED, RED_DARK, STEEL, WHITE, WOOD, type GearDrawer } from '../figureColors';

const STRAP_LENGTH = 15;

export const drawThiefGear: GearDrawer = (paint, { look, skinShade }) => {
  paint(look.cloth, 13, 4, 14, 5);
  paint(look.cloth, 12, 6, 2, 12);
  paint(look.cloth, 26, 6, 2, 12);
  paint(look.clothShade, 14, 8, 12, 1);
  paint(look.clothShade, 14, 14, 12, 4);

  for (let step = 0; step < STRAP_LENGTH; step++) paint(LEATHER, 12 + step, 22 + step, 2, 1);
  paint(RED, 19, 29, 2, 2);
  paint(WOOD, 14, 39, 4, 3);

  paint(RED, 12, 19, 16, 2);
  paint(RED, 25, 21, 3, 11);
  paint(RED_DARK, 27, 21, 1, 11);

  paint(LEATHER, 30, 40, 2, 1);
  paint(GOLD, 28, 41, 6, 1);
  paint(STEEL, 30, 42, 2, 9);
  paint(WHITE, 30, 42, 1, 8);
  paint(LEATHER, 8, 40, 2, 1);
  paint(GOLD, 6, 41, 6, 1);
  paint(STEEL, 8, 42, 2, 9);
  paint(WHITE, 9, 42, 1, 8);

  paint(look.clothShade, 14, 15, 12, 4);
  paint(look.cloth, 14, 15, 12, 1);
  narrowEyes(paint, skinShade);
  paintBrows(paint, INK, 'sly');
};
