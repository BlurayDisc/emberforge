import { paintBrows, paintMouth } from '../faceExpression';
import { GOLD, INK, LEATHER, RED, RED_DARK, STEEL, type GearDrawer } from '../figureColors';

const WRAP_CLOTH = '#ead9a8';

export const drawFighterGear: GearDrawer = (paint, { skin, skinShade, hair }) => {
  paint(hair, 15, 3, 2, 2);
  paint(hair, 19, 2, 2, 3);
  paint(hair, 23, 3, 2, 2);
  paint(RED, 13, 8, 14, 2);
  paint(RED, 26, 9, 3, 2);
  paint(RED_DARK, 28, 11, 3, 3);
  paint(RED, 30, 14, 2, 2);

  paint(skin, 7, 21, 4, 15);
  paint(skin, 29, 21, 4, 15);
  paint(skinShade, 10, 22, 1, 13);
  paint(skinShade, 29, 22, 1, 13);
  paint(skin, 18, 20, 4, 3);
  paint(skin, 19, 23, 2, 3);
  paint(WRAP_CLOTH, 7, 32, 4, 3);
  paint(WRAP_CLOTH, 29, 32, 4, 3);

  paint(STEEL, 7, 35, 4, 2);
  paint(STEEL, 29, 35, 4, 2);
  paint(GOLD, 8, 35, 1, 1);
  paint(GOLD, 10, 35, 1, 1);
  paint(GOLD, 29, 35, 1, 1);
  paint(GOLD, 31, 35, 1, 1);

  paint(LEATHER, 11, 36, 18, 3);
  paint(GOLD, 18, 36, 4, 3);
  paint(WRAP_CLOTH, 13, 50, 6, 4);
  paint(WRAP_CLOTH, 21, 50, 6, 4);

  paintBrows(paint, INK, 'angry');
  paintMouth(paint, skin, 'smirk');
};
