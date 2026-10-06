import { paintFemaleHead } from '../femaleHeadArt';
import { lighten, type HeroColors, type Hex } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';

const EYE_SHADOW: Hex = '#d8703a';
const HAT_HEIGHT_ABOVE_FACE = 3;
const FLAME: Hex = '#ff8a2a';
const FLAME_CORE: Hex = '#ffe27a';
const RUBY: Hex = '#e02a3a';

// Swept-up hair around a small flame, and a gold circlet with a ruby on the brow.
const CROWN_ROWS = [
  '........o........',
  '.......oOo.......',
  '......HoOoH......',
  '.....HHHHHHH.....',
  '....HHHHHHHHH....',
  '...HHHHHHHHHHH...',
  '...GGGGGrGGGGG...',
];

// The head grid starts three rows under the top of the hat, so the brim covers the hair rows.
export function paintMageHead(painter: SpritePainter, colors: HeroColors, centerX: number, headTop: number): void {
  paintFemaleHead(painter, colors, centerX - 6, headTop, EYE_SHADOW);
  const hatTop = headTop - HAT_HEIGHT_ABOVE_FACE;
  painter.grid(CROWN_ROWS, { H: colors.hair, G: colors.trim, o: FLAME, O: FLAME_CORE, r: RUBY }, centerX - 8, hatTop);
  painter.dot(lighten(colors.hair, 1.4), centerX - 3, hatTop + 4);
}
