import { MATERIAL, darken, type HeroColors } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';

// 13 wide, face in columns 3 to 9. The hair is swept back, so only the top shows. The ears are long and point out and up.
const ELF_HEAD_ROWS = [
  '....HHHHH....',
  '..HHHHHHHHH..',
  '.HHHHHhHHHHH.',
  '.HHHHHHHHhHH.',
  'S.HSSSSSSSH.S',
  '.SSSKKSKKSSS.',
  '.SSSwESEwSSS.',
  '..sSSSsSSSs..',
  '...SSPPPSS...',
  '...hsSSSsh...',
  '.....sSs.....',
];

const BROW_ROW = 4;

export function paintElfHead(painter: SpritePainter, colors: HeroColors, centerX: number, headTop: number): void {
  const left = centerX - 6;
  painter.grid(
    ELF_HEAD_ROWS,
    {
      H: colors.hair,
      h: colors.hairShade,
      S: colors.skin,
      s: colors.skinShade,
      K: MATERIAL.eyeliner,
      w: MATERIAL.white,
      E: colors.eye,
      P: MATERIAL.lipstick,
    },
    left,
    headTop,
  );
  painter.dot(darken(colors.hair, 0.5), left + 4, headTop + BROW_ROW);
  painter.dot(darken(colors.hair, 0.5), left + 8, headTop + BROW_ROW - 1);
  painter.dot(colors.skinShade, left + 1, headTop + BROW_ROW + 1);
  painter.dot(colors.skinShade, left + 11, headTop + BROW_ROW + 1);
}

// One long ponytail tied back with two bands, hanging behind the shoulder.
export function paintElfPonytail(painter: SpritePainter, colors: HeroColors, fromX: number, fromY: number, length: number, thickness = 2): void {
  const swayX = fromX - 3;
  painter.line(colors.hair, fromX, fromY, swayX, fromY + Math.floor(length / 2), thickness);
  painter.line(colors.hair, swayX, fromY + Math.floor(length / 2), swayX + 1, fromY + length, thickness);
  painter.line(colors.hairShade, fromX, fromY + 1, swayX, fromY + Math.floor(length / 2));
  painter.rect(colors.trim, fromX - 1, fromY + 2, thickness + 1, 1);
  painter.rect(colors.trim, swayX, fromY + length - 3, thickness + 1, 1);
}
