import { MATERIAL, type HeroColors } from '../heroPalette';
import { paintHumanHead } from '../maleHeadArt';
import type { SpritePainter } from '../spritePainter';

const HEADBAND_ROW = 3;

export function paintFighterHead(painter: SpritePainter, colors: HeroColors, centerX: number, headTop: number): void {
  paintHumanHead(painter, colors, centerX - 6, headTop);
  painter.span(MATERIAL.red, centerX - 5, centerX + 5, headTop + HEADBAND_ROW);
  painter.span(MATERIAL.redDark, centerX - 5, centerX + 5, headTop + HEADBAND_ROW + 1);
  painter.dot(MATERIAL.gold, centerX, headTop + HEADBAND_ROW);
}
