import { MATERIAL, darken, lighten, type HeroColors } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';

const BONE = '#e8e4d4';
const BONE_SHADE = '#b8b09c';
const BONE_DEEP = '#7c7460';
const FUR_LIGHT = '#b89a70';
const WAR_PAINT = '#b23a3a';
const HELM_STEEL = '#6f7a8c';
const HELM_LIGHT = '#aab4c4';
const HELM_DEEP = '#454e60';

const ROARING_HEAD_ROWS = [
  '....BBBBB....',
  '..BhBBBBBbB..',
  '.BhhBBBBBBbb.',
  '.FfFFFFFFFFF.',
  '.HSSSSSSSSSH.',
  '.HSKKSSSKKSH.',
  '.HSwESSSEwSH.',
  '.HSWSSsSSWSH.',
  '.HDWTSsSTWDH.',
  '.HDDTTTTTDDH.',
  '..DDLLLLLDD..',
  '...DDLLLDD...',
  '....DDDDD....',
];

const FIRST_BEARD_ROW = 8;
const LAST_ROW_WITH_JAW = 11;

function headRowsOf(colors: HeroColors): string[] {
  if (colors.appearance.gender !== 'female') return ROARING_HEAD_ROWS;
  return ROARING_HEAD_ROWS.map((row, rowIndex) => {
    if (rowIndex < FIRST_BEARD_ROW) return row;
    if (rowIndex > LAST_ROW_WITH_JAW) return '.'.repeat(row.length);
    return row.replace(/D/g, 'S');
  });
}

function paintCurvedHorn(painter: SpritePainter, side: number, centerX: number, headTop: number, hornLength: number): void {
  const rootX = centerX + side * 6;
  const rootY = headTop + 3;
  const bendX = rootX + side * Math.ceil(hornLength * 0.6);
  const bendY = rootY - 1;
  const tipX = bendX + side * Math.ceil(hornLength * 0.4);
  const tipY = bendY - hornLength;
  painter.line(BONE, rootX, rootY, bendX, bendY, 3);
  painter.line(BONE, bendX, bendY, tipX, tipY, 2);
  painter.line(BONE_SHADE, rootX + side, rootY + 2, bendX + side, bendY + 2, 1);
  painter.dot(BONE_DEEP, rootX + side * 2, rootY + 2);
  painter.dot(MATERIAL.white, tipX, tipY);
  painter.dot(BONE_SHADE, tipX + side, tipY + 1);
  painter.rect(FUR_LIGHT, rootX - side, rootY - 1, 2, 4);
}

export function paintBarbarianHead(painter: SpritePainter, colors: HeroColors, centerX: number, headTop: number, hornLength = 5): void {
  for (const side of [-1, 1]) paintCurvedHorn(painter, side, centerX, headTop, hornLength);
  painter.grid(
    headRowsOf(colors),
    {
      B: HELM_STEEL,
      b: HELM_DEEP,
      h: HELM_LIGHT,
      F: FUR_LIGHT,
      f: darken(FUR_LIGHT, 0.8),
      H: colors.hair,
      D: colors.hair,
      S: colors.skin,
      s: colors.skinShade,
      K: darken(colors.hair, 0.5),
      w: MATERIAL.white,
      W: WAR_PAINT,
      E: colors.eye,
      L: '#4a1a1a',
      T: lighten(BONE, 1.05),
    },
    centerX - 6,
    headTop,
  );
  painter.rect(colors.hairShade, centerX - 4, headTop + 12, 2, 1);
  painter.rect(colors.hairShade, centerX + 3, headTop + 9, 2, 1);
}
