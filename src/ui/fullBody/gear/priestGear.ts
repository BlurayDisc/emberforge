import { paintMouth } from '../faceExpression';
import { GOLD, RED, STEEL, STEEL_DARK, WHITE, WOOD, type GearDrawer } from '../figureColors';
import { drawLongRobe } from './longRobe';

const TOME_COVER = '#7a2a2a';
const TOME_PAGES = '#ead9a8';

export const drawPriestGear: GearDrawer = (paint, appearance) => {
  const { look, hair, skin } = appearance;
  drawLongRobe(paint, appearance);
  paint(hair, 12, 8, 2, 8);
  paint(hair, 26, 8, 2, 8);
  paint(GOLD, 14, 8, 12, 1);
  paint(RED, 19, 7, 2, 2);

  paint(GOLD, 15, 1, 10, 1);
  paint(GOLD, 13, 2, 2, 2);
  paint(GOLD, 25, 2, 2, 2);
  paint(GOLD, 15, 4, 10, 1);

  paint(RED, 17, 21, 6, 36);
  paint(GOLD, 17, 21, 1, 36);
  paint(GOLD, 22, 21, 1, 36);
  paint(GOLD, 19, 24, 2, 6);
  paint(GOLD, 18, 26, 4, 2);

  paint(WOOD, 31, 18, 1, 28);
  paint(STEEL, 29, 11, 5, 6);
  paint(STEEL_DARK, 29, 15, 5, 1);
  paint(WHITE, 30, 12, 1, 3);
  paint(STEEL, 28, 13, 1, 2);
  paint(STEEL, 34, 13, 1, 2);

  paint(TOME_COVER, 3, 31, 8, 7);
  paint(TOME_PAGES, 10, 32, 1, 5);
  paint(look.trim, 6, 33, 2, 3);
  paint(look.trim, 5, 34, 4, 1);

  paintMouth(paint, skin, 'smile');
};
