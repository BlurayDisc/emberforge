import { addOutline, createPixelCanvas, type PixelCanvas } from '../pixelCanvas';
import { ellipse, shadedBlob, type Hex, type Tones } from './creatureShading';

type Point = readonly [number, number];

const LEG_NEAR: Tones = { base: '#62507a', light: '#9a84b8', dark: '#3a2d4a' };
const LEG_FAR: Tones = { base: '#3e3150', light: '#54456a', dark: '#271e34' };
const SHELL: Tones = { base: '#4f3b57', light: '#79608a', dark: '#2a2036' };
const BARK: Tones = { base: '#5a4630', light: '#85693f', dark: '#33271a' };

function line(art: PixelCanvas, from: Point, to: Point, color: Hex, thickness: number): void {
  const steps = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]));
  for (let step = 0; step <= steps; step++) {
    const x = Math.round(from[0] + ((to[0] - from[0]) * step) / steps);
    const y = Math.round(from[1] + ((to[1] - from[1]) * step) / steps);
    art.fill(color, x, y, thickness, thickness);
  }
}

// Each leg: hip, knee (arched high up and out), foot on the ground.
function drawLeg(art: PixelCanvas, hip: Point, knee: Point, foot: Point, tones: Tones, thickness: number): void {
  line(art, hip, knee, tones.base, thickness);
  line(art, knee, foot, tones.dark, thickness);
  line(art, [knee[0], knee[1] + 1], [Math.round((hip[0] + knee[0]) / 2), Math.round((hip[1] + knee[1]) / 2)], tones.light, 1);
  art.fill(tones.light, knee[0], knee[1], 2, 2);
  art.fill(tones.dark, foot[0], foot[1], 2, 1);
}

function drawAbdomenMarkings(art: PixelCanvas): void {
  const stripe = '#2b1f14';
  for (const stripeX of [24, 28, 32, 36]) {
    for (let y = 0; y < 8; y++) {
      const bend = Math.round(Math.sin(y / 7 * Math.PI) * 1.5);
      art.fill(stripe, stripeX - bend, 7 + y, 2, 1);
    }
  }
  art.fill('#a8844d', 26, 8, 2, 1);
  art.fill('#a8844d', 30, 7, 2, 1);
  art.fill('#c9a45e', 23, 9, 2, 2);
  ellipse(art, 31, 16, 3, 1.5, '#c0392b');
  art.fill('#e8604a', 30, 15, 2, 1);
}

function drawFuzz(art: PixelCanvas): void {
  for (const [x, y] of [[8, 11], [10, 9], [13, 8], [16, 9], [18, 11], [19, 15], [8, 17], [12, 20]] as const) {
    art.fill(SHELL.light, x, y, 1, 1);
    art.fill(SHELL.dark, x, y - 1, 1, 1);
  }
}

function drawEyes(art: PixelCanvas): void {
  for (const [x, y, size] of [[6, 11, 2], [9, 10, 2], [12, 10, 2], [8, 13, 1], [11, 13, 1]] as const) {
    art.fill('#7a1010', x, y, size, size);
    art.fill('#ff5a3c', x, y, 1, 1);
  }
  art.fill('#ffe9a0', 6, 11, 1, 1);
  art.fill('#ffe9a0', 9, 10, 1, 1);
}

function drawFangs(art: PixelCanvas): void {
  art.fill(SHELL.dark, 4, 15, 4, 3);
  art.fill('#3a2c44', 5, 15, 2, 2);
  art.fill('#f2e8c8', 4, 18, 2, 4);
  art.fill('#f2e8c8', 8, 18, 2, 4);
  art.fill('#b9a97c', 5, 20, 1, 2);
  art.fill('#b9a97c', 9, 20, 1, 2);
  art.fill('#9bd84a', 4, 23, 1, 1);
  art.fill('#9bd84a', 9, 24, 1, 2);
}

export function drawSpider(): HTMLCanvasElement {
  const art = createPixelCanvas(42, 30);
  drawLeg(art, [13, 15], [4, 2], [2, 27], LEG_FAR, 1);
  drawLeg(art, [17, 15], [20, 2], [16, 27], LEG_FAR, 1);
  drawLeg(art, [24, 15], [30, 1], [28, 27], LEG_FAR, 1);
  drawLeg(art, [26, 16], [41, 6], [38, 27], LEG_FAR, 1);

  drawLeg(art, [19, 18], [26, 3], [21, 28], LEG_NEAR, 2);
  drawLeg(art, [21, 19], [40, 9], [34, 28], LEG_NEAR, 2);
  shadedBlob(art, 29, 14, 10, 9, BARK);
  drawAbdomenMarkings(art);
  art.fill(BARK.dark, 22, 20, 14, 1);

  drawLeg(art, [10, 17], [1, 9], [5, 28], LEG_NEAR, 2);
  drawLeg(art, [14, 18], [7, 3], [11, 28], LEG_NEAR, 2);

  art.fill(SHELL.base, 18, 12, 6, 5);
  art.fill(SHELL.dark, 18, 16, 6, 1);
  shadedBlob(art, 12, 15, 8, 7, SHELL);
  drawFuzz(art);
  drawEyes(art);
  drawFangs(art);
  addOutline(art, 'outline');
  return art.canvas;
}
