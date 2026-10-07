import { darken, lighten, MATERIAL, type HeroColors } from './heroPalette';
import type { SpritePainter } from './spritePainter';

// An open-faced knight helm: red plume, gold brow band, nasal bar and cheek plates. Face in columns 3 to 9.
const KNIGHT_HELM_ROWS = [
  '....rRRRr....',
  '...rRRRRRrd..',
  '..qqMMMMMMd..',
  '.qqMMMMMMMMd.',
  '.qMMMMMMMMMd.',
  '.mGGGGGGGGGd.',
  '.mMSBBnBBSMd.',
  '.mMSwEnEwSMd.',
  '.mMSSSnSSsMd.',
  '.mMhSSsSSshd.',
  '..mhSLLLSshd.',
  '..mdhhhhhhd..',
  '...mdhhhhdd..',
];

export function paintKnightHead(painter: SpritePainter, colors: HeroColors, left: number, top: number): void {
  painter.grid(
    KNIGHT_HELM_ROWS,
    {
      r: MATERIAL.redDark,
      R: MATERIAL.red,
      m: colors.clothShade,
      M: colors.cloth,
      d: colors.clothDeep,
      q: lighten(colors.cloth, 1.6),
      n: lighten(colors.cloth, 1.2),
      G: colors.trim,
      B: colors.hairShade,
      S: colors.skin,
      s: colors.skinShade,
      h: colors.hair,
      w: MATERIAL.white,
      E: colors.eye,
      L: darken(MATERIAL.mouth, 0.75),
    },
    left,
    top,
  );
  painter.dot(lighten(colors.trim, 1.4), left + 2, top + 5);
  paintTrailingPlume(painter, left + 9, top);
}

// The plume streams back to the right, as if the knight just turned his head.
function paintTrailingPlume(painter: SpritePainter, left: number, top: number): void {
  painter.rect(MATERIAL.red, left - 1, top, 4, 2);
  painter.rect(MATERIAL.red, left + 2, top + 1, 3, 2);
  painter.rect(MATERIAL.redDark, left + 3, top + 3, 2, 2);
  painter.rect(MATERIAL.redDark, left + 4, top + 5, 1, 2);
  painter.dot(lighten(MATERIAL.red, 1.35), left, top);
}
