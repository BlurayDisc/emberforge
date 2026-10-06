import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';

const HOODED_HEAD_ROWS = [
  '....CCCCC....',
  '...CCCCCCC...',
  '..CCCCCCCCC..',
  '..CCcccccCC..',
  '..CcSSSSScC..',
  '..CcKKSKKcC..',
  '..CcwESEwcC..',
  '..CDDDDDDDC..',
  '..CDDDDDDDC..',
  '...CDDDDDC...',
  '....CDDDC....',
];

const EYE_ROW = 6;

export function paintThiefHead(painter: SpritePainter, colors: HeroColors, centerX: number, headTop: number): void {
  painter.grid(
    HOODED_HEAD_ROWS,
    { C: colors.cloth, c: colors.clothShade, D: colors.clothDeep, S: colors.skin, K: darken(colors.hair, 0.5), w: MATERIAL.white, E: colors.eye },
    centerX - 6,
    headTop,
  );
  if (colors.appearance.gender === 'female') {
    painter.dot(MATERIAL.eyeliner, centerX - 4, headTop + EYE_ROW);
    painter.dot(MATERIAL.eyeliner, centerX + 4, headTop + EYE_ROW);
  }
  painter.dot(lighten(colors.cloth), centerX - 2, headTop + 1);
}
