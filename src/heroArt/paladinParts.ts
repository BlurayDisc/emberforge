import { MATERIAL, darken, lighten, type HeroColors } from './heroPalette';
import type { SpritePainter } from './spritePainter';

const HOLY_LIGHT = '#fff3b0';
const HOLY_GLOW = '#ffd96a';

// A great warhammer: a chamfered gold head with a glowing holy face and a finial, on a wrapped haft with a gold cap.
export function paintWarhammer(painter: SpritePainter, colors: HeroColors, hammer: { hastX: number; headTop: number; headHalfWidth: number; headHeight: number; hastBottom: number }): void {
  const { hastX, headTop, headHalfWidth, headHeight, hastBottom } = hammer;
  const haftTop = headTop + headHeight;
  const goldShade = darken(colors.trim, 0.7);
  painter.rect(MATERIAL.wood, hastX, haftTop, 1, hastBottom - haftTop);
  painter.rect(MATERIAL.woodDark, hastX + 1, haftTop, 1, hastBottom - haftTop);
  const left = hastX - headHalfWidth;
  const width = headHalfWidth * 2 + 2;
  for (let row = 0; row < headHeight; row++) {
    const inset = row === 0 || row === headHeight - 1 ? 1 : 0;
    painter.span(row === headHeight - 1 ? goldShade : colors.trim, left + inset, left + width - 1 - inset, headTop + row);
  }
  painter.span(lighten(colors.trim, 1.6), left + 1, left + width - 2, headTop);
  painter.rect(goldShade, left + width - 1, headTop + 1, 1, headHeight - 2);
  painter.rect(MATERIAL.goldDark, left, headTop + 1, 1, headHeight - 2);
  const faceWidth = width - 4;
  const faceHeight = headHeight - 4;
  painter.rect(HOLY_LIGHT, left + 2, headTop + 2, faceWidth, faceHeight);
  painter.rect(MATERIAL.white, left + 2, headTop + 2, Math.max(2, faceWidth - 2), 1);
  if (faceWidth >= 6 && faceHeight >= 5) {
    painter.rect(colors.trim, hastX, headTop + 3, 2, faceHeight - 2);
    painter.rect(colors.trim, left + 3, headTop + 2 + Math.floor(faceHeight / 2), faceWidth - 2, 1);
  } else if (faceHeight >= 5) {
    painter.rect(MATERIAL.white, hastX, headTop + 3, 2, faceHeight - 2);
    painter.rect(HOLY_GLOW, left + 2, headTop + 2, 1, faceHeight);
    painter.rect(HOLY_GLOW, left + faceWidth + 1, headTop + 2, 1, faceHeight);
  }
  painter.rect(colors.trim, hastX, headTop - 1, 2, 1);
  painter.rect(colors.trim, hastX - 1, haftTop, 4, 1);
  painter.rect(goldShade, hastX - 1, haftTop + 1, 4, 1);
  painter.rect(MATERIAL.leatherLight, hastX, haftTop + 2, 1, 3);
  painter.rect(MATERIAL.leather, hastX + 1, haftTop + 2, 1, 3);
  painter.rect(MATERIAL.goldDark, hastX - 1, hastBottom - 3, 4, 2);
  painter.rect(colors.trim, hastX - 1, hastBottom - 3, 4, 1);
}

const WING_ROWS = ['W...', 'WW..', 'WWW.', '.WWW'];

// Two white feather wings on the sides of the helm, swept up and out.
export function paintHelmWings(painter: SpritePainter, colors: HeroColors, centerX: number, top: number): void {
  const palette = { W: lighten(MATERIAL.white, 1) };
  painter.grid(WING_ROWS, palette, centerX - 10, top);
  painter.grid(WING_ROWS.map((row) => [...row].reverse().join('')), palette, centerX + 7, top);
  painter.dot(colors.trim, centerX - 7, top + 3);
  painter.dot(colors.trim, centerX + 7, top + 3);
}

export const TABARD_BLUE = '#3a5aa8';
export const TABARD_BLUE_DARK = '#27407a';

export interface PaladinBodyShape {
  centerX: number;
  torsoTop: number;
  torsoRows: number;
  shoulderHalfWidth: number;
  waistHalfWidth: number;
  legTop: number;
  legRows: number;
  bootHeight: number;
}

// Full plate: a blue cape behind, greaves and boots, a breastplate with a gold collar and belt, and a blue tabard with a gold cross.
export function paintPaladinBody(painter: SpritePainter, colors: HeroColors, shape: PaladinBodyShape): void {
  const { centerX, torsoTop, torsoRows, shoulderHalfWidth, waistHalfWidth, legTop, legRows, bootHeight } = shape;
  const hemY = legTop + legRows;
  for (let row = torsoTop; row <= hemY; row++) {
    const flare = Math.floor(((row - torsoTop) / (hemY - torsoTop)) * 3);
    painter.span(TABARD_BLUE_DARK, centerX - shoulderHalfWidth - 1 - flare, centerX + shoulderHalfWidth + 1 + flare, row);
    for (let foldX = centerX - shoulderHalfWidth - 1 - flare + 2; foldX <= centerX + shoulderHalfWidth + 1 + flare; foldX += 4) painter.dot(darken(TABARD_BLUE_DARK, 0.75), foldX, row);
    painter.dot(TABARD_BLUE, centerX - shoulderHalfWidth - 1 - flare, row);
  }
  for (const side of [-1, 1] as const) {
    const legLeft = side === -1 ? centerX - 5 : centerX + 1;
    painter.rect(colors.cloth, legLeft, legTop, 4, legRows);
    painter.rect(colors.clothShade, legLeft + (side === -1 ? 0 : 3), legTop, 1, legRows);
    painter.rect(lighten(colors.cloth), legLeft + 1, legTop, 1, legRows - 1);
    painter.rect(colors.trim, legLeft, legTop + Math.floor(legRows / 2), 4, 1);
    painter.rect(colors.clothShade, legLeft - 1, hemY, 6, bootHeight);
    painter.rect(colors.trim, legLeft - 1, hemY, 6, 1);
  }
  for (let row = 0; row < torsoRows; row++) {
    const halfWidth = Math.max(waistHalfWidth, shoulderHalfWidth - Math.floor((row * (shoulderHalfWidth - waistHalfWidth)) / torsoRows));
    painter.span(colors.cloth, centerX - halfWidth, centerX + halfWidth, torsoTop + row);
    painter.dot(colors.clothShade, centerX + halfWidth, torsoTop + row);
  }
  painter.span(colors.clothLight, centerX - shoulderHalfWidth + 1, centerX - 3, torsoTop + 2);
  painter.span(colors.clothLight, centerX + 3, centerX + shoulderHalfWidth - 1, torsoTop + 2);
  painter.span(colors.trim, centerX - shoulderHalfWidth, centerX + shoulderHalfWidth, torsoTop);
  painter.rect(MATERIAL.leather, centerX - waistHalfWidth, torsoTop + torsoRows, waistHalfWidth * 2 + 1, 2);
  painter.rect(colors.trim, centerX - 1, torsoTop + torsoRows, 3, 2);
  painter.rect(TABARD_BLUE, centerX - 2, torsoTop + 1, 5, hemY - torsoTop - 2);
  painter.rect(TABARD_BLUE_DARK, centerX + 2, torsoTop + 1, 1, hemY - torsoTop - 2);
  painter.rect(colors.trim, centerX - 2, hemY - 2, 5, 1);
  painter.rect(colors.trim, centerX - 1, torsoTop + 4, 3, 1);
  painter.rect(colors.trim, centerX, torsoTop + 3, 1, 3);
}
