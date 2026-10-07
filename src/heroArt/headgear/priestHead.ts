import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import { paintHumanHead } from '../maleHeadArt';
import { paintHelmWings } from '../paladinParts';
import type { SpritePainter } from '../spritePainter';

const COWL_ROWS = ['...LCCCCCc...', '..LCCCCCCCc..', '.LCCCCCCCCCc.', '.CGGGGBGGGGc.'];

export function paintPriestHead(painter: SpritePainter, colors: HeroColors, centerX: number, headTop: number): void {
  paintHumanHead(painter, colors, centerX - 6, headTop);
  painter.grid(COWL_ROWS, { C: colors.cloth, c: colors.clothShade, L: lighten(colors.cloth, 1.35), G: colors.trim, B: '#5a86e0' }, centerX - 6, headTop);
  painter.dot(lighten(colors.trim, 1.6), centerX - 4, headTop + 3);
  painter.dot(darken(colors.trim, 0.7), centerX + 5, headTop + 3);
  painter.dot(MATERIAL.white, centerX - 3, headTop + 1);
  paintHelmWings(painter, colors, centerX, headTop - 1);
}
