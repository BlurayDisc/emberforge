import { lighten, type HeroColors } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';

// A blindfolded head with swept-back hair. The eyes glow through the blindfold in the trim colour.
const BLINDFOLDED_HEAD_ROWS = [
  '....HHHHH....',
  '..HHHHHHHHH..',
  '.HHHHHHHHHHH.',
  '.HHHHHHHHHHH.',
  '.HHSSSSSSSHH.',
  '.HBBBBBBBBBH.',
  '.HBBGBBBGBBH.',
  '..HSSSsSSSH..',
  '..HSSLLLSSH..',
  '...HSsSSsH...',
  '....HSsSH....',
];

const MOUTH = '#8a3a3a';

export function paintThiefHead(painter: SpritePainter, colors: HeroColors, centerX: number, headTop: number): void {
  painter.grid(
    BLINDFOLDED_HEAD_ROWS,
    { H: colors.hair, S: colors.skin, s: colors.skinShade, B: colors.clothShade, G: colors.trim, L: MOUTH },
    centerX - 6,
    headTop,
  );
  painter.dot(lighten(colors.hair, 1.4), centerX - 2, headTop + 2);
}
