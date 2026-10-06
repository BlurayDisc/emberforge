import { MATERIAL, type HeroColors } from './heroPalette';
import { paintFemaleHead } from './femaleHeadArt';
import type { SpritePainter } from './spritePainter';

// Same grid as the female head: 13 wide, face in columns 3 to 9. The jaw is firm and there is light stubble.
const MALE_HEAD_ROWS = [
  '....HHHHH....',
  '...HHHHHHH...',
  '..HHHhHHHHH..',
  '..HHHHHHhHH..',
  '..HSSSSSSSH..',
  '..HSKSSSKSH..',
  '..HSwESEwSH..',
  '..HSSSsSSSH..',
  '..HSSLLLPSH..',
  '..hSsSSSsSh..',
  '...h.sSs.h...',
];

export function paintMaleHead(painter: SpritePainter, colors: HeroColors, left: number, top: number): void {
  painter.grid(
    MALE_HEAD_ROWS,
    {
      H: colors.hair,
      h: colors.hairShade,
      S: colors.skin,
      s: colors.skinShade,
      K: colors.hairShade,
      w: MATERIAL.white,
      E: colors.eye,
      L: MATERIAL.mouth,
      P: MATERIAL.mouth,
    },
    left,
    top,
  );
}

export function paintHumanHead(painter: SpritePainter, colors: HeroColors, left: number, top: number): void {
  if (colors.appearance.gender === 'female') paintFemaleHead(painter, colors, left, top);
  else paintMaleHead(painter, colors, left, top);
}

export function bodyHalfWidth(colors: HeroColors, femaleHalfWidth: number): number {
  return colors.appearance.gender === 'female' ? femaleHalfWidth : femaleHalfWidth + 1;
}
