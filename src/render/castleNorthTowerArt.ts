import { castleSpot } from '../content/castle';
import { drawRoundTower, SLATE_ROOF } from './castleWallArt';
import type { PixelCanvas } from './pixelCanvas';

// Where the white mourning ribbon hangs from the broken window. The view lays a waving ribbon here.
export function northTowerWindow(): { x: number; y: number } {
  const spot = castleSpot('north-tower');
  return { x: spot.x, y: spot.y - spot.height + 36 };
}

// The north tower holds the princess's chamber. It rises over the ward in front of the curtain wall.
export function drawNorthTower(art: PixelCanvas): void {
  const spot = castleSpot('north-tower');
  const roofHeight = 26;
  const topY = spot.y - spot.height + roofHeight;
  drawRoundTower(art, spot.x, topY, spot.y, spot.width, { ...SLATE_ROOF, roofHeight });
  const window = northTowerWindow();
  art.fill('outline', window.x - 6, window.y - 2, 12, 18);
  art.fill('stoneLight', window.x - 5, window.y - 1, 10, 16);
  art.fill('void', window.x - 4, window.y + 3, 8, 12);
  art.fill('void', window.x - 3, window.y, 6, 4);
  art.fill('timber', window.x - 4, window.y + 8, 8, 1);
  art.fill('glassBlue', window.x - 4, window.y + 3, 2, 4);
  art.fill('glassBlue', window.x + 1, window.y + 10, 3, 4);
  art.fill('stoneDark', window.x - 6, window.y + 15, 12, 3);
  for (const bandY of [topY + 22, topY + 40]) {
    art.fill('stoneLight', spot.x - spot.width / 2 - 1, bandY, spot.width + 2, 2);
    art.fill('stoneDark', spot.x - spot.width / 2 - 1, bandY + 2, spot.width + 2, 1);
  }
  art.fill('void', spot.x - 9, topY + 30, 2, 8);
  art.fill('void', spot.x + 8, topY + 30, 2, 8);
}
