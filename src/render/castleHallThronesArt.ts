import { castleSpot } from '../content/castle';
import { ditherRect } from './castleDither';
import type { PixelCanvas } from './pixelCanvas';

function drawThrone(art: PixelCanvas, centerX: number, baseY: number, width: number, height: number, isRoyal: boolean): void {
  const left = centerX - width / 2;
  const top = baseY - height;
  art.fill('roofRedDark', left, top + 6, width, height - 6);
  art.fill('carpet', left + 3, top + 8, width - 6, height - 16);
  ditherRect(art, 'carpetDark', left + 3, top + 8, width - 6, height - 16, 5);
  art.fill('gold', left, top + 6, 2, height - 6);
  art.fill('gold', left + width - 2, top + 6, 2, height - 6);
  art.fill('gold', left, top + 6, width, 2);
  for (let step = 0; step < 4; step++) {
    const inset = step * 2;
    art.fill('gold', left + inset, top + 4 - step * 2, width - inset * 2, 2);
  }
  art.fill('gold', centerX - 1, top - 6, 2, 6);
  art.fill(isRoyal ? 'blood' : 'glassBlue', centerX - 1, top + 2, 2, 2);
  art.fill('flameBright', left, top + 6, 1, height - 10);
  const seatTop = baseY - 10;
  art.fill('carpetDark', left - 3, seatTop, width + 6, 6);
  art.fill('carpet', left - 2, seatTop, width + 4, 4);
  art.fill('gold', left - 3, seatTop + 4, width + 6, 2);
  art.fill('timber', left - 3, seatTop + 6, 4, 10 - 6);
  art.fill('timber', left + width - 1, seatTop + 6, 4, 4);
}

function drawPrincessThrone(art: PixelCanvas): void {
  const spot = castleSpot('princess-throne');
  const centerX = spot.x;
  const baseY = spot.y - 2;
  drawThrone(art, centerX, baseY, 18, 26, false);
  art.fill('cloud', centerX - 1, baseY - 24, 2, 22);
  art.fill('robeWhiteShade', centerX, baseY - 20, 1, 18);
  art.fill('cloud', centerX - 3, baseY - 4, 6, 2);
  art.fill('petalPink', centerX - 6, baseY - 16, 2, 2);
  art.fill('petalPink', centerX + 5, baseY - 14, 2, 2);
  art.fill('crop', centerX + 5, baseY - 12, 1, 4);
  art.fill('gold', centerX - 3, baseY - 14, 6, 1);
  art.fill('gold', centerX - 3, baseY - 16, 1, 2);
  art.fill('gold', centerX, baseY - 17, 1, 3);
  art.fill('gold', centerX + 2, baseY - 16, 1, 2);
}

function drawRoyalBanner(art: PixelCanvas, centerX: number): void {
  const width = 104;
  const left = centerX - width / 2;
  art.fill('gold', left - 4, 4, width + 8, 3);
  art.fill('carpet', left, 7, width, 104);
  art.fill('carpetDark', left, 7, 6, 104);
  art.fill('carpetDark', left + width - 6, 7, 6, 104);
  ditherRect(art, 'carpetDark', left + 6, 7, width - 12, 104, 3);
  art.fill('gold', left + 2, 9, width - 4, 1);
  art.fill('gold', left + 2, 9, 1, 98);
  art.fill('gold', left + width - 3, 9, 1, 98);
  for (let tooth = 0; tooth < width; tooth += 6) {
    art.fill('carpet', left + tooth, 111, 6, 5 - (tooth / 6) % 2 * 3);
    art.fill('gold', left + tooth + 2, 111, 2, 3);
  }
  drawForgeEmblem(art, centerX, 54);
}

// The kingdom's emblem: an anvil under a flame.
function drawForgeEmblem(art: PixelCanvas, centerX: number, centerY: number): void {
  art.fill('flame', centerX - 3, centerY - 22, 6, 12);
  art.fill('flame', centerX - 5, centerY - 16, 10, 6);
  art.fill('flameBright', centerX - 2, centerY - 18, 4, 8);
  art.fill('gold', centerX - 1, centerY - 14, 2, 4);
  art.fill('gold', centerX - 14, centerY - 4, 28, 5);
  art.fill('gold', centerX - 20, centerY - 3, 7, 3);
  art.fill('gold', centerX - 9, centerY + 1, 18, 6);
  art.fill('gold', centerX - 14, centerY + 7, 28, 4);
  art.fill('hayDark', centerX - 14, centerY + 9, 28, 2);
  art.fill('flameBright', centerX - 12, centerY - 4, 14, 1);
}

export function drawHallThrones(art: PixelCanvas): void {
  drawRoyalBanner(art, 242);
  drawThrone(art, 202, 144, 32, 56, false);
  drawThrone(art, 242, 144, 44, 66, true);
  drawPrincessThrone(art);
}
