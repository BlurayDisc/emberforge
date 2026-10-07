import { addOutline, createPixelCanvas, type PixelCanvas } from '../pixelCanvas';
import { shadedBlob, type Hex, type Tones } from './creatureShading';

export function drawGoblinBody(art: PixelCanvas, skin: Tones, cloth: Hex, scale: 1 | 2): void {
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

const SKIN: Tones = { base: '#6aa84f', light: '#9bd46f', dark: '#3a6e2b' };
const LEATHER: Tones = { base: '#8a5a3a', light: '#b07c50', dark: '#4e2f1d' };

function drawPointedEar(art: PixelCanvas, tipX: number, tipY: number, baseX: number, baseY: number, direction: 1 | -1): void {
  const rows = baseY - tipY;
  for (let row = 0; row <= rows; row++) {
    const reach = Math.round((row / rows) * Math.abs(baseX - tipX));
    const left = direction === -1 ? baseX - reach : baseX;
    art.fill(row < rows / 2 ? SKIN.light : SKIN.base, left, tipY + row, reach + 1, 1);
  }
  art.fill(SKIN.dark, direction === -1 ? baseX - 2 : baseX, baseY - 1, 3, 1);
}

function drawLegs(art: PixelCanvas): void {
  art.fill(SKIN.base, 8, 24, 3, 6);
  art.fill(SKIN.dark, 8, 28, 3, 2);
  art.fill(SKIN.base, 16, 24, 3, 6);
  art.fill(SKIN.dark, 16, 28, 3, 2);
  art.fill('#3a2a1c', 5, 30, 6, 2);
  art.fill('#5a4030', 5, 30, 4, 1);
  art.fill('#3a2a1c', 16, 30, 7, 2);
  art.fill('#5a4030', 16, 30, 4, 1);
}

function drawTorsoAndLoincloth(art: PixelCanvas): void {
  shadedBlob(art, 13.5, 19, 6, 5, SKIN);
  art.fill(LEATHER.dark, 9, 15, 10, 8);
  art.fill(LEATHER.base, 9, 15, 8, 7);
  art.fill(LEATHER.light, 9, 15, 4, 2);
  art.fill(SKIN.dark, 13, 16, 2, 5);
  art.fill('#c9a24e', 10, 17, 2, 1);
  art.fill('#c9a24e', 17, 19, 1, 1);
  art.fill(LEATHER.dark, 9, 21, 10, 1);
  art.fill('#c9a24e', 13, 21, 2, 1);
  art.fill('#7a2a2a', 9, 22, 10, 4);
  art.fill('#a04040', 9, 22, 4, 2);
  art.fill('#4a1a1a', 10, 25, 2, 1);
  art.fill('#4a1a1a', 14, 25, 3, 1);
  art.fill('#4a1a1a', 17, 24, 2, 2);
}

function drawArms(art: PixelCanvas): void {
  art.fill(SKIN.dark, 4, 15, 4, 3);
  art.fill(SKIN.base, 4, 15, 3, 2);
  art.fill(SKIN.base, 3, 18, 3, 6);
  art.fill(SKIN.dark, 5, 19, 1, 5);
  art.fill(SKIN.light, 3, 18, 1, 3);
  art.fill(SKIN.base, 2, 24, 4, 2);
  art.fill(SKIN.dark, 2, 25, 4, 1);
  art.fill(LEATHER.dark, 18, 14, 4, 3);
  art.fill(LEATHER.base, 18, 14, 3, 2);
  art.fill(SKIN.base, 20, 16, 3, 5);
  art.fill(SKIN.dark, 22, 17, 1, 4);
  art.fill(SKIN.light, 20, 16, 1, 3);
  art.fill(SKIN.base, 21, 20, 4, 3);
  art.fill(SKIN.dark, 21, 22, 4, 1);
}

function drawDagger(art: PixelCanvas): void {
  art.fill('#c0c8d0', 24, 10, 2, 9);
  art.fill('#eef2f6', 24, 10, 1, 8);
  art.fill('#8a94a0', 25, 11, 1, 8);
  art.fill('#e0e6ec', 24, 9, 1, 1);
  art.fill('#c9a24e', 22, 19, 5, 1);
  art.fill('#7a5a2a', 22, 20, 5, 1);
  art.fill('#6a4a2a', 24, 20, 2, 3);
  art.fill('#3a2a1c', 24, 23, 2, 1);
}

function drawHead(art: PixelCanvas): void {
  drawPointedEar(art, 0, 2, 7, 8, -1);
  drawPointedEar(art, 26, 2, 19, 8, 1);
  shadedBlob(art, 13.5, 9.5, 6.5, 6, SKIN);
  art.fill('#2a1a10', 8, 6, 4, 1);
  art.fill('#2a1a10', 15, 6, 4, 1);
  art.fill('#2a1a10', 11, 7, 1, 1);
  art.fill('#2a1a10', 15, 7, 1, 1);
  art.fill('#ffd23e', 9, 7, 3, 2);
  art.fill('#ffd23e', 15, 7, 3, 2);
  art.fill('#fff6a0', 9, 7, 1, 1);
  art.fill('#fff6a0', 15, 7, 1, 1);
  art.fill('#17110d', 11, 7, 1, 2);
  art.fill('#17110d', 16, 7, 1, 2);
  art.fill(SKIN.light, 13, 9, 2, 2);
  art.fill(SKIN.base, 14, 11, 3, 1);
  art.fill(SKIN.dark, 16, 11, 1, 1);
  art.fill(SKIN.dark, 15, 12, 1, 1);
  art.fill('#17110d', 8, 13, 11, 2);
  art.fill('#17110d', 7, 12, 1, 1);
  art.fill('#17110d', 19, 12, 1, 1);
  art.fill('#f2ecd0', 9, 13, 2, 1);
  art.fill('#f2ecd0', 12, 13, 1, 2);
  art.fill('#f2ecd0', 16, 13, 2, 1);
  art.fill('#d8c890', 18, 13, 1, 1);
  art.fill('#f2ecd0', 10, 14, 1, 1);
  art.fill('#f2ecd0', 14, 14, 1, 1);
  art.fill('#d8c890', 17, 14, 1, 1);
}

export function drawGoblin(): HTMLCanvasElement {
  const art = createPixelCanvas(28, 33);
  drawLegs(art);
  drawArms(art);
  drawTorsoAndLoincloth(art);
  drawHead(art);
  drawDagger(art);
  addOutline(art, 'outline');
  return art.canvas;
}
