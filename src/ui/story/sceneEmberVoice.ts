import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter, paintAnvil, SCENE_WIDTH } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

const FLOOR_Y = 62;
const HEARTH_X = 40;

function paintDarkRoom(painter: ScenePainter): void {
  painter.rect(color.nightDeep, 0, 0, SCENE_WIDTH, FLOOR_Y);
  painter.rect(color.ink, 0, FLOOR_Y, SCENE_WIDTH, 10);
  for (let beam = 0; beam < 4; beam++) painter.rect(color.nightSky, 6 + beam * 36, 0, 2, FLOOR_Y);
}

// Warm light is built from nested discs, from the faint outer glow to the bright core.
function paintHearthGlow(painter: ScenePainter): void {
  painter.disc(color.nightSky, 62, 56, 34);
  painter.disc(color.woodDark, 62, 54, 30);
  painter.disc(color.woodMid, 62, 58, 18);
  painter.rect(color.ink, 0, FLOOR_Y, SCENE_WIDTH, 10);
  painter.rect(color.woodDark, 44, FLOOR_Y, 36, 3);
  painter.rect(color.woodMid, 52, FLOOR_Y, 20, 2);
}

function paintHearthStone(painter: ScenePainter): void {
  painter.rect(color.nightSky, HEARTH_X, 20, 44, 42);
  painter.rect(color.nightHorizon, HEARTH_X, 20, 44, 3);
  painter.rect(color.woodDark, 46, 23, 3, 39);
  painter.rect(color.woodDark, 75, 23, 3, 39);
  for (let row = 0; row < 7; row++) painter.rect(color.nightDeep, HEARTH_X, 26 + row * 6, 44, 1);
  ([[44, 30], [48, 38], [44, 46], [76, 32], [78, 42], [74, 50]] as const).forEach(([x, y]) => {
    painter.rect(color.goldDark, x, y, 3, 1);
    painter.rect(color.goldDark, x, y, 1, 4);
    painter.rect(color.goldDark, x + 2, y + 2, 1, 3);
  });
  painter.rect(color.copper, 48, 36, 2, 26);
  painter.rect(color.copper, 74, 36, 2, 26);
  painter.rect(color.woodLight, 50, 34, 24, 2);
  painter.rect(color.ink, 50, 36, 24, 26);
  painter.rect(color.nightDeep, 50, 36, 24, 2);
  painter.rect(color.nightHorizon, 56, 28, 12, 6);
  painter.rect(color.goldDark, 60, 29, 4, 1);
}

function paintEmbers(painter: ScenePainter): void {
  painter.rect(color.woodDark, 52, 58, 20, 4);
  ([[54, 58, color.ember], [58, 59, color.emberBright], [62, 57, color.ember], [66, 59, color.copper], [69, 58, color.ember], [60, 61, color.crimson], [64, 61, color.ember]] as const).forEach(([x, y, tone]) =>
    painter.rect(tone as string, x as number, y as number, 2, 2));
  painter.rect(color.gold, 62, 57, 2, 1);
}

// The spark rises out of the hearth, and small notes curl up behind it like a voice.
function paintVoiceWisp(painter: ScenePainter): void {
  ([[62, 50, 1], [64, 44, 1], [62, 38, 1], [60, 32, 1], [62, 26, 1], [66, 20, 1], [70, 15, 1], [68, 10, 1]] as const).forEach(([x, y]) => {
    painter.rect(color.goldDark, x, y, 2, 2);
    painter.rect(color.gold, x, y, 1, 1);
  });
  painter.disc(color.goldDark, 62, 46, 3);
  painter.disc(color.emberBright, 62, 46, 2);
  painter.rect(color.windowWarm, 62, 45, 1, 2);
  ([[74, 22], [56, 18], [76, 8], [50, 8]] as const).forEach(([x, y]) => {
    painter.rect(color.gold, x, y + 2, 2, 2);
    painter.rect(color.gold, x + 2, y - 2, 1, 5);
    painter.rect(color.gold, x + 2, y - 2, 3, 1);
  });
}

function paintAnvilWithHammer(painter: ScenePainter): void {
  paintAnvil(painter, 6, 48, color.nightHorizon, color.nightSky);
  painter.rect(color.woodDark, 8, 46, 11, 2);
  painter.rect(color.stone, 18, 43, 5, 5);
  painter.rect(color.silver, 18, 43, 5, 2);
  painter.rect(color.silver, 22, 43, 1, 5);
  painter.rect(color.copper, 30, 48, 3, 1);
}

function paintSmithOnStool(painter: ScenePainter): void {
  painter.rect(color.woodDark, 94, 53, 14, 3);
  painter.rect(color.woodDark, 96, 56, 2, 6);
  painter.rect(color.woodDark, 104, 56, 2, 6);
  painter.rect(color.woodMid, 94, 38, 11, 15);
  painter.rect(color.copper, 94, 38, 1, 15);
  painter.rect(color.woodDark, 103, 38, 3, 15);
  painter.rect(color.woodMid, 86, 52, 12, 4);
  painter.rect(color.copper, 86, 52, 12, 1);
  painter.rect(color.woodDark, 86, 56, 4, 6);
  painter.rect(color.copper, 86, 56, 1, 6);
  painter.rect(color.woodMid, 89, 43, 6, 3);
  painter.rect(color.skin, 86, 43, 3, 3);
  painter.rect(color.skin, 93, 28, 9, 10);
  painter.rect(color.copper, 93, 28, 1, 10);
  painter.rect(color.woodDark, 94, 26, 11, 4);
  painter.rect(color.woodDark, 101, 28, 4, 10);
  painter.rect(color.ribbonWhite, 94, 31, 3, 3);
  painter.rect(color.ink, 94, 32, 1, 2);
  painter.rect(color.ember, 94, 36, 2, 1);
}

export function drawEmberVoice(): PixelDrawing {
  const painter = createScenePainter();
  paintDarkRoom(painter);
  paintHearthGlow(painter);
  paintHearthStone(painter);
  paintEmbers(painter);
  paintAnvilWithHammer(painter);
  paintSmithOnStool(painter);
  paintVoiceWisp(painter);
  return painter.drawing;
}
