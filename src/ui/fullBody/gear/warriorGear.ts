import { paintBrows, paintMouth } from '../faceExpression';
import { GOLD, INK, RED, RED_DARK, STEEL, STEEL_DARK, WHITE, WOOD, type GearDrawer } from '../figureColors';

const PLUME_HIGHLIGHT = '#d86a6a';

export const drawWarriorGear: GearDrawer = (paint, { skin, skinShade }, erase) => {
  erase(7, 21, 4, 19);
  erase(29, 21, 4, 19);

  paint(RED_DARK, 27, 22, 9, 26);

  paint(STEEL, 10, 20, 20, 16);
  paint(STEEL_DARK, 10, 33, 20, 3);
  paint(STEEL_DARK, 19, 21, 2, 12);
  paint(WHITE, 12, 22, 5, 2);
  paint(WHITE, 23, 22, 5, 2);
  paint(STEEL_DARK, 12, 27, 6, 1);
  paint(STEEL_DARK, 22, 27, 6, 1);
  paint(GOLD, 13, 19, 14, 2);
  paint(GOLD, 18, 28, 4, 4);
  paint(RED, 19, 29, 2, 2);
  paint(STEEL_DARK, 11, 39, 8, 5);
  paint(STEEL_DARK, 21, 39, 8, 5);
  paint(GOLD, 11, 43, 8, 1);
  paint(GOLD, 21, 43, 8, 1);
  paint(STEEL, 13, 46, 6, 9);
  paint(STEEL, 21, 46, 6, 9);
  paint(STEEL_DARK, 13, 53, 6, 2);
  paint(STEEL_DARK, 21, 53, 6, 2);

  paint(skin, 30, 26, 6, 6);
  paint(skinShade, 30, 30, 6, 2);
  paint(STEEL, 30, 32, 6, 6);
  paint(STEEL_DARK, 30, 36, 6, 2);
  paint(STEEL, 27, 17, 10, 8);
  paint(STEEL_DARK, 27, 23, 10, 2);
  paint(GOLD, 27, 17, 10, 1);
  paint(WHITE, 29, 18, 4, 1);
  paint(STEEL, 3, 17, 10, 8);
  paint(STEEL_DARK, 3, 23, 10, 2);
  paint(GOLD, 3, 17, 10, 1);
  paint(WHITE, 5, 18, 4, 1);

  paint(STEEL, 33, 6, 3, 29);
  paint(WHITE, 33, 6, 1, 28);
  paint(STEEL_DARK, 35, 7, 1, 28);
  paint(STEEL, 34, 4, 1, 2);
  paint(GOLD, 30, 35, 9, 2);
  paint(WOOD, 33, 37, 3, 5);
  paint(skin, 32, 37, 5, 4);
  paint(skinShade, 32, 40, 5, 1);
  paint(GOLD, 33, 42, 3, 2);

  paint(STEEL, 1, 26, 11, 17);
  paint(STEEL, 2, 43, 9, 3);
  paint(STEEL, 4, 46, 5, 3);
  paint(STEEL, 5, 49, 3, 2);
  paint(RED, 2, 27, 9, 15);
  paint(RED, 3, 42, 7, 3);
  paint(RED, 5, 45, 3, 3);
  paint(RED_DARK, 2, 27, 2, 15);
  paint(GOLD, 6, 28, 1, 16);
  paint(GOLD, 3, 33, 7, 1);
  paint(STEEL_DARK, 4, 31, 5, 5);
  paint(GOLD, 5, 32, 3, 3);
  paint(WHITE, 5, 32, 1, 1);

  paint(STEEL, 14, 3, 12, 2);
  paint(STEEL, 13, 5, 14, 4);
  paint(STEEL_DARK, 13, 8, 14, 1);
  paint(GOLD, 13, 6, 14, 1);
  paint(WHITE, 15, 4, 4, 1);
  paint(STEEL, 13, 9, 2, 9);
  paint(STEEL, 25, 9, 2, 9);
  paint(STEEL_DARK, 13, 16, 2, 2);
  paint(STEEL_DARK, 25, 16, 2, 2);
  paint(STEEL, 19, 8, 2, 8);
  paint(STEEL_DARK, 20, 9, 1, 7);
  paint(RED, 16, 1, 8, 3);
  paint(RED, 22, 0, 7, 2);
  paint(RED, 28, 1, 4, 3);
  paint(RED_DARK, 31, 3, 3, 2);
  paint(PLUME_HIGHLIGHT, 17, 1, 5, 1);

  paintBrows(paint, INK, 'angry');
  paintMouth(paint, skin, 'smirk');
};
