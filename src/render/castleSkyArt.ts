import { LOGICAL_WIDTH } from '../kernel/stageSize';
import { ditherDisc, ditherFade, fillDisc } from './castleDither';
import type { PaletteColor } from './palette';
import type { PixelCanvas } from './pixelCanvas';

export const HORIZON_Y = 86;

const SKY_BANDS: ReadonlyArray<readonly [PaletteColor, number]> = [
  ['skyHigh', 0],
  ['skyMid', 26],
  ['skyLow', 52],
  ['skyHaze', 76],
];

export const SUN_POSITION = { x: 396, y: 36 };

export function drawSky(art: PixelCanvas): void {
  SKY_BANDS.forEach(([color, top], index) => {
    const bottom = SKY_BANDS[index + 1]?.[1] ?? HORIZON_Y + 12;
    art.fill(color, 0, top, LOGICAL_WIDTH, bottom - top);
    const next = SKY_BANDS[index + 1];
    if (next) ditherFade(art, next[0], 0, bottom - 8, LOGICAL_WIDTH, 8, 0, 14);
  });
  ditherDisc(art, 'skyHaze', SUN_POSITION.x, SUN_POSITION.y, 34, 4);
  ditherDisc(art, 'sunGlow', SUN_POSITION.x, SUN_POSITION.y, 24, 6);
  ditherDisc(art, 'sunGlow', SUN_POSITION.x, SUN_POSITION.y, 17, 11);
  fillDisc(art, 'sunGlow', SUN_POSITION.x, SUN_POSITION.y, 11);
  fillDisc(art, 'snow', SUN_POSITION.x, SUN_POSITION.y, 8);
}

function mountainHeight(x: number, base: number, amplitude: number, phase: number): number {
  return base + amplitude * Math.sin(x * 0.035 + phase) + amplitude * 0.55 * Math.sin(x * 0.091 + phase * 2) + amplitude * 0.25 * Math.sin(x * 0.213 + phase * 3);
}

function drawRange(art: PixelCanvas, base: number, amplitude: number, phase: number, body: PaletteColor, shade: PaletteColor, hasSnow: boolean): void {
  for (let x = 0; x < LOGICAL_WIDTH; x++) {
    const height = mountainHeight(x, base, amplitude, phase);
    const top = HORIZON_Y + 4 - height;
    const facesAwayFromSun = mountainHeight(x + 3, base, amplitude, phase) > height;
    art.fill(facesAwayFromSun ? shade : body, x, top, 1, height);
    if (hasSnow && height > base + amplitude * 0.45) {
      const snowDepth = Math.round((height - base - amplitude * 0.45) * 0.9) + 1;
      art.fill(facesAwayFromSun ? 'cloudShade' : 'snow', x, top, 1, snowDepth);
    }
  }
  ditherFade(art, 'skyHaze', 0, HORIZON_Y - 12, LOGICAL_WIDTH, 16, 0, 9);
}

export function drawMountains(art: PixelCanvas): void {
  drawRange(art, 30, 14, 1.2, 'mountainFar', 'mountainNear', true);
  drawRange(art, 12, 6, 0.4, 'mountainNear', 'mountainShade', false);
}

// A dark tower on the horizon with a thread of smoke. The castle folk do not talk about it.
export function drawFarSpire(art: PixelCanvas, centerX: number, bottomY: number): void {
  art.fill('night', centerX - 4, bottomY - 34, 8, 34);
  art.fill('void', centerX - 4, bottomY - 34, 2, 34);
  art.fill('night', centerX - 6, bottomY - 38, 12, 5);
  for (const spikeX of [-6, -2, 2, 5]) art.fill('night', centerX + spikeX, bottomY - 44, 1, 7);
  art.fill('night', centerX - 1, bottomY - 50, 2, 8);
  art.fill('blood', centerX - 1, bottomY - 28, 2, 3);
  art.fill('blood', centerX - 1, bottomY - 20, 2, 2);
  for (let puff = 0; puff < 9; puff++) {
    const puffX = centerX + 4 + Math.round(Math.sin(puff * 0.8) * 3) + puff;
    ditherDisc(art, 'shadow', puffX, bottomY - 52 - puff * 4, 2 + Math.floor(puff / 3), 9);
  }
}
