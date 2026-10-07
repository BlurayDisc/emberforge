import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

const DESK_TOP = 50;
const CANDLE_X = 40;
const STEWARD_X = 66;

function paintStoneWall(painter: ScenePainter): void {
  painter.rect(color.nightSky, 0, 0, 128, 56);
  for (let row = 0; row < 8; row++) {
    painter.rect(color.nightDeep, 0, row * 7 + 6, 128, 1);
    for (let block = row % 2 * 8; block < 128; block += 16) {
      painter.rect(color.nightDeep, block, row * 7, 1, 7);
      if ((block + row * 5) % 3 === 0) painter.rect(color.nightHorizon, block + 2, row * 7 + 1, 12, 2);
    }
  }
  painter.rect(color.nightDeep, 0, 56, 128, 16);
  painter.rect(color.woodDark, 0, 58, 128, 14);
  for (let plank = 0; plank < 128; plank += 14) painter.rect(color.ink, plank, 58, 1, 14);
}

function paintCandleGlow(painter: ScenePainter): void {
  for (let y = 20; y < DESK_TOP; y++) {
    for (let x = CANDLE_X - 22; x <= CANDLE_X + 22; x++) {
      const distance = (x - CANDLE_X) ** 2 + ((y - 40) * 1.4) ** 2;
      if (distance < 400 && (x + y) % 2 === 0) painter.rect(distance < 130 ? color.woodMid : color.woodDark, x, y, 1, 1);
    }
  }
}

function paintBarredWindow(painter: ScenePainter): void {
  painter.rect(color.nightHorizon, 8, 6, 26, 34);
  painter.rect(color.ink, 10, 8, 22, 30);
  painter.rect(color.nightDeep, 11, 9, 20, 28);
  painter.rect(color.nightHorizon, 11, 9, 20, 12);
  painter.disc(color.moon, 24, 15, 3);
  for (let bar = 0; bar < 4; bar++) painter.rect(color.ink, 14 + bar * 5, 9, 2, 28);
  painter.rect(color.ink, 11, 22, 20, 2);
}

function paintChest(painter: ScenePainter): void {
  painter.rect(color.ink, 104, 38, 22, 24);
  painter.rect(color.woodMid, 105, 40, 20, 21);
  painter.rect(color.woodLight, 105, 40, 20, 3);
  painter.rect(color.woodDark, 105, 56, 20, 5);
  painter.rect(color.stone, 105, 46, 20, 2);
  painter.rect(color.stone, 107, 40, 2, 21);
  painter.rect(color.stone, 121, 40, 2, 21);
  painter.rect(color.goldDark, 112, 45, 6, 6);
  painter.rect(color.gold, 113, 46, 4, 3);
  painter.rect(color.ink, 114, 48, 2, 2);
}

function paintDesk(painter: ScenePainter): void {
  painter.rect(color.ink, 20, DESK_TOP - 1, 88, 24);
  painter.rect(color.woodLight, 21, DESK_TOP, 86, 3);
  painter.rect(color.woodPale, 21, DESK_TOP, 86, 1);
  painter.rect(color.woodMid, 24, DESK_TOP + 3, 80, 19);
  painter.rect(color.woodDark, 24, DESK_TOP + 3, 80, 2);
  painter.rect(color.woodDark, 62, DESK_TOP + 6, 28, 12);
  painter.rect(color.woodMid, 64, DESK_TOP + 8, 24, 8);
  painter.rect(color.goldDark, 75, DESK_TOP + 11, 2, 2);
}

function paintSteward(painter: ScenePainter): void {
  painter.rect(color.ink, STEWARD_X - 12, 34, 25, 17);
  painter.rect(color.nightDeep, STEWARD_X - 11, 35, 23, 16);
  painter.rect(color.nightSky, STEWARD_X - 11, 35, 3, 16);
  painter.rect(color.ink, STEWARD_X - 1, 36, 2, 14);
  painter.rect(color.dawnRose, STEWARD_X - 2, 31, 5, 4);
  painter.rect(color.woodMid, STEWARD_X - 2, 33, 5, 1);
  for (let link = -8; link <= 8; link++) painter.rect(color.gold, STEWARD_X + link, 36 + Math.floor((64 - link * link) / 20), 1, 1);
  painter.rect(color.gold, STEWARD_X - 1, 41, 3, 3);
  painter.rect(color.goldDark, STEWARD_X, 42, 1, 1);
  painter.rect(color.ink, STEWARD_X - 5, 16, 11, 3);
  painter.rect(color.stone, STEWARD_X - 5, 19, 2, 4);
  painter.rect(color.stone, STEWARD_X + 4, 19, 2, 4);
  painter.rect(color.parchment, STEWARD_X - 4, 19, 9, 5);
  painter.rect(color.parchment, STEWARD_X - 3, 24, 7, 3);
  painter.rect(color.parchment, STEWARD_X - 2, 27, 5, 2);
  painter.rect(color.dawnRose, STEWARD_X - 1, 29, 3, 1);
  painter.rect(color.dawnRose, STEWARD_X + 2, 19, 2, 8);
  painter.rect(color.woodMid, STEWARD_X - 3, 20, 3, 1);
  painter.rect(color.woodMid, STEWARD_X + 1, 20, 3, 1);
  painter.rect(color.ink, STEWARD_X - 2, 21, 1, 1);
  painter.rect(color.ink, STEWARD_X + 2, 21, 1, 1);
  painter.rect(color.dawnRose, STEWARD_X, 22, 1, 3);
  painter.rect(color.crimson, STEWARD_X - 1, 26, 3, 1);
  painter.rect(color.woodMid, STEWARD_X - 2, 25, 1, 1);
  painter.rect(color.woodMid, STEWARD_X + 2, 25, 1, 1);
}

function paintCoinStack(painter: ScenePainter, x: number, height: number): void {
  for (let coin = 0; coin < height; coin++) {
    const y = DESK_TOP - 2 - coin * 2;
    const lean = coin % 2;
    painter.rect(color.goldDark, x + lean, y + 1, 6, 1);
    painter.rect(color.gold, x + lean, y, 6, 1);
    painter.rect(color.parchment, x + lean, y, 1, 1);
  }
}

function paintArmAndCoin(painter: ScenePainter): void {
  painter.rect(color.nightDeep, STEWARD_X + 12, 42, 10, 5);
  painter.rect(color.ink, STEWARD_X + 12, 46, 10, 1);
  painter.rect(color.parchment, STEWARD_X + 21, 44, 4, 3);
  painter.rect(color.gold, STEWARD_X + 23, 42, 3, 2);
  painter.rect(color.parchment, STEWARD_X + 23, 42, 1, 1);
}

function paintLedgerAndCandle(painter: ScenePainter): void {
  painter.rect(color.woodDark, 44, DESK_TOP - 5, 22, 5);
  painter.rect(color.parchment, 45, DESK_TOP - 6, 10, 5);
  painter.rect(color.parchment, 56, DESK_TOP - 6, 9, 5);
  painter.rect(color.woodPale, 55, DESK_TOP - 6, 1, 5);
  for (let line = 0; line < 3; line++) {
    painter.rect(color.woodPale, 47, DESK_TOP - 5 + line * 2 - 1, 7, 1);
    painter.rect(color.woodPale, 57, DESK_TOP - 5 + line * 2 - 1, 7, 1);
  }
  painter.rect(color.ink, 32, DESK_TOP - 1, 12, 1);
  painter.rect(color.woodPale, CANDLE_X - 4, DESK_TOP - 3, 9, 2);
  painter.rect(color.parchment, CANDLE_X - 1, DESK_TOP - 12, 3, 9);
  painter.rect(color.woodPale, CANDLE_X + 1, DESK_TOP - 12, 1, 9);
  painter.rect(color.ink, CANDLE_X, DESK_TOP - 14, 1, 2);
  painter.rect(color.emberBright, CANDLE_X - 1, DESK_TOP - 18, 3, 4);
  painter.rect(color.gold, CANDLE_X, DESK_TOP - 17, 1, 3);
  painter.rect(color.ember, CANDLE_X, DESK_TOP - 19, 1, 1);
}

export function drawStewardCoins(): PixelDrawing {
  const painter = createScenePainter();
  paintStoneWall(painter);
  paintCandleGlow(painter);
  paintBarredWindow(painter);
  paintChest(painter);
  paintSteward(painter);
  paintArmAndCoin(painter);
  paintDesk(painter);
  paintLedgerAndCandle(painter);
  const coinStacks: readonly (readonly [number, number])[] = [[72, 3], [80, 5], [88, 2], [95, 4]];
  coinStacks.forEach(([x, height]) => paintCoinStack(painter, x, height));
  return painter.drawing;
}
