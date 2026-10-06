import { paintFemaleHead } from '../femaleHeadArt';
import { MATERIAL, lighten, type HeroColors, type Hex } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';

const EYE_SHADOW: Hex = '#8a4fd0';
const HAT_HEIGHT_ABOVE_FACE = 3;

const HAT_ROWS = [
  '.......VV........',
  '......VVVv.......',
  '.....VVVVVv......',
  '....VVVVVVVv.....',
  '...GGGGGGGGGg....',
  '.vVVVVVVVVVVVVVv.',
  'dvvvvvvvvvvvvvvvd',
];

// The head grid starts three rows under the top of the hat, so the brim covers the hair rows.
export function paintMageHead(painter: SpritePainter, colors: HeroColors, centerX: number, headTop: number): void {
  paintFemaleHead(painter, colors, centerX - 6, headTop, EYE_SHADOW);
  const hatTop = headTop - HAT_HEIGHT_ABOVE_FACE;
  painter.grid(HAT_ROWS, { V: colors.cloth, v: colors.clothShade, d: colors.clothDeep, G: colors.trim, g: MATERIAL.goldDark }, centerX - 8, hatTop);
  painter.dot(lighten(colors.cloth), centerX - 1, hatTop + 2);
  painter.dot(MATERIAL.white, centerX + 1, hatTop + 4);
}
