import { MATERIAL, darken, lighten, type HeroColors, type Hex } from '../heroPalette';
import { paintPriestHead } from '../headgear/priestHead';
import { TABARD_BLUE, TABARD_BLUE_DARK, paintWarhammer } from '../paladinParts';
import type { SpritePainter } from '../spritePainter';
import { PORTRAIT_CENTER_X, finishPortrait, startPortrait } from './portraitFrame';
import { paintBeltAndTassets, paintBreastplate, paintCrossTabard, paintFlowingCape, paintGreavesAndBoots } from './priestFigureParts';

const CENTER_X = PORTRAIT_CENTER_X - 1;
const HEAD_TOP = 6;
const HAMMER_SHAFT_X = 33;
const HOLY_LIGHT = '#fff3b0';
const HOLY_GLOW = '#ffd96a';
const ORB_CENTER = { x: 4, y: 9 } as const;

const PAULDRON_ROWS = ['..gGGGg..', '.GWLLMSg.', 'GWLLMMSSD', 'GLLMBMSSD', 'gGGGGGGGg', '.LMMMSSD.', '.gGGGGGg.', '..SSSDD..'];
const SHADED_SIDE: Readonly<Record<string, string>> = { W: 'L', L: 'M', M: 'S', S: 'D' };

function paintPauldrons(painter: SpritePainter, colors: HeroColors): void {
  const palette: Record<string, Hex> = {
    W: lighten(colors.cloth, 1.7),
    L: lighten(colors.cloth, 1.25),
    M: colors.cloth,
    S: colors.clothShade,
    D: colors.clothDeep,
    G: colors.trim,
    g: MATERIAL.goldDark,
    B: '#5a86e0',
  };
  const rightSide = PAULDRON_ROWS.map((row) => [...row].reverse().map((token) => SHADED_SIDE[token] ?? token).join(''));
  painter.grid(PAULDRON_ROWS, palette, CENTER_X - 13, 14);
  painter.grid(rightSide, palette, CENTER_X + 4, 14);
}

// The mace stands on the floor behind the fist, so it reads as held and heavy.
function paintPlantedMace(painter: SpritePainter, colors: HeroColors): void {
  paintWarhammer(painter, colors, { hastX: HAMMER_SHAFT_X, headTop: 2, headHalfWidth: 3, headHeight: 11, hastBottom: 56 });
  for (const [sparkX, sparkY] of [[29, 0], [38, 4], [29, 14], [37, 15]] as const) painter.dot(HOLY_LIGHT, sparkX, sparkY);
}

function paintBlueSleeve(painter: SpritePainter, fromX: number, fromY: number, toX: number, toY: number): void {
  painter.line(TABARD_BLUE_DARK, fromX, fromY, toX, toY, 4);
  painter.line(TABARD_BLUE, fromX, fromY, toX, toY, 2);
}

function paintMaceArm(painter: SpritePainter, colors: HeroColors): void {
  paintBlueSleeve(painter, CENTER_X + 8, 20, CENTER_X + 9, 29);
  painter.line(colors.clothShade, CENTER_X + 9, 29, HAMMER_SHAFT_X - 3, 32, 3);
  painter.line(colors.cloth, CENTER_X + 9, 28, HAMMER_SHAFT_X - 3, 31, 3);
  painter.rect(colors.trim, CENTER_X + 8, 27, 4, 2);
  painter.rect(darken(colors.trim, 0.7), CENTER_X + 8, 28, 4, 1);
  painter.rect(colors.trim, HAMMER_SHAFT_X - 4, 31, 2, 4);
  const fistLeft = HAMMER_SHAFT_X - 2;
  painter.rect(colors.cloth, fistLeft, 31, 6, 5);
  painter.rect(lighten(colors.cloth, 1.4), fistLeft, 31, 6, 1);
  painter.rect(colors.clothShade, fistLeft + 5, 31, 1, 5);
  for (const fingerRow of [32, 34]) painter.span(colors.clothShade, fistLeft + 1, fistLeft + 4, fingerRow);
  painter.rect(colors.clothDeep, fistLeft, 35, 6, 1);
}

function paintBlessingArm(painter: SpritePainter, colors: HeroColors): void {
  paintBlueSleeve(painter, CENTER_X - 10, 20, 7, 28);
  painter.line(colors.clothShade, 6, 28, 5, 21, 3);
  painter.line(colors.cloth, 5, 28, 4, 21, 3);
  painter.line(lighten(colors.cloth, 1.35), 4, 27, 3, 21);
  painter.rect(colors.trim, 5, 26, 4, 3);
  painter.rect(darken(colors.trim, 0.7), 5, 28, 4, 1);
  painter.rect(colors.trim, 2, 19, 6, 1);
  painter.rect(darken(colors.trim, 0.7), 2, 20, 6, 1);
  painter.grid(['.S.S.S.', '.SSSSSs', 'SSSSSSs', '.SSSSs.', '..sss..'], { S: colors.skin, s: colors.skinShade }, 1, 14);
  painter.dot(lighten(colors.skin, 1.25), 3, 16);
}

function paintHolyLightOrb(painter: SpritePainter): void {
  for (let y = ORB_CENTER.y - 4; y <= ORB_CENTER.y + 4; y++) {
    for (let x = ORB_CENTER.x - 4; x <= ORB_CENTER.x + 4; x++) {
      const distance = Math.hypot(x - ORB_CENTER.x, y - ORB_CENTER.y);
      if (distance <= 1.3) painter.dot(MATERIAL.white, x, y);
      else if (distance <= 2.5) painter.dot(HOLY_LIGHT, x, y);
      else if (distance <= 3.6) painter.dot(HOLY_GLOW, x, y);
    }
  }
  for (const [sparkX, sparkY] of [[0, 3], [8, 12], [1, 13], [7, 4], [4, 2]] as const) painter.dot(HOLY_LIGHT, sparkX, sparkY);
}

function paintHairBehind(painter: SpritePainter, colors: HeroColors): void {
  if (colors.appearance.gender !== 'female') return;
  for (const side of [-1, 1] as const) {
    const left = side === -1 ? CENTER_X - 10 : CENTER_X + 5;
    painter.rect(colors.hair, left, 12, 5, 17);
    painter.rect(colors.hairShade, left + (side === -1 ? 0 : 4), 12, 1, 17);
    painter.rect(colors.hair, left + 1, 29, 3, 2);
  }
}

export function drawPriestFigure(colors: HeroColors): HTMLCanvasElement {
  const drawing = startPortrait();
  const { painter } = drawing;
  paintFlowingCape(painter, colors, CENTER_X);
  paintHairBehind(painter, colors);
  paintGreavesAndBoots(painter, colors, CENTER_X);
  paintBreastplate(painter, colors, CENTER_X);
  paintCrossTabard(painter, colors, CENTER_X);
  paintBeltAndTassets(painter, colors, CENTER_X);
  paintPlantedMace(painter, colors);
  paintMaceArm(painter, colors);
  paintBlessingArm(painter, colors);
  paintPauldrons(painter, colors);
  paintPriestHead(painter, colors, CENTER_X, HEAD_TOP);
  paintHolyLightOrb(painter);
  return finishPortrait(drawing);
}
