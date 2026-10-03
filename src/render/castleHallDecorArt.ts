import { castleSpot } from '../content/castle';
import { ditherRect } from './castleDither';
import type { PixelCanvas } from './pixelCanvas';

// A tall pointed window of coloured glass. The glass shows the Ember Forge fire.
export function drawStainedWindow(art: PixelCanvas, centerX: number, bottomY: number, width: number, height: number): void {
  const left = centerX - width / 2;
  const top = bottomY - height;
  art.fill('stoneLight', left - 3, top + 6, width + 6, height - 6);
  art.fill('stoneDark', left - 3, top + 6, 1, height - 6);
  for (let row = 0; row < 12; row++) {
    const inset = Math.round(Math.sqrt(144 - (12 - row) * (12 - row)) * (width / 24));
    const half = Math.min(width / 2 + 3, inset + 3);
    art.fill('stoneLight', centerX - half, top + row, half * 2, 1);
  }
  const glassTop = top + 5;
  const glassHeight = bottomY - glassTop - 3;
  const panes = ['glassBlue', 'glassBlue', 'glassGreen', 'glassBlue'] as const;
  for (let row = 0; row < glassHeight; row++) {
    const arch = row < 10 ? Math.round(Math.sqrt(100 - (10 - row) * (10 - row)) * (width / 20)) : width / 2;
    const half = Math.min(width / 2, arch);
    art.fill(panes[Math.floor((row * 4) / glassHeight)] ?? 'glassBlue', centerX - half, glassTop + row, half * 2, 1);
  }
  const middleY = glassTop + glassHeight * 0.55;
  art.fill('flame', centerX - 6, middleY - 10, 12, 20);
  art.fill('flame', centerX - 9, middleY - 2, 18, 12);
  art.fill('flameBright', centerX - 4, middleY - 6, 8, 14);
  art.fill('gold', centerX - 2, middleY - 1, 4, 7);
  art.fill('glassRed', centerX - width / 2, bottomY - 22, width, 4);
  art.fill('gold', centerX - 1, glassTop, 2, glassHeight);
  art.fill('gold', centerX - width / 2, glassTop + Math.round(glassHeight / 3), width, 1);
  art.fill('gold', centerX - width / 2, glassTop + Math.round((glassHeight * 2) / 3), width, 1);
  ditherRect(art, 'cloud', left, glassTop + 2, width, 6, 3);
  art.fill('stoneDark', left - 4, bottomY - 3, width + 8, 3);
  art.fill('stoneLight', left - 4, bottomY - 3, width + 8, 1);
}

export function drawPrincessPortrait(art: PixelCanvas): void {
  const spot = castleSpot('princess-portrait');
  const left = spot.x - spot.width / 2;
  const top = spot.y - spot.height;
  art.fill('gold', left, top, spot.width, spot.height);
  art.fill('hayDark', left, top, spot.width, 1);
  art.fill('hayDark', left, top + spot.height - 1, spot.width, 1);
  art.fill('timber', left + 3, top + 3, spot.width - 6, spot.height - 6);
  art.fill('woodDark', left + 4, top + 4, spot.width - 8, spot.height - 8);
  const centerX = spot.x;
  art.fill('hairBrown', centerX - 8, top + 10, 16, 24);
  art.fill('leatherDark', centerX - 8, top + 24, 3, 10);
  art.fill('glassBlue', centerX - 8, top + 34, 16, 8);
  art.fill('cloud', centerX - 3, top + 34, 6, 2);
  art.fill('skin', centerX - 5, top + 12, 10, 12);
  art.fill('skinShade', centerX - 5, top + 22, 10, 2);
  art.fill('hairBrown', centerX - 6, top + 10, 12, 4);
  art.fill('hairBrown', centerX - 6, top + 12, 2, 8);
  art.fill('hairBrown', centerX + 4, top + 12, 2, 8);
  art.fill('void', centerX - 3, top + 17, 2, 2);
  art.fill('void', centerX + 1, top + 17, 2, 2);
  art.fill('cloud', centerX - 3, top + 17, 1, 1);
  art.fill('cloud', centerX + 1, top + 17, 1, 1);
  art.fill('petalPink', centerX - 1, top + 21, 2, 1);
  art.fill('gold', centerX - 5, top + 9, 10, 1);
  art.fill('glassBlue', centerX - 1, top + 8, 2, 2);
  art.fill('night', left + spot.width - 7, top + 2, 6, 3);
  art.fill('night', left + spot.width - 3, top + 4, 3, 14);
  art.fill('night', left + 1, top + spot.height - 6, 6, 5);
  const shelfY = spot.y + 6;
  art.fill('timber', left - 2, shelfY, spot.width + 4, 3);
  for (const candleX of [left + 2, left + spot.width - 5]) {
    art.fill('bone', candleX, shelfY - 8, 3, 8);
    art.fill('flame', candleX, shelfY - 11, 3, 3);
    art.fill('flameBright', candleX + 1, shelfY - 11, 1, 2);
  }
  art.fill('cloud', spot.x - 4, shelfY - 2, 8, 2);
}

export function drawFoundingTapestry(art: PixelCanvas): void {
  const spot = castleSpot('founding-tapestry');
  const left = spot.x - spot.width / 2;
  const top = spot.y - spot.height;
  art.fill('gold', left - 3, top, spot.width + 6, 3);
  art.fill('gold', left - 5, top - 1, 3, 5);
  art.fill('gold', left + spot.width + 2, top - 1, 3, 5);
  art.fill('carpetDark', left, top + 3, spot.width, spot.height - 3);
  art.fill('gold', left + 2, top + 5, spot.width - 4, spot.height - 9);
  art.fill('royalPurpleDark', left + 3, top + 6, spot.width - 6, spot.height - 11);
  const sceneLeft = left + 3;
  const sceneTop = top + 6;
  const sceneWidth = spot.width - 6;
  for (const [starX, starY] of [[6, 4], [18, 9], [34, 5], [42, 12], [11, 15]] as const) art.fill('gold', sceneLeft + starX, sceneTop + starY, 1, 1);
  art.fill('mountainShade', sceneLeft, sceneTop + 22, sceneWidth, 10);
  for (let peak = 0; peak < sceneWidth; peak++) art.fill('mountainShade', sceneLeft + peak, sceneTop + 16 + Math.abs(((peak + 6) % 22) - 11) / 2, 1, 8);
  art.fill('stoneDark', sceneLeft + 10, sceneTop + 36, sceneWidth - 20, 22);
  art.fill('void', sceneLeft + 16, sceneTop + 42, sceneWidth - 32, 16);
  art.fill('flame', sceneLeft + 19, sceneTop + 44, sceneWidth - 38, 14);
  art.fill('flameBright', sceneLeft + 22, sceneTop + 48, sceneWidth - 44, 10);
  art.fill('flame', sceneLeft + 22, sceneTop + 32, 6, 8);
  art.fill('flameBright', sceneLeft + 23, sceneTop + 35, 3, 5);
  art.fill('steelDark', sceneLeft + 6, sceneTop + 62, 18, 4);
  art.fill('steelDark', sceneLeft + 10, sceneTop + 66, 10, 3);
  art.fill('skin', sceneLeft + 30, sceneTop + 54, 5, 5);
  art.fill('hairBrown', sceneLeft + 29, sceneTop + 58, 7, 6);
  art.fill('blood', sceneLeft + 30, sceneTop + 64, 5, 6);
  art.fill('steel', sceneLeft + 36, sceneTop + 56, 2, 8);
  art.fill('steel', sceneLeft + 34, sceneTop + 54, 6, 3);
  for (let tassel = 0; tassel < spot.width; tassel += 5) art.fill('gold', left + tassel, spot.y - 2, 2, 4);
}
