import { paintBrows, paintMouth } from '../faceExpression';
import { BONE, INK, LEATHER, RED, STEEL, STEEL_DARK, WHITE, WOOD, type GearDrawer } from '../figureColors';

const HARNESS_LENGTH = 9;
const FUR_TUFT_SPACING = 3;

export const drawBarbarianGear: GearDrawer = (paint, { look, skin, skinShade, hair }) => {
  paint(skin, 13, 20, 14, 10);
  paint(skinShade, 19, 21, 2, 8);
  paint(skinShade, 13, 29, 14, 1);
  paint(skin, 7, 21, 4, 15);
  paint(skin, 29, 21, 4, 15);
  paint(skinShade, 10, 22, 1, 13);
  paint(skinShade, 29, 22, 1, 13);
  paint(look.clothShade, 7, 31, 4, 4);
  paint(look.clothShade, 29, 31, 4, 4);
  for (let step = 0; step < HARNESS_LENGTH; step++) {
    paint(LEATHER, 13 + step, 21 + step, 2, 1);
    paint(LEATHER, 25 - step, 21 + step, 2, 1);
  }
  paint(look.trim, 19, 27, 2, 2);

  paint(look.trim, 9, 19, 22, 3);
  for (let x = 10; x < 29; x += FUR_TUFT_SPACING) paint(look.clothShade, x, 21, 2, 1);

  paint(look.cloth, 11, 37, 18, 5);
  for (let x = 11; x < 28; x += FUR_TUFT_SPACING) paint(look.clothShade, x, 42, 2, 2);

  paint(look.cloth, 13, 3, 14, 4);
  paint(BONE, 11, 5, 2, 2);
  paint(BONE, 10, 3, 2, 2);
  paint(BONE, 9, 1, 2, 2);
  paint(BONE, 27, 5, 2, 2);
  paint(BONE, 28, 3, 2, 2);
  paint(BONE, 29, 1, 2, 2);

  paint(hair, 12, 7, 2, 10);
  paint(hair, 26, 7, 2, 10);
  paint(hair, 15, 14, 10, 1);
  paint(hair, 14, 15, 12, 5);

  paint(WOOD, 32, 8, 2, 51);
  paint(STEEL, 32, 5, 2, 3);
  paint(STEEL, 34, 7, 4, 2);
  paint(STEEL, 34, 9, 5, 9);
  paint(STEEL, 34, 18, 4, 2);
  paint(STEEL_DARK, 34, 9, 1, 9);
  paint(WHITE, 37, 9, 1, 8);

  paintMouth(paint, skin, 'roar');
  paintBrows(paint, INK, 'angry');
  paint(RED, 15, 14, 3, 1);
  paint(RED, 22, 14, 3, 1);
  paint(RED, 16, 15, 2, 1);
  paint(RED, 22, 15, 2, 1);
};
