import { MATERIAL, darken, lighten, type Hex, type HeroColors } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';
import { paintSpikedShoulder } from '../gruntParts';
import { paintBarbarianHead } from '../headgear/barbarianHead';
import { PORTRAIT_CENTER_X, finishPortrait, startPortrait } from './portraitFrame';
import { paintArmLimbs, paintAxeHaft, paintAxeHead, paintHands } from './barbarianAxe';

const CENTER_X = PORTRAIT_CENTER_X - 1;
const HEAD_TOP = 5;
const TORSO_TOP = 17;
const TORSO_ROWS = 19;
const HIP_ROW = 36;
const KNEE_ROW = 46;
const SOLE_ROW = 56;
const BONE = '#e8e4d4';
const FUR = '#8a6a48';
const FUR_LIGHT = '#b89a70';
const FUR_DEEP = '#5e4630';
const BUCKLE_STEEL = '#c0c8d0';

function torsoHalfWidthAt(row: number): number {
  return row < 6 ? 9 : 9 - Math.round((row - 5) * 0.25);
}

interface LegEdges {
  outer: number;
  inner: number;
}

function legEdgesAt(row: number): { left: LegEdges; right: LegEdges } {
  const spread = Math.round((row - HIP_ROW) * 0.28);
  return {
    left: { outer: CENTER_X - 9 - spread, inner: CENTER_X - 2 - Math.round(spread * 0.8) },
    right: { outer: CENTER_X + 10 + Math.round(spread * 0.9), inner: CENTER_X + 3 + Math.round(spread * 0.8) },
  };
}

function paintTrouserRow(painter: SpritePainter, colors: HeroColors, row: number): void {
  const { left, right } = legEdgesAt(row);
  painter.span(colors.cloth, left.outer, left.inner, row);
  painter.span(lighten(colors.cloth, 1.18), left.outer, left.outer + 1, row);
  painter.span(colors.clothShade, left.inner - 1, left.inner, row);
  painter.span(colors.cloth, right.inner, right.outer, row);
  painter.span(lighten(colors.cloth, 1.12), right.inner, right.inner, row);
  painter.span(colors.clothShade, right.outer - 2, right.outer, row);
}

function paintFurCuff(painter: SpritePainter, row: number, edges: LegEdges): void {
  const cuffColors: Hex[] = [FUR_LIGHT, FUR, FUR_DEEP];
  cuffColors.forEach((color, index) => painter.span(color, edges.outer - 1, edges.inner + 1, row + index));
  for (let tuftX = edges.outer; tuftX <= edges.inner; tuftX += 2) painter.dot(FUR_DEEP, tuftX, row + 3);
}

function paintBootRow(painter: SpritePainter, row: number, edges: LegEdges, litSide: 'outer' | 'inner'): void {
  painter.span(MATERIAL.boot, edges.outer, edges.inner, row);
  painter.dot(MATERIAL.leather, litSide === 'outer' ? edges.outer : edges.inner, row);
  if ((row - KNEE_ROW) % 3 === 0) painter.span(MATERIAL.leatherLight, edges.outer, edges.inner, row);
}

function paintFoot(painter: SpritePainter, toeLeft: number, toeRight: number): void {
  painter.rect(MATERIAL.boot, toeLeft, SOLE_ROW - 2, toeRight - toeLeft + 1, 3);
  painter.span(MATERIAL.leatherLight, toeLeft, toeRight, SOLE_ROW - 2);
  painter.span(darken(MATERIAL.boot, 0.6), toeLeft, toeRight, SOLE_ROW);
}

function paintLegs(painter: SpritePainter, colors: HeroColors): void {
  for (let row = HIP_ROW; row < KNEE_ROW; row++) paintTrouserRow(painter, colors, row);
  const kneeEdges = legEdgesAt(KNEE_ROW);
  paintFurCuff(painter, KNEE_ROW, kneeEdges.left);
  paintFurCuff(painter, KNEE_ROW, kneeEdges.right);
  for (let row = KNEE_ROW + 4; row < SOLE_ROW - 2; row++) {
    const { left, right } = legEdgesAt(row);
    paintBootRow(painter, row, left, 'outer');
    paintBootRow(painter, row, right, 'inner');
  }
  const ankleEdges = legEdgesAt(SOLE_ROW - 2);
  paintFoot(painter, ankleEdges.left.outer - 3, ankleEdges.left.inner);
  paintFoot(painter, ankleEdges.right.inner, ankleEdges.right.outer + 3);
  for (const strapRow of [KNEE_ROW + 7]) {
    const { left, right } = legEdgesAt(strapRow);
    painter.dot(BUCKLE_STEEL, Math.round((left.outer + left.inner) / 2), strapRow);
    painter.dot(BUCKLE_STEEL, Math.round((right.outer + right.inner) / 2), strapRow);
  }
}

function paintLoincloth(painter: SpritePainter, colors: HeroColors): void {
  painter.rect(colors.cloth, CENTER_X - 3, HIP_ROW + 1, 7, 10);
  painter.rect(colors.clothShade, CENTER_X + 2, HIP_ROW + 1, 2, 10);
  painter.rect(colors.trim, CENTER_X - 3, HIP_ROW + 10, 7, 1);
  painter.dot(darken(colors.trim, 0.7), CENTER_X, HIP_ROW + 10);
  painter.rect(MATERIAL.red, CENTER_X - 1, HIP_ROW + 3, 3, 1);
}

function paintTorso(painter: SpritePainter, colors: HeroColors): void {
  const highlight = lighten(colors.skin, 1.12);
  const deepShade = darken(colors.skinShade, 0.8);
  for (let row = 0; row < TORSO_ROWS; row++) {
    const halfWidth = torsoHalfWidthAt(row);
    painter.span(colors.skin, CENTER_X - halfWidth, CENTER_X + halfWidth, TORSO_TOP + row);
    painter.span(colors.skinShade, CENTER_X + halfWidth - 2, CENTER_X + halfWidth, TORSO_TOP + row);
  }
  for (const row of [3, 4, 5]) painter.span(highlight, CENTER_X - 7 + (row - 3), CENTER_X - 3, TORSO_TOP + row);
  painter.span(colors.skinShade, CENTER_X - 8, CENTER_X - 1, TORSO_TOP + 7);
  painter.span(colors.skinShade, CENTER_X + 1, CENTER_X + 8, TORSO_TOP + 7);
  painter.span(deepShade, CENTER_X - 6, CENTER_X - 2, TORSO_TOP + 8);
  painter.span(deepShade, CENTER_X + 2, CENTER_X + 6, TORSO_TOP + 8);
  painter.rect(deepShade, CENTER_X, TORSO_TOP + 2, 1, 17);
  for (const row of [11, 14, 17]) {
    painter.span(colors.skinShade, CENTER_X - 4, CENTER_X - 1, TORSO_TOP + row);
    painter.span(colors.skinShade, CENTER_X + 1, CENTER_X + 4, TORSO_TOP + row);
    painter.span(highlight, CENTER_X - 4, CENTER_X - 2, TORSO_TOP + row - 1);
  }
  for (const strapX of [CENTER_X - 6, CENTER_X + 5]) {
    painter.rect(MATERIAL.boot, strapX, TORSO_TOP + 1, 3, 17);
    painter.rect(MATERIAL.leather, strapX, TORSO_TOP + 1, 2, 17);
    painter.rect(MATERIAL.leatherLight, strapX, TORSO_TOP + 1, 1, 17);
    for (const studRow of [5, 10, 14]) painter.dot(BONE, strapX + 1, TORSO_TOP + studRow);
  }
  painter.rect(MATERIAL.boot, CENTER_X - 9, TORSO_TOP + 17, 19, 4);
  painter.rect(MATERIAL.leather, CENTER_X - 9, TORSO_TOP + 17, 19, 1);
  painter.rect(BONE, CENTER_X - 3, TORSO_TOP + 16, 7, 5);
  painter.rect(darken(BONE, 0.8), CENTER_X + 2, TORSO_TOP + 16, 2, 5);
  painter.rect(MATERIAL.boot, CENTER_X - 2, TORSO_TOP + 18, 2, 1);
  painter.rect(MATERIAL.boot, CENTER_X + 1, TORSO_TOP + 18, 2, 1);
  painter.dot(MATERIAL.boot, CENTER_X, TORSO_TOP + 19);
}

function paintFurMantle(painter: SpritePainter): void {
  for (let column = CENTER_X - 10; column <= CENTER_X + 10; column++) {
    const distance = Math.abs(column - CENTER_X);
    const hangRows = 4 + (column % 3 === 0 ? 2 : column % 2) - Math.floor(distance / 6);
    painter.rect(FUR, column, TORSO_TOP - 2, 1, hangRows);
    painter.dot(FUR_DEEP, column, TORSO_TOP - 3 + hangRows);
    if (column < CENTER_X) painter.dot(FUR_LIGHT, column, TORSO_TOP - 2);
  }
  for (const tuft of [-8, -3, 2, 7]) painter.rect(FUR_LIGHT, CENTER_X + tuft, TORSO_TOP, 2, 1);
}

function paintShoulderPlates(painter: SpritePainter): void {
  paintSpikedShoulder(painter, CENTER_X - 15, TORSO_TOP - 2, 9, 7);
  paintSpikedShoulder(painter, CENTER_X + 6, TORSO_TOP - 2, 9, 7);
}

function paintBeardBraids(painter: SpritePainter, colors: HeroColors): void {
  if (colors.appearance.gender === 'female') {
    for (const side of [-1, 1]) {
      const braidX = CENTER_X + side * 8 - 1;
      painter.rect(colors.hair, braidX, HEAD_TOP + 8, 2, 14);
      painter.rect(colors.hairShade, braidX + 1, HEAD_TOP + 8, 1, 14);
      for (const braidRow of [10, 13, 16, 19]) painter.rect(colors.hairShade, braidX, HEAD_TOP + braidRow, 2, 1);
      painter.rect(MATERIAL.red, braidX, HEAD_TOP + 22, 2, 1);
    }
    return;
  }
  for (const side of [-1, 1]) {
    const braidX = CENTER_X + side * 2 - 1;
    painter.rect(colors.hair, braidX, HEAD_TOP + 13, 2, 5);
    painter.rect(colors.hairShade, braidX + 1, HEAD_TOP + 13, 1, 5);
    for (const braidRow of [14, 16]) painter.rect(colors.hairShade, braidX, HEAD_TOP + braidRow, 2, 1);
    painter.rect(MATERIAL.red, braidX, HEAD_TOP + 18, 2, 1);
  }
}

export function drawBarbarianFigure(colors: HeroColors): HTMLCanvasElement {
  const drawing = startPortrait();
  const { painter } = drawing;
  paintLegs(painter, colors);
  paintLoincloth(painter, colors);
  paintTorso(painter, colors);
  paintArmLimbs(painter, colors);
  paintFurMantle(painter);
  paintShoulderPlates(painter);
  paintAxeHaft(painter);
  paintHands(painter, colors);
  paintAxeHead(painter);
  paintBeardBraids(painter, colors);
  paintBarbarianHead(painter, colors, CENTER_X, HEAD_TOP, 5);
  return finishPortrait(drawing);
}
