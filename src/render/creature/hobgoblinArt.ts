import { addOutline, createPixelCanvas, type PixelCanvas } from '../pixelCanvas';

type Shades = { light: `#${string}`; base: `#${string}`; dark: `#${string}` };

const SKIN: Shades = { light: '#e0a468', base: '#bf7a3c', dark: '#82502a' };
const IRON: Shades = { light: '#c4ccd8', base: '#8a94a6', dark: '#586274' };
const LEATHER: Shades = { light: '#8a6038', base: '#65421f', dark: '#3f2814' };
const GOLD: `#${string}` = '#e8b84a';
const EMBLEM_RED: `#${string}` = '#b02e2e';
const EYE_GLOW: `#${string}` = '#ffe45a';
const TUSK: `#${string}` = '#f2ead0';

function fillDisc(art: PixelCanvas, color: `#${string}`, centerX: number, centerY: number, radius: number): void {
  for (let row = -radius; row <= radius; row++) {
    const half = Math.round(Math.sqrt(radius * radius + 0.5 - row * row));
    art.fill(color, centerX - half, centerY + row, half * 2 + 1, 1);
  }
}

function drawLegsAndBoots(art: PixelCanvas): void {
  art.fill(LEATHER.dark, 12, 28, 5, 8);
  art.fill(LEATHER.base, 13, 28, 3, 8);
  art.fill(LEATHER.dark, 20, 28, 5, 8);
  art.fill(LEATHER.base, 21, 28, 3, 8);
  art.fill(IRON.dark, 11, 35, 7, 4);
  art.fill(IRON.base, 11, 35, 6, 3);
  art.fill(IRON.light, 11, 35, 6, 1);
  art.fill(IRON.dark, 19, 35, 7, 4);
  art.fill(IRON.base, 19, 35, 6, 3);
  art.fill(IRON.light, 19, 35, 6, 1);
  art.fill(LEATHER.dark, 10, 38, 8, 2);
  art.fill(LEATHER.dark, 19, 38, 8, 2);
  art.fill(GOLD, 14, 36, 1, 1);
  art.fill(GOLD, 22, 36, 1, 1);
}

function drawTorso(art: PixelCanvas): void {
  art.fill(LEATHER.dark, 10, 17, 17, 12);
  art.fill(LEATHER.base, 10, 17, 15, 11);
  art.fill(LEATHER.light, 10, 17, 15, 1);
  art.fill(IRON.dark, 12, 18, 13, 8);
  art.fill(IRON.base, 12, 18, 11, 7);
  art.fill(IRON.light, 12, 18, 11, 1);
  art.fill(IRON.light, 12, 19, 1, 5);
  art.fill(IRON.dark, 13, 21, 11, 1);
  art.fill(IRON.dark, 13, 24, 11, 1);
  art.fill(IRON.dark, 18, 18, 1, 7);
  for (const rivetX of [14, 21]) {
    art.fill(GOLD, rivetX, 19, 1, 1);
    art.fill(GOLD, rivetX, 22, 1, 1);
  }
  art.fill(LEATHER.dark, 15, 25, 1, 1);
  art.fill(LEATHER.dark, 22, 25, 1, 1);
  art.fill(LEATHER.dark, 10, 26, 17, 3);
  art.fill(LEATHER.light, 10, 26, 15, 1);
  art.fill(GOLD, 17, 26, 3, 3);
  art.fill(LEATHER.dark, 18, 27, 1, 1);
  art.fill(LEATHER.base, 11, 29, 3, 3);
  art.fill(LEATHER.base, 23, 29, 3, 3);
}

function drawHead(art: PixelCanvas): void {
  art.fill(SKIN.dark, 11, 7, 15, 10);
  art.fill(SKIN.base, 11, 7, 13, 9);
  art.fill(SKIN.light, 11, 7, 3, 3);
  art.fill(SKIN.dark, 9, 10, 2, 4);
  art.fill(SKIN.base, 9, 10, 1, 3);
  art.fill(SKIN.dark, 26, 10, 2, 4);
  art.fill('#17110d', 12, 9, 5, 2);
  art.fill('#17110d', 20, 9, 5, 2);
  art.fill(EYE_GLOW, 14, 10, 2, 1);
  art.fill(EYE_GLOW, 21, 10, 2, 1);
  art.fill('#17110d', 12, 9, 2, 1);
  art.fill('#17110d', 23, 9, 2, 1);
  art.fill(SKIN.dark, 18, 11, 1, 3);
  art.fill('#2a1710', 13, 14, 11, 2);
  art.fill('#17110d', 13, 14, 11, 1);
  art.fill(TUSK, 13, 13, 2, 3);
  art.fill(TUSK, 22, 13, 2, 3);
  art.fill('#b8ae8a', 13, 15, 2, 1);
  art.fill('#b8ae8a', 22, 15, 2, 1);
  art.fill(SKIN.dark, 15, 16, 7, 1);
}

function drawHelmet(art: PixelCanvas): void {
  art.fill(IRON.dark, 11, 2, 15, 6);
  art.fill(IRON.base, 12, 2, 12, 5);
  art.fill(IRON.light, 12, 2, 8, 1);
  art.fill(IRON.light, 12, 3, 2, 3);
  art.fill(IRON.dark, 10, 6, 17, 2);
  art.fill(IRON.base, 10, 6, 15, 1);
  art.fill(IRON.light, 14, 1, 8, 1);
  art.fill(IRON.dark, 17, 1, 3, 7);
  art.fill(IRON.base, 17, 1, 2, 7);
  art.fill(IRON.dark, 17, 8, 3, 6);
  art.fill(IRON.base, 17, 8, 2, 5);
  art.fill(IRON.light, 17, 8, 1, 4);
  art.fill(GOLD, 13, 4, 1, 1);
  art.fill(GOLD, 23, 4, 1, 1);
  art.fill(EMBLEM_RED, 17, 0, 3, 1);
  art.fill(EMBLEM_RED, 18, 1, 1, 1);
}

function drawPauldrons(art: PixelCanvas): void {
  fillDisc(art, IRON.dark, 9, 18, 4);
  fillDisc(art, IRON.base, 8, 17, 3);
  art.fill(IRON.light, 6, 15, 3, 1);
  art.fill(IRON.light, 5, 16, 1, 2);
  art.fill(GOLD, 8, 18, 1, 1);
  fillDisc(art, IRON.dark, 28, 18, 4);
  fillDisc(art, IRON.base, 27, 17, 3);
  art.fill(IRON.light, 25, 15, 3, 1);
  art.fill(IRON.light, 24, 16, 1, 2);
  art.fill(GOLD, 28, 18, 1, 1);
}

function drawCleaverArm(art: PixelCanvas): void {
  art.fill(SKIN.dark, 28, 20, 4, 8);
  art.fill(SKIN.base, 28, 20, 3, 7);
  art.fill(SKIN.light, 28, 20, 1, 5);
  art.fill(IRON.dark, 27, 19, 6, 2);
  art.fill(IRON.base, 27, 19, 5, 1);
  art.fill(LEATHER.dark, 30, 10, 2, 18);
  art.fill(LEATHER.light, 30, 11, 1, 17);
  art.fill(SKIN.dark, 28, 24, 5, 4);
  art.fill(SKIN.base, 28, 24, 4, 3);
  art.fill(SKIN.light, 28, 24, 4, 1);
  art.fill(GOLD, 29, 28, 4, 1);
  art.fill(IRON.dark, 28, 1, 8, 9);
  art.fill(IRON.base, 28, 1, 7, 8);
  art.context.clearRect(27, 8, 2, 2);
  art.fill(IRON.light, 28, 1, 7, 1);
  art.fill(IRON.light, 28, 2, 1, 5);
  art.fill(IRON.dark, 29, 8, 7, 2);
  art.fill('#eef2f8', 35, 4, 1, 6);
  art.fill(IRON.dark, 34, 9, 2, 2);
  art.fill('#eef2f8', 35, 9, 1, 2);
  art.fill(IRON.dark, 29, 4, 3, 1);
  art.fill(IRON.dark, 29, 6, 2, 1);
  art.fill(IRON.dark, 35, 1, 1, 2);
  art.fill(GOLD, 30, 10, 3, 1);
}

function drawRoundShield(art: PixelCanvas): void {
  art.fill(SKIN.dark, 7, 21, 5, 7);
  art.fill(SKIN.base, 7, 21, 4, 6);
  fillDisc(art, '#3f2814', 6, 24, 7);
  fillDisc(art, LEATHER.base, 6, 23, 6);
  fillDisc(art, EMBLEM_RED, 6, 24, 5);
  fillDisc(art, '#8a2020', 7, 25, 4);
  art.fill('#d44a4a', 2, 21, 3, 1);
  art.fill('#d44a4a', 1, 22, 1, 3);
  art.fill(GOLD, 3, 20, 7, 1);
  art.fill(GOLD, 3, 28, 7, 1);
  art.fill(GOLD, 0, 24, 1, 1);
  art.fill(GOLD, 12, 24, 1, 1);
  fillDisc(art, IRON.base, 6, 24, 2);
  art.fill(IRON.light, 5, 23, 2, 1);
  art.fill(IRON.dark, 7, 25, 1, 1);
  art.fill(GOLD, 6, 24, 1, 1);
}

export function drawHobgoblin(): HTMLCanvasElement {
  const art = createPixelCanvas(36, 40);
  drawLegsAndBoots(art);
  drawTorso(art);
  drawCleaverArm(art);
  drawHead(art);
  drawHelmet(art);
  drawPauldrons(art);
  drawRoundShield(art);
  addOutline(art, 'outline');
  return art.canvas;
}
