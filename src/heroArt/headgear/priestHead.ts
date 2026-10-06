import { type HeroColors } from '../heroPalette';
import { paintHumanHead } from '../maleHeadArt';
import { paintHelmWings } from '../paladinParts';
import type { SpritePainter } from '../spritePainter';

const COWL_ROWS = ['...CCCCCCC...', '..CCCCCCCCC..', '.CCCcCCCCCcC.', '.CGGGGGGGGGC.'];

export function paintPriestHead(painter: SpritePainter, colors: HeroColors, centerX: number, headTop: number): void {
  paintHumanHead(painter, colors, centerX - 6, headTop);
  painter.grid(COWL_ROWS, { C: colors.cloth, c: colors.clothShade, G: colors.trim }, centerX - 6, headTop);
  paintHelmWings(painter, colors, centerX, headTop - 1);
}
