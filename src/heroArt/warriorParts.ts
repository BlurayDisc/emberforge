import { MATERIAL, OUTLINE, darken, lighten, type HeroColors } from './heroPalette';
import type { SpritePainter } from './spritePainter';

const MOUTH_SHADOW = '#5a2a2a';

const WARRIOR_HELM_ROWS = [
  '.....rRr.....',
  '...rRRRRRr...',
  '..mMqMMMMMdd.',
  '.mMqMMMMMMMdd',
  '.GGGGGGGGGGG.',
  '.mMKKKMKKKMd.',
  '.mMKEKMKEKMd.',
  '.mMSSSMSSSMd.',
  '.mMSsSMSsSMd.',
  '.mdSSLLLSSdd.',
  '..mdSSSSSdd..',
  '...mMMMMMMd..',
  '....mMGGMmd..',
];

// A layered pauldron: a gold rim between the plates and a spike on the outer edge, so the shoulders read as heavy armour.
const PAULDRON_ROWS = ['...qqMMMm', '.qqMMMMMm', 'qqMMMMMmd', 'GGGGGGGGG', 'qMMMMMMmd', 'MMMMMmmdd', 'GGGGGGGGG', 'mmmmmmmdd'];

function pauldronPalette(colors: HeroColors): Readonly<Record<string, `#${string}`>> {
  return { q: lighten(colors.cloth, 1.7), M: colors.clothShade, m: darken(colors.clothShade, 0.8), d: colors.clothDeep, G: colors.trim };
}

export function paintWarriorHelm(painter: SpritePainter, colors: HeroColors, left: number, top: number): void {
  painter.grid(
    WARRIOR_HELM_ROWS,
    {
      r: MATERIAL.redDark,
      R: MATERIAL.red,
      m: colors.clothShade,
      M: colors.cloth,
      d: darken(colors.clothShade),
      q: lighten(colors.cloth),
      G: colors.trim,
      K: OUTLINE,
      S: colors.skin,
      s: colors.skinShade,
      w: MATERIAL.white,
      E: colors.eye,
      L: MOUTH_SHADOW,
    },
    left,
    top,
  );
}

export function paintWarriorPauldrons(painter: SpritePainter, colors: HeroColors, rightLeft: number, leftLeft: number, top: number): void {
  const palette = pauldronPalette(colors);
  painter.grid(PAULDRON_ROWS, palette, rightLeft, top);
  painter.grid(PAULDRON_ROWS.map((row) => [...row].reverse().join('')), palette, leftLeft, top);
  for (const spikeRow of [top - 2, top - 1]) {
    painter.dot(colors.trim, rightLeft + 7, spikeRow);
    painter.dot(colors.trim, leftLeft + 1, spikeRow);
  }
  painter.dot(MATERIAL.white, rightLeft + 2, top + 1);
  painter.dot(MATERIAL.white, leftLeft + 6, top + 1);
}
