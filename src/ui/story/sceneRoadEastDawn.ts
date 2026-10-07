import type { PixelDrawing } from '../pixelDraw';
import { createScenePainter, type ScenePainter, paintBands, SCENE_HEIGHT } from './scenePainter';
import { STORY_COLORS as color } from './storyPalette';

const HORIZON_Y = 36;

function roadCenterX(y: number): number {
  const progress = (y - HORIZON_Y) / (SCENE_HEIGHT - HORIZON_Y);
  return Math.round(108 - 60 * progress);
}

function paintSky(painter: ScenePainter): void {
  paintBands(painter, [color.nightSky, color.duskViolet, color.dawnRose, color.duskOrange, color.copper, color.gold], HORIZON_Y);
  painter.disc(color.duskOrange, 88, HORIZON_Y - 2, 17);
  painter.disc(color.windowWarm, 88, HORIZON_Y - 2, 11);
  painter.disc(color.ribbonWhite, 88, HORIZON_Y - 2, 6);
  ([[20, 8], [50, 12], [78, 6], [110, 10]] as const).forEach(([x, y]) => painter.rect(color.dawnRose, x, y, 12, 1));
  ([[10, 18], [60, 20], [92, 16]] as const).forEach(([x, y]) => painter.rect(color.copper, x, y, 14, 1));
}

function paintMountainRange(painter: ScenePainter): void {
  const peaks = [[56, 9], [66, 13], [110, 17], [122, 12]] as const;
  peaks.forEach(([x, height]) => {
    for (let row = 0; row < height; row++) painter.rect(color.royalPurpleDark, x - row, HORIZON_Y - height + row, row * 2 + 1, 1);
  });
  painter.rect(color.royalPurpleDark, 48, HORIZON_Y - 3, 80, 3);
  painter.rect(color.royalPurple, 110, HORIZON_Y - 16, 1, 8);
  painter.rect(color.royalPurple, 66, HORIZON_Y - 12, 1, 6);
}

// One thin thread of black smoke rises far beyond the mountains.
function paintFarSmoke(painter: ScenePainter): void {
  for (let step = 0; step < 18; step++) painter.rect(color.ink, 118 + Math.round(Math.sin(step / 4) * 1.5), HORIZON_Y - 8 - step, 1, 1);
}

function paintSleepingTown(painter: ScenePainter): void {
  painter.rect(color.hillNight, 0, 40, 60, 12);
  ([[2, 30, 10], [14, 26, 8], [24, 32, 9], [36, 28, 10], [48, 33, 8]] as const).forEach(([x, top, width]) => {
    painter.rect(color.woodMid, x, top, width, 42 - top);
    painter.rect(color.gold, x, top, width, 1);
    painter.rect(color.copper, x + width - 2, top + 1, 2, 42 - top);
    painter.rect(color.woodDark, x, top + 1, width - 2, 41 - top);
    painter.rect(color.windowWarm, x + 2, top + 4, 2, 2);
  });
  painter.rect(color.woodMid, 2, 16, 8, 14);
  painter.rect(color.gold, 2, 16, 1, 14);
  painter.rect(color.woodDark, 3, 17, 6, 13);
  painter.rect(color.windowWarm, 5, 20, 2, 3);
  for (let row = 0; row < 5; row++) painter.rect(color.gold, 3 + row, 11 + row, 6 - row * 2, 1);
  painter.rect(color.crimson, 6, 7, 1, 4);
  for (let step = 0; step < 22; step++) painter.rect(color.woodMid, 36 + step * 2, 43 + Math.floor(step * 0.5), 5, 2);
  for (let step = 0; step < 22; step++) painter.rect(color.copper, 37 + step * 2, 43 + Math.floor(step * 0.5), 3, 1);
}

function paintEastGateWithCaptain(painter: ScenePainter): void {
  painter.rect(color.stone, 28, 20, 20, 24);
  painter.rect(color.gold, 28, 20, 20, 1);
  painter.rect(color.copper, 44, 21, 4, 23);
  [28, 33, 38, 43].forEach((x) => painter.rect(color.stone, x, 17, 3, 3));
  painter.rect(color.woodDark, 33, 30, 10, 14);
  painter.rect(color.ink, 34, 31, 8, 13);
  painter.rect(color.windowWarm, 38, 24, 2, 2);
  painter.rect(color.silver, 37, 12, 4, 5);
  painter.rect(color.crimson, 38, 17, 2, 3);
  painter.rect(color.skin, 38, 11, 2, 1);
  painter.rect(color.silver, 42, 10, 1, 4);
  painter.rect(color.skin, 42, 9, 1, 1);
}

function paintGroundAndRoad(painter: ScenePainter): void {
  painter.rect(color.hillNight, 0, HORIZON_Y, 128, SCENE_HEIGHT - HORIZON_Y);
  painter.rect(color.green, 60, HORIZON_Y, 68, 1);
  for (let y = HORIZON_Y + 4; y < SCENE_HEIGHT; y++) {
    const halfWidth = Math.round(2 + (y - HORIZON_Y) * 0.55);
    painter.rect(color.woodMid, roadCenterX(y) - halfWidth - 1, y, 2 * halfWidth + 2, 1);
    painter.rect(color.copper, roadCenterX(y) - halfWidth, y, 2 * halfWidth, 1);
  }
  for (let y = HORIZON_Y + 4; y < SCENE_HEIGHT; y += 3) painter.rect(color.dawnRose, roadCenterX(y) + 2, y, 3, 1);
}

function paintTraveller(painter: ScenePainter, x: number, feetY: number, height: number, bodyColor: string, packColor: string): void {
  painter.rect(color.ink, x, feetY - height, 5, height);
  painter.rect(bodyColor, x, feetY - height + 4, 5, height - 7);
  painter.rect(color.ink, x + 1, feetY - height - 3, 3, 4);
  painter.rect(packColor, x - 2, feetY - height + 3, 3, 5);
  painter.rect(color.gold, x + 4, feetY - height, 1, height - 2);
  painter.rect(color.ink, x, feetY - 2, 2, 2);
  painter.rect(color.ink, x + 3, feetY - 1, 2, 1);
}

function paintPartyWalkingEast(painter: ScenePainter): void {
  const travellers = [[52, 6, 9, color.woodDark, color.woodMid], [56, -6, 10, color.woodDark, color.stone], [61, 10, 10, color.ink, color.woodMid], [65, -10, 12, color.woodDark, color.woodLight], [70, 0, 14, color.woodLight, color.woodPale]] as const;
  travellers.forEach(([feetY, offset, height, body, pack]) => paintTraveller(painter, roadCenterX(feetY as number) + (offset as number), feetY as number, height as number, body as string, pack as string));
  const smithX = roadCenterX(70);
  painter.rect(color.ribbonWhite, smithX + 4, 62, 2, 4);
  painter.rect(color.ribbonWhite, smithX + 5, 66, 1, 1);
}

// Dawn at the east gate. The sleeping town glows gold behind the party as they walk toward the far smoke.
export function drawRoadEastDawn(): PixelDrawing {
  const painter = createScenePainter();
  paintSky(painter);
  paintMountainRange(painter);
  paintFarSmoke(painter);
  paintGroundAndRoad(painter);
  paintSleepingTown(painter);
  paintEastGateWithCaptain(painter);
  paintPartyWalkingEast(painter);
  return painter.drawing;
}
