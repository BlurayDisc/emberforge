import { narrowEyes, paintBrows, paintMouth } from '../faceExpression';
import { BONE, INK, LEATHER, RED, WHITE, WOOD, type GearDrawer } from '../figureColors';

const NOCK_X = 25;
const ARROW_Y = 19;
const BOW_TOP_Y = 3;
const BOW_BOTTOM_Y = 35;

export const drawArcherGear: GearDrawer = (paint, { look, skin, skinShade, hair }, erase) => {
  erase(7, 21, 4, 19);
  erase(29, 21, 4, 19);

  paint(look.cloth, 13, 4, 14, 5);
  paint(look.clothShade, 14, 8, 12, 1);
  paint(RED, 13, 7, 14, 1);
  paint(RED, 27, 5, 5, 2);
  paint(RED, 31, 6, 4, 2);
  paint(RED, 35, 7, 3, 1);

  paint(look.cloth, 9, 24, 22, 4);
  paint(look.clothShade, 9, 27, 22, 1);
  paint(look.trim, 19, 24, 2, 3);
  paint(LEATHER, 13, 46, 6, 9);
  paint(LEATHER, 21, 46, 6, 9);
  paint(look.trim, 13, 46, 6, 1);
  paint(look.trim, 21, 46, 6, 1);

  paint(WOOD, 30, 11, 3, 8);
  paint(LEATHER, 30, 14, 3, 1);
  paint(RED, 30, 8, 1, 3);
  paint(WHITE, 31, 7, 1, 4);
  paint(RED, 32, 8, 1, 3);

  paint(WOOD, 5, BOW_TOP_Y, 2, 2);
  paint(WOOD, 4, 5, 1, 4);
  paint(WOOD, 3, 9, 1, 8);
  paint(LEATHER, 3, 17, 1, 5);
  paint(WOOD, 3, 22, 1, 8);
  paint(WOOD, 4, 30, 1, 4);
  paint(WOOD, 5, BOW_BOTTOM_Y - 1, 2, 2);

  for (let x = 6; x <= NOCK_X; x++) paint(BONE, x, BOW_TOP_Y + Math.round(((x - 6) * (ARROW_Y - BOW_TOP_Y)) / (NOCK_X - 6)), 1, 1);
  for (let x = 6; x <= NOCK_X; x++) paint(BONE, x, BOW_BOTTOM_Y - Math.round(((x - 6) * (BOW_BOTTOM_Y - ARROW_Y)) / (NOCK_X - 6)), 1, 1);

  paint(BONE, 4, ARROW_Y, NOCK_X - 3, 1);
  paint('#c0c8d0', 1, ARROW_Y - 1, 3, 3);
  paint(RED, NOCK_X - 2, ARROW_Y - 1, 2, 1);
  paint(RED, NOCK_X - 2, ARROW_Y + 1, 2, 1);

  paint(look.cloth, 9, 18, 3, 6);
  paint(look.cloth, 7, 18, 5, 4);
  paint(look.trim, 7, 20, 2, 2);
  paint(skin, 4, 17, 4, 5);
  paint(skinShade, 4, 21, 4, 1);

  paint(look.cloth, 28, 18, 8, 4);
  paint(look.clothShade, 28, 21, 8, 1);
  paint(look.trim, 31, 18, 1, 4);
  paint(skin, 23, 17, 5, 5);
  paint(skinShade, 23, 21, 5, 1);

  paint(hair, 12, 5, 2, 3);
  narrowEyes(paint, skinShade);
  paintBrows(paint, INK, 'angry');
  paintMouth(paint, skin, 'smirk');
};
