import type { SpritePainter } from './spritePainter';

const IRON = '#4a5468';
const IRON_LIGHT = '#c0c8d0';
const IRON_DEEP = '#2e3544';
const RIVET = '#e8e4d4';

// A heavy iron shoulder plate with two spikes, like an orc grunt wears. Spikes point up and away from the body.
export function paintSpikedShoulder(painter: SpritePainter, left: number, top: number, width: number, height: number): void {
  painter.rect(IRON, left, top, width, height);
  painter.rect(IRON_LIGHT, left, top, width, 1);
  painter.rect(IRON_DEEP, left, top + height - 1, width, 1);
  painter.rect(IRON_DEEP, left + width - 1, top, 1, height);
  for (const spikeX of [left + 1, left + width - 3]) {
    painter.rect(IRON_LIGHT, spikeX, top - 2, 1, 2);
    painter.dot(IRON_LIGHT, spikeX, top - 3);
  }
  painter.dot(RIVET, left + Math.floor(width / 2), top + 2);
}
