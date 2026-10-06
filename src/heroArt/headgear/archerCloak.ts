import type { HeroColors } from '../heroPalette';
import { darken } from '../heroPalette';
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

// The cloak hangs behind the body and flares out to a torn hem, so the silhouette is wide at the bottom and narrow at the shoulders.
export function paintArcherCloak(painter: SpritePainter, colors: HeroColors, shape: CloakShape): void {
  const rows = shape.hemY - shape.shoulderY;
  for (let step = 0; step <= rows; step++) {
    const progress = step / rows;
    const halfWidth = Math.round(shape.shoulderHalfWidth + (shape.hemHalfWidth - shape.shoulderHalfWidth) * progress);
    const centerX = shape.centerX - Math.round(shape.hemSway * progress);
    const row = shape.shoulderY + step;
    painter.span(darken(colors.clothShade, 0.8), centerX - halfWidth, centerX + halfWidth, row);
    painter.dot(colors.clothShade, centerX + halfWidth, row);
    painter.dot(colors.cloth, centerX - halfWidth, row);
    if (step === rows) painter.span(colors.clothShade, centerX - halfWidth, centerX + halfWidth, row);
  }
  for (let tooth = 0; tooth < 3; tooth++) {
    const toothX = shape.centerX - shape.hemSway - shape.hemHalfWidth + 2 + tooth * 4;
    painter.rect(darken(colors.clothShade, 0.8), toothX, shape.hemY + 1, 2, 1);
  }
}

// A deep hood that frames the face. The head is drawn over it, so only the rim shows.
export function paintArcherHood(painter: SpritePainter, colors: HeroColors, centerX: number, headTop: number, headHeight: number): void {
  const hoodColor = darken(colors.clothShade, 0.85);
  for (let row = -1; row < headHeight; row++) {
    const halfWidth = row < 1 ? 4 + (row + 1) * 1 : 7;
    painter.span(hoodColor, centerX - halfWidth, centerX + halfWidth, headTop + row);
    painter.dot(colors.cloth, centerX - halfWidth, headTop + row);
  }
}
