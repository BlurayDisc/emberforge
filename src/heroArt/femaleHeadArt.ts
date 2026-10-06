import { MATERIAL, darken, type HeroColors, type Hex } from './heroPalette';
import type { SpritePainter } from './spritePainter';

// 13 wide. The face is columns 3 to 9 and the middle is column 6. The top three rows are hair, so a hat can cover them.
const FEMALE_HEAD_ROWS = [
  '....HHHHH....',
  '..HHHHHHHHH..',
  '.HHHhHHHHHHH.',
  '.HHHHHHHhHHH.',
  '.HhSSSSSSShH.',
  '.HhSKKSKKShH.',
  '.HhSwESEwShH.',
  '.HhUSSsSPUhH.',
  '.HhSSPPPSShH.',
  '.HHhsSSSshHH.',
  '.HH..sSs..HH.',
];

export const FEMALE_HEAD_WIDTH = 13;
export const FEMALE_HEAD_CENTER_COLUMN = 6;

export function paintFemaleHead(painter: SpritePainter, colors: HeroColors, left: number, top: number, eyeShadow: Hex = MATERIAL.eyeliner): void {
  painter.grid(
    FEMALE_HEAD_ROWS,
    {
      H: colors.hair,
      h: colors.hairShade,
      S: colors.skin,
      s: colors.skinShade,
      K: eyeShadow,
      w: MATERIAL.white,
      E: colors.eye,
      U: MATERIAL.blush,
      P: MATERIAL.lipstick,
    },
    left,
    top,
  );
  painter.dot(darken(colors.hair, 0.5), left + 4, top + 4);
  painter.dot(darken(colors.hair, 0.5), left + 8, top + 4);
}
