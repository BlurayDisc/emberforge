import { addOutline, createPixelCanvas, type PixelCanvas } from './pixelCanvas';

type Hex = `#${string}`;

interface Tones {
  base: Hex;
  light: Hex;
  dark: Hex;
}

function ellipse(art: PixelCanvas, centerX: number, centerY: number, radiusX: number, radiusY: number, color: Hex): void {
  for (let y = Math.floor(centerY - radiusY); y <= Math.ceil(centerY + radiusY); y++) {
    for (let x = Math.floor(centerX - radiusX); x <= Math.ceil(centerX + radiusX); x++) {
      const normalized = ((x - centerX) / radiusX) ** 2 + ((y - centerY) / radiusY) ** 2;
      if (normalized <= 1) art.fill(color, x, y, 1, 1);
    }
  }
}

function shadedBlob(art: PixelCanvas, centerX: number, centerY: number, radiusX: number, radiusY: number, tones: Tones): void {
  ellipse(art, centerX, centerY, radiusX, radiusY, tones.dark);
  ellipse(art, centerX - 0.5, centerY - 1, radiusX - 1, radiusY - 1.5, tones.base);
  ellipse(art, centerX - radiusX * 0.3, centerY - radiusY * 0.4, radiusX * 0.45, radiusY * 0.35, tones.light);
}

function drawRat(): HTMLCanvasElement {
  const art = createPixelCanvas(26, 18);
  const fur: Tones = { base: '#8b6f55', light: '#a68a6f', dark: '#5e4a38' };
  art.fill('#d9a0a0', 19, 11, 6, 1);
  art.fill('#d9a0a0', 23, 9, 2, 2);
  shadedBlob(art, 13, 10, 9, 5, fur);
  shadedBlob(art, 5, 9, 5, 4, fur);
  art.fill('#8b6f55', 4, 3, 4, 4);
  art.fill('#d9a0a0', 5, 4, 2, 2);
  art.fill('#8b6f55', 8, 3, 4, 4);
  art.fill('#d9a0a0', 9, 4, 2, 2);
  art.fill('#17110d', 0, 10, 2, 2);
  art.fill('#c0392b', 3, 8, 2, 2);
  art.fill('#ffffff', 2, 12, 1, 2);
  art.fill('#ead9a8', 0, 9, 3, 1);
  for (const x of [8, 13, 17]) art.fill('#d9a0a0', x, 14, 2, 3);
  addOutline(art, 'outline');
  return art.canvas;
}

function drawWolf(): HTMLCanvasElement {
  const art = createPixelCanvas(40, 28);
  const fur: Tones = { base: '#8a8a9a', light: '#b8b8c8', dark: '#585866' };
  art.fill('#585866', 33, 6, 4, 10);
  art.fill('#8a8a9a', 34, 6, 3, 8);
  for (const x of [10, 14, 26, 31]) art.fill(x === 10 || x === 26 ? '#585866' : '#8a8a9a', x, 18, 4, 8);
  for (const x of [10, 14, 26, 31]) art.fill('#17110d', x, 25, 4, 1);
  shadedBlob(art, 22, 14, 13, 7, fur);
  for (let spike = 14; spike < 32; spike += 3) art.fill('#585866', spike, 6, 2, 2);
  shadedBlob(art, 9, 11, 7, 6, fur);
  art.fill('#8a8a9a', 0, 12, 7, 5);
  art.fill('#d8d4cc', 0, 15, 6, 2);
  art.fill('#17110d', 0, 12, 2, 2);
  art.fill('#ffffff', 3, 17, 1, 3);
  art.fill('#ffffff', 6, 17, 1, 3);
  art.fill('#585866', 7, 3, 3, 5);
  art.fill('#585866', 11, 3, 3, 5);
  art.fill('#ffd75e', 7, 9, 3, 2);
  art.fill('#17110d', 8, 9, 1, 2);
  addOutline(art, 'outline');
  return art.canvas;
}

function drawGoblinBody(art: PixelCanvas, skin: Tones, cloth: Hex, scale: 1 | 2): void {
  const unit = (value: number): number => value * scale;
  art.fill('#4a3322', unit(7), unit(20), unit(3), unit(8));
  art.fill('#4a3322', unit(12), unit(20), unit(3), unit(8));
  art.fill('#2a2a3a', unit(6), unit(27), unit(4), unit(2));
  art.fill('#2a2a3a', unit(12), unit(27), unit(4), unit(2));
  shadedBlob(art, unit(11), unit(16), unit(6), unit(6), { base: cloth, light: '#c9a24e', dark: '#4a2f1d' });
  art.fill(skin.base, unit(3), unit(13), unit(3), unit(8));
  art.fill(skin.base, unit(16), unit(13), unit(3), unit(8));
  art.fill(skin.dark, unit(3), unit(19), unit(3), unit(2));
  art.fill(skin.dark, unit(16), unit(19), unit(3), unit(2));
  shadedBlob(art, unit(11), unit(7), unit(6), unit(5), skin);
  art.fill(skin.base, unit(1), unit(6), unit(4), unit(2));
  art.fill(skin.base, 0, unit(5), unit(2), unit(2));
  art.fill(skin.base, unit(17), unit(6), unit(4), unit(2));
  art.fill(skin.base, unit(20), unit(5), unit(2), unit(2));
  art.fill('#ffd75e', unit(8), unit(6), unit(2), unit(2));
  art.fill('#ffd75e', unit(12), unit(6), unit(2), unit(2));
  art.fill('#17110d', unit(9), unit(6), unit(1), unit(2));
  art.fill('#17110d', unit(13), unit(6), unit(1), unit(2));
  art.fill('#17110d', unit(8), unit(10), unit(6), unit(1));
  art.fill('#ffffff', unit(9), unit(11), unit(1), unit(1));
  art.fill('#ffffff', unit(12), unit(11), unit(1), unit(1));
}

function drawGoblin(): HTMLCanvasElement {
  const art = createPixelCanvas(26, 32);
  drawGoblinBody(art, { base: '#6aa84f', light: '#8bc86f', dark: '#3f7a2f' }, '#8a5a3a', 1);
  art.fill('#8a6340', 20, 8, 2, 14);
  art.fill('#6a4a2a', 19, 4, 4, 6);
  art.fill('#c0c8d0', 22, 5, 1, 3);
  addOutline(art, 'outline');
  return art.canvas;
}

function drawGoblinChief(): HTMLCanvasElement {
  const art = createPixelCanvas(48, 62);
  drawGoblinBody(art, { base: '#5f9a45', light: '#86c46a', dark: '#356a28' }, '#8a2a2a', 2);
  art.fill('#c0c8d0', 2, 24, 8, 6);
  art.fill('#c0c8d0', 34, 24, 8, 6);
  art.fill('#6f7a8c', 2, 28, 8, 2);
  art.fill('#6f7a8c', 34, 28, 8, 2);
  for (let tooth = 0; tooth < 5; tooth++) art.fill('#f2c14e', 15 + tooth * 4, 0, 3, tooth % 2 === 0 ? 6 : 4);
  art.fill('#f2c14e', 15, 4, 20, 4);
  art.fill('#b23a3a', 24, 5, 3, 2);
  art.fill('#8a6340', 40, 16, 4, 28);
  art.fill('#c0c8d0', 36, 6, 12, 14);
  art.fill('#6f7a8c', 36, 18, 12, 2);
  art.fill('#17110d', 20, 34, 12, 2);
  addOutline(art, 'outline');
  return art.canvas;
}

export const CREATURE_DRAWERS: Readonly<Record<string, () => HTMLCanvasElement>> = {
  'monster-rat': drawRat,
  'monster-wolf': drawWolf,
  'monster-goblin': drawGoblin,
  'monster-goblin-chief': drawGoblinChief,
};
