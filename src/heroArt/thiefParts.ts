import type { HeroColors } from './heroPalette';
import type { SpritePainter } from './spritePainter';

interface ThiefArmShape {
  shoulderX: number;
  shoulderY: number;
  handX: number;
  handY: number;
  thickness: number;
}

// The arm starts at the outer edge of the shoulder, not at the neck. A dark sleeve covers the upper arm and a bracer ends it at the elbow.
export function paintThiefArm(painter: SpritePainter, colors: HeroColors, arm: ThiefArmShape): void {
  const { shoulderX, shoulderY, handX, handY, thickness } = arm;
  const elbowX = Math.round((shoulderX + handX) / 2);
  const elbowY = Math.round((shoulderY + handY) / 2);
  painter.line(colors.cloth, shoulderX, shoulderY, elbowX, elbowY, thickness);
  painter.line(colors.skin, elbowX, elbowY, handX, handY, thickness);
  painter.line(colors.skinShade, elbowX + 1, elbowY + 1, handX + 1, handY + 1);
  painter.rect(colors.clothShade, elbowX - 1, elbowY - 1, thickness + 1, 2);
  painter.rect(colors.trim, elbowX - 1, elbowY - 1, thickness + 1, 1);
  painter.rect(colors.cloth, shoulderX - 2, shoulderY - 1, thickness + 3, 3);
  painter.rect(colors.trim, shoulderX - 2, shoulderY - 1, thickness + 3, 1);
}
