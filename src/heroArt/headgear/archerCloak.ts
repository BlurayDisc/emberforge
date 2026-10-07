import type { HeroColors } from '../heroPalette';
import { darken, lighten } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';

interface CloakShape {
  centerX: number;
  shoulderY: number;
  hemY: number;
  shoulderHalfWidth: number;
  hemHalfWidth: number;
  // The wind blows the cloak sideways. The hem moves this many pixels to the left.
  hemSway: number;
}

const HEM_TEETH_DEPTH = [0, 2, 1, 3, 1, 2, 0, 3, 1, 2];
const FOLD_POSITIONS = [-0.55, -0.1, 0.4];

// The cloak hangs behind the body and flares out to a torn hem. Light comes from the top left, so folds have a lit ridge on their left and a dark valley on their right.
export function paintArcherCloak(painter: SpritePainter, colors: HeroColors, shape: CloakShape): void {
  const rows = shape.hemY - shape.shoulderY;
  const body = darken(colors.clothShade, 0.8);
  const valley = darken(colors.clothShade, 0.5);
  const ridge = colors.clothShade;
  for (let step = 0; step <= rows; step++) {
    const progress = step / rows;
    const halfWidth = Math.round(shape.shoulderHalfWidth + (shape.hemHalfWidth - shape.shoulderHalfWidth) * progress);
    const centerX = shape.centerX - Math.round(shape.hemSway * progress * progress);
    const row = shape.shoulderY + step;
    const left = centerX - halfWidth;
    const right = centerX + halfWidth;
    painter.span(body, left, right, row);
    for (const foldPosition of FOLD_POSITIONS) {
      const foldX = centerX + Math.round(foldPosition * halfWidth) - Math.round(progress * 1.5);
      painter.dot(ridge, foldX, row);
      painter.dot(valley, foldX + 1, row);
      if (step % 5 === 4) painter.dot(valley, foldX + 2, row);
    }
    painter.dot(colors.cloth, left, row);
    painter.dot(colors.clothShade, left + 1, row);
    painter.dot(valley, right, row);
    painter.dot(valley, right - 1, row);
  }
  const hemCenterX = shape.centerX - shape.hemSway;
  for (let column = -shape.hemHalfWidth; column <= shape.hemHalfWidth; column++) {
    const depth = HEM_TEETH_DEPTH[(column + shape.hemHalfWidth) % HEM_TEETH_DEPTH.length] ?? 0;
    const toothColor = column < 0 ? body : valley;
    for (let extra = 1; extra <= depth; extra++) painter.dot(extra === depth ? valley : toothColor, hemCenterX + column, shape.hemY + extra);
  }
}

const HOOD_HALF_WIDTHS = [3, 5, 7, 8, 8, 8, 8, 8, 8, 8, 7, 6];

// A deep hood that frames the face. The head is drawn over it, so the rim and the cowl behind the head show.
export function paintArcherHood(painter: SpritePainter, colors: HeroColors, centerX: number, headTop: number, headHeight: number): void {
  const hoodColor = colors.cloth;
  const hoodShade = darken(colors.clothShade, 0.8);
  const rows = Math.min(headHeight + 1, HOOD_HALF_WIDTHS.length);
  for (let index = 0; index < rows; index++) {
    const halfWidth = HOOD_HALF_WIDTHS[index] ?? 8;
    const row = headTop - 1 + index;
    painter.span(hoodColor, centerX - halfWidth, centerX + halfWidth, row);
    painter.span(colors.clothShade, centerX + halfWidth - 3, centerX + halfWidth, row);
    painter.dot(hoodShade, centerX + halfWidth, row);
    painter.dot(lighten(colors.cloth, 1.3), centerX - halfWidth, row);
  }
  painter.span(lighten(colors.cloth, 1.3), centerX - 2, centerX + 1, headTop - 1);
}

// A short mantle that covers both shoulders and hangs over the cloak clasp.
export function paintArcherMantle(painter: SpritePainter, colors: HeroColors, centerX: number, topY: number, halfWidth: number): void {
  const rows = [halfWidth - 2, halfWidth, halfWidth, halfWidth - 1, halfWidth - 2];
  rows.forEach((rowHalfWidth, index) => {
    const row = topY + index;
    painter.span(colors.cloth, centerX - rowHalfWidth, centerX + rowHalfWidth, row);
    painter.span(colors.clothShade, centerX + rowHalfWidth - 2, centerX + rowHalfWidth, row);
    painter.dot(lighten(colors.cloth, 1.3), centerX - rowHalfWidth, row);
  });
  painter.span(lighten(colors.cloth, 1.3), centerX - halfWidth + 2, centerX + 1, topY);
  painter.span(darken(colors.clothShade, 0.7), centerX - halfWidth + 1, centerX + halfWidth - 1, topY + rows.length);
  painter.rect(colors.trim, centerX, topY + 1, 1, 3);
  painter.dot(lighten(colors.trim), centerX, topY + 1);
}
