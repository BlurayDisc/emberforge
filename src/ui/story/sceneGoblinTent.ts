import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

const FLOOR_TOP = 58;
const FIRE_X = 100;

const HIDE_PATCHES: readonly (readonly [number, number, number, number])[] = [[6, 26, 22, 14], [30, 30, 16, 18], [88, 24, 20, 16], [110, 34, 14, 14], [50, 20, 28, 10]];
const TROPHY_TEETH: readonly (readonly [number, number, number])[] = [[-2, 15, 8], [4, 15, 12], [-1, 28, 6], [3, 28, 9]];

const COIN_POSITIONS: readonly (readonly [number, number])[] = [
  [64, 40], [68, 42], [72, 43], [66, 45], [71, 45], [76, 44], [62, 47], [67, 47], [74, 47], [79, 46], [78, 49], [84, 50], [81, 53], [86, 54],
];

function paintHideWalls(painter: ScenePainter): void {
  painter.rect(color.woodDark, 0, 0, 128, FLOOR_TOP);
  for (let row = 0; row < 22; row++) {
    painter.rect(color.ink, 0, row, 46 - row * 2 > 0 ? 46 - row * 2 : 0, 1);
    painter.rect(color.ink, 82 + row * 2 < 128 ? 82 + row * 2 : 128, row, 128, 1);
  }
  painter.rect(color.woodMid, 6, 26, 22, 14);
  painter.rect(color.hillNight, 30, 30, 16, 18);
  painter.rect(color.woodMid, 88, 24, 20, 16);
  painter.rect(color.hillNight, 110, 34, 14, 14);
  painter.rect(color.woodMid, 50, 20, 28, 10);
  HIDE_PATCHES.forEach(([x, y, width, height]) => {
    for (let stitch = 0; stitch < width; stitch += 3) {
      painter.rect(color.ink, x + stitch, y, 1, 1);
      painter.rect(color.ink, x + stitch, y + height - 1, 1, 1);
    }
    for (let stitch = 0; stitch < height; stitch += 3) {
      painter.rect(color.ink, x, y + stitch, 1, 1);
      painter.rect(color.ink, x + width - 1, y + stitch, 1, 1);
    }
  });
  painter.rect(color.ink, 63, 0, 2, 20);
}

function paintFloor(painter: ScenePainter): void {
  painter.rect(color.ink, 0, FLOOR_TOP, 128, 14);
  painter.rect(color.woodDark, 0, FLOOR_TOP + 1, 128, 3);
  for (let patch = 0; patch < 8; patch++) painter.rect(color.woodMid, 6 + patch * 17, FLOOR_TOP + 6 + (patch % 3) * 2, 8, 1);
}

function paintTrophyPole(painter: ScenePainter, x: number): void {
  painter.rect(color.woodLight, x, 4, 3, FLOOR_TOP - 4);
  painter.rect(color.woodPale, x, 4, 1, FLOOR_TOP - 4);
  painter.rect(color.woodMid, x + 2, 4, 1, FLOOR_TOP - 4);
  painter.rect(color.woodMid, x - 2, 14, 7, 1);
  TROPHY_TEETH.forEach(([toothOffset, toothY, length]) => {
    painter.rect(color.woodPale, x + toothOffset, toothY, 1, 2);
    painter.rect(color.parchment, x + toothOffset, toothY + 2, 1, length > 8 ? 4 : 3);
  });
  painter.rect(color.parchment, x - 3, 38, 9, 1);
  painter.rect(color.parchment, x - 4, 37, 2, 3);
  painter.rect(color.parchment, x + 5, 37, 2, 3);
  painter.rect(color.woodMid, x - 2, 37, 1, 1);
}

function paintCrate(painter: ScenePainter, x: number, y: number, width: number, height: number): void {
  painter.rect(color.ink, x - 1, y - 1, width + 2, height + 2);
  painter.rect(color.woodMid, x, y, width, height);
  painter.rect(color.woodLight, x, y, width, 2);
  painter.rect(color.woodDark, x, y + height - 2, width, 2);
  painter.rect(color.woodDark, x + 2, y + 3, 1, height - 5);
  painter.rect(color.woodDark, x + width - 3, y + 3, 1, height - 5);
  painter.rect(color.woodDark, x + 3, y + Math.floor(height / 2), width - 6, 1);
}

function paintBarrel(painter: ScenePainter, x: number, y: number): void {
  painter.rect(color.ink, x - 1, y, 16, 22);
  painter.rect(color.woodMid, x, y + 1, 14, 20);
  painter.rect(color.woodLight, x + 2, y + 1, 3, 20);
  painter.rect(color.woodDark, x + 10, y + 1, 4, 20);
  painter.rect(color.stone, x, y + 4, 14, 2);
  painter.rect(color.stone, x, y + 15, 14, 2);
  painter.rect(color.woodLight, x, y, 14, 2);
}

function paintStolenGoods(painter: ScenePainter): void {
  paintCrate(painter, 4, 46, 22, 14);
  paintCrate(painter, 8, 36, 14, 10);
  painter.rect(color.crimson, 22, 40, 6, 6);
  paintBarrel(painter, 28, 40);
  paintCrate(painter, 104, 48, 18, 14);
  painter.rect(color.parchment, 108, 44, 8, 4);
  painter.rect(color.stone, 110, 42, 4, 2);
}

function paintCoin(painter: ScenePainter, x: number, y: number): void {
  painter.rect(color.stone, x, y + 1, 3, 1);
  painter.rect(color.silver, x, y, 3, 1);
  painter.rect(color.parchment, x, y, 1, 1);
}

function paintSparkle(painter: ScenePainter, x: number, y: number): void {
  painter.rect(color.parchment, x, y - 2, 1, 5);
  painter.rect(color.parchment, x - 2, y, 5, 1);
}

function paintPouchAndCoins(painter: ScenePainter): void {
  paintCrate(painter, 48, 47, 34, 16);
  painter.disc(color.ink, 60, 43, 7);
  painter.disc(color.woodLight, 60, 43, 6);
  painter.disc(color.woodPale, 58, 42, 3);
  painter.rect(color.woodMid, 62, 45, 5, 4);
  painter.rect(color.ink, 55, 36, 12, 4);
  painter.rect(color.woodDark, 56, 35, 10, 1);
  painter.rect(color.woodPale, 54, 38, 14, 1);
  painter.rect(color.silver, 57, 37, 8, 2);
  COIN_POSITIONS.forEach(([x, y]) => paintCoin(painter, x, y));
  paintSparkle(painter, 61, 32);
  paintSparkle(painter, 74, 40);
  paintSparkle(painter, 83, 47);
}

function paintFireGlow(painter: ScenePainter): void {
  for (let ring = 3; ring >= 1; ring--) {
    const radius = ring * 9;
    for (let y = FLOOR_TOP - radius; y < 72; y++) {
      for (let x = FIRE_X - radius; x <= FIRE_X + radius; x++) {
        const distance = (x - FIRE_X) ** 2 + ((y - 62) * 1.6) ** 2;
        if (distance < radius * radius && (x + y) % 2 === 0 && y < FLOOR_TOP + 14) {
          painter.rect(ring === 1 ? color.ember : color.woodLight, x, y, 1, 1);
        }
      }
    }
  }
}

function paintFire(painter: ScenePainter): void {
  painter.rect(color.stone, FIRE_X - 9, 66, 19, 3);
  painter.rect(color.ink, FIRE_X - 8, 67, 17, 1);
  painter.rect(color.woodDark, FIRE_X - 7, 64, 15, 3);
  painter.rect(color.woodLight, FIRE_X - 7, 64, 15, 1);
  const flameHalfWidths = [0, 1, 1, 2, 3, 4, 5, 5, 5, 4, 3];
  flameHalfWidths.forEach((halfWidth, row) => {
    const y = 53 + row;
    painter.rect(color.ember, FIRE_X - halfWidth, y, halfWidth * 2 + 1, 1);
    if (row > 3) painter.rect(color.emberBright, FIRE_X - halfWidth + 1, y, halfWidth * 2 - 1, 1);
    if (row > 6) painter.rect(color.gold, FIRE_X - halfWidth + 3, y, Math.max(halfWidth * 2 - 5, 1), 1);
  });
  painter.rect(color.ember, FIRE_X - 4, 55, 1, 3);
  painter.rect(color.ember, FIRE_X + 4, 56, 1, 2);
}

export function drawGoblinTent(): PixelDrawing {
  const painter = createScenePainter();
  paintHideWalls(painter);
  paintFloor(painter);
  paintFireGlow(painter);
  paintTrophyPole(painter, 18);
  paintTrophyPole(painter, 108);
  paintStolenGoods(painter);
  paintPouchAndCoins(painter);
  paintFire(painter);
  return painter.drawing;
}
