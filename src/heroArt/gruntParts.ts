import type { SpritePainter } from './spritePainter';

const IRON = '#4a5468';
const IRON_MID = '#6f7a8c';
const IRON_LIGHT = '#c0c8d0';
const IRON_DEEP = '#2e3544';
const RIVET = '#e8e4d4';

// A domed iron shoulder plate with two spikes, like an orc grunt wears. Light comes from the top left, so the right edge is dark.
export function paintSpikedShoulder(painter: SpritePainter, left: number, top: number, width: number, height: number): void {
  for (let row = 0; row < height; row++) {
    const inset = row === 0 ? 2 : row === 1 ? 1 : 0;
    const from = left + inset;
    const to = left + width - 1 - inset;
    painter.span(IRON, from, to, top + row);
    painter.span(IRON_MID, from, Math.max(from, to - Math.ceil(width / 3)), top + row);
    painter.dot(IRON_DEEP, to, top + row);
    if (row >= 2) painter.dot(IRON_DEEP, to - 1, top + row);
  }
  painter.span(IRON_LIGHT, left + 2, left + width - 4, top);
  painter.span(IRON_LIGHT, left + 1, left + 2, top + 1);
  painter.span(IRON_DEEP, left + 1, left + width - 1, top + height - 1);
  for (const spikeX of [left + 2, left + width - 4]) {
    painter.rect(IRON_MID, spikeX, top - 2, 2, 2);
    painter.dot(IRON_LIGHT, spikeX, top - 2);
    painter.dot(IRON_LIGHT, spikeX, top - 3);
  }
  painter.dot(RIVET, left + 2, top + 2);
  painter.dot(RIVET, left + width - 4, top + 2);
}
