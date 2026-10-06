import { MATERIAL, type HeroColors } from '../heroPalette';
import { paintHumanHead } from '../maleHeadArt';
import type { SpritePainter } from '../spritePainter';

const COWL_ROWS = ['...CCCCCCC...', '..CCCCCCCCC..', '.CCCcCCCCCcC.', '.CGGGGGGGGGC.'];
const HALO_ROWS_ABOVE_FACE = 3;

export function paintPriestHead(painter: SpritePainter, colors: HeroColors, centerX: number, headTop: number): void {
  paintHumanHead(painter, colors, centerX - 6, headTop);
  painter.grid(COWL_ROWS, { C: colors.cloth, c: colors.clothShade, G: colors.trim }, centerX - 6, headTop);
  const haloTop = headTop - HALO_ROWS_ABOVE_FACE;
  painter.span(colors.trim, centerX - 3, centerX + 3, haloTop);
  painter.span(MATERIAL.goldDark, centerX - 3, centerX + 3, haloTop + 2);
  painter.dot(colors.trim, centerX - 4, haloTop + 1);
  painter.dot(colors.trim, centerX + 4, haloTop + 1);
}
