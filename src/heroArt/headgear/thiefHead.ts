import { lighten, type HeroColors } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';
import { thiefTones } from '../thiefParts';

// A hooded head with a tousled fringe, a green-lit eye band and a half mask over the nose and mouth.
const HOODED_HEAD_ROWS = [
  '.....DDDD....',
  '...DDLLLLDD..',
  '..DLLHHHHLDD.',
  '.DLHHHhHHHHD.',
  '.DHHhHHHhHHD.',
  '.DHhSSSSShHD.',
  '.DDsSSSSSsDD.',
  '.DDsEsSsEsDD.',
  '..DDMMMMMDD..',
  '..DMmmmmmMD..',
  '...DMMMMMD...',
  '....DDMDD....',
];

export const THIEF_HEAD_HEIGHT = HOODED_HEAD_ROWS.length;

export function paintThiefHead(painter: SpritePainter, colors: HeroColors, centerX: number, headTop: number): void {
  const tones = thiefTones(colors);
  painter.grid(
    HOODED_HEAD_ROWS,
    {
      D: tones.deep,
      L: tones.base,
      H: colors.hair,
      h: colors.hairShade,
      S: colors.skin,
      s: colors.skinShade,
      E: tones.trimLight,
      M: tones.shade,
      m: tones.base,
    },
    centerX - 6,
    headTop,
  );
  painter.dot(tones.rim, centerX - 3, headTop + 1);
  painter.dot(tones.light, centerX - 2, headTop + 1);
  painter.dot(lighten(colors.hair, 1.5), centerX - 3, headTop + 4);
  painter.dot(lighten(colors.hair, 1.4), centerX - 1, headTop + 3);
}
