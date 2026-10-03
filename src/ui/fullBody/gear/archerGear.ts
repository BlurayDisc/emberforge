import { paintBrows, paintMouth } from '../faceExpression';
import { BONE, LEATHER, RED, WHITE, WOOD, type GearDrawer } from '../figureColors';
import { drawSlimTunicAndLegs } from './slimTunicAndLegs';

const BOW_TOP_Y = 3;
const BOW_BOTTOM_Y = 35;

export const drawArcherGear: GearDrawer = (paint, { look, skin, skinShade, hair, eye }, erase) => {
  erase(7, 21, 4, 19);
  erase(29, 21, 4, 19);
  erase(11, 20, 18, 19);
  erase(11, 39, 18, 22);

  paint(hair, 17, 2, 5, 2);
  paint(hair, 15, 3, 2, 1);
  paint(look.cloth, 13, 4, 14, 5);
  paint(look.clothShade, 14, 8, 12, 1);
  paint(RED, 13, 7, 14, 1);
  paint(RED, 27, 5, 5, 2);
  paint(RED, 31, 6, 4, 2);
  paint(RED, 35, 7, 3, 1);

  drawSlimTunicAndLegs(paint, look);
  paint(skinShade, 18, 20, 4, 1);
  // Long hair falls to the waist. It is painted after the sash and before the arms, so the sash does not hide it.
  paint(hair, 11, 6, 3, 18);
  paint(hair, 26, 6, 3, 18);
  paint(hair, 14, 24, 2, 12);
  paint(hair, 24, 24, 2, 12);

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

  // She holds the bow upright, with a straight string beside it, so nothing crosses her face.
  paint(BONE, 6, BOW_TOP_Y + 2, 1, BOW_BOTTOM_Y - BOW_TOP_Y - 3);

  paint(look.cloth, 9, 18, 3, 6);
  paint(look.cloth, 7, 18, 5, 4);
  paint(look.trim, 7, 20, 2, 2);
  paint(skin, 4, 17, 4, 5);
  paint(skinShade, 4, 21, 4, 1);

  // The right arm hangs relaxed at her side.
  paint(look.cloth, 27, 20, 3, 9);
  paint(look.clothShade, 29, 20, 1, 9);
  paint(look.trim, 27, 28, 3, 1);
  paint(skin, 27, 29, 3, 3);
  paint(skinShade, 27, 31, 3, 1);

  paint(hair, 12, 5, 2, 3);
  paint(hair, 25, 5, 2, 3);
  // The fringe hangs in front of the cap, with uneven lengths.
  paint(hair, 15, 8, 10, 1);
  paint(hair, 16, 9, 2, 1);
  paint(hair, 19, 9, 2, 1);
  paint(hair, 22, 9, 2, 1);
  // Both eyes are drawn again as mirrored pairs, so they line up.
  paint(WHITE, 16, 12, 2, 2);
  paint(WHITE, 22, 12, 2, 2);
  paint(eye, 17, 12, 1, 2);
  paint(eye, 22, 12, 1, 2);
  paintBrows(paint, hair, 'confident');
  paintMouth(paint, skin, 'laugh');
};
