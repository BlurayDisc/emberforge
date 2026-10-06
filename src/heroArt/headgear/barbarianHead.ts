import { MATERIAL, darken, type HeroColors } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';

const BONE = '#e8e4d4';
const BONE_SHADE = '#b8b09c';
const FUR_LIGHT = '#b89a70';
const WAR_PAINT = '#b23a3a';

const HELM_HEAD_ROWS = [
  '....BBBBB....',
  '..BBBBBBBBB..',
  '.BBBbBBBBBbB.',
  '.FFFFFFFFFFF.',
  '..HSSSSSSSH..',
  '..HSKKSKKSH..',
  '..HSwESEwSH..',
  '..HSWSsSWSH..',
  '..HSLLLLLSH..',
  '..HHsLwLsHH..',
  '...HHHHHHH...',
];

export function paintBarbarianHead(painter: SpritePainter, colors: HeroColors, centerX: number, headTop: number, hornLength = 5): void {
  for (const side of [-1, 1]) {
    painter.line(BONE, centerX + side * 6, headTop + 3, centerX + side * (6 + hornLength), headTop + 3 - hornLength, hornLength > 5 ? 3 : 2);
    painter.dot(BONE_SHADE, centerX + side * 7, headTop + 4);
    painter.dot(MATERIAL.white, centerX + side * (6 + hornLength), headTop + 3 - hornLength);
  }
  painter.grid(
    HELM_HEAD_ROWS,
    {
      B: '#6f7a8c',
      b: '#454e60',
      F: FUR_LIGHT,
      H: colors.hair,
      S: colors.skin,
      s: colors.skinShade,
      K: darken(colors.hair, 0.5),
      w: MATERIAL.white,
      W: WAR_PAINT,
      E: colors.eye,
      L: '#5a2a2a',
    },
    centerX - 6,
    headTop,
  );
}
