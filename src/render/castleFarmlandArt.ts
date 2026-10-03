import { LOGICAL_WIDTH } from '../kernel/stageSize';
import { ditherFade } from './castleDither';
import { HORIZON_Y } from './castleSkyArt';
import type { PaletteColor } from './palette';
import type { PixelCanvas } from './pixelCanvas';

const GROUND_BOTTOM = 200;
const DEPTH_SCALE = 3600;
const DEPTH_OFFSET = 40;
const LATERAL_SCALE = 214;
const FIELD_DEPTH = 5.5;
const FIELD_WIDTH = 6;

type FieldKind = 'wheat' | 'greenCrop' | 'plowed' | 'meadow' | 'darkCrop';
const FIELD_KINDS: readonly FieldKind[] = ['wheat', 'greenCrop', 'plowed', 'meadow', 'darkCrop', 'wheat', 'greenCrop', 'meadow'];

// A hash instead of a random stream, so a field looks the same however the pixels are visited.
function hashToUnit(first: number, second: number, salt: number): number {
  let mixed = Math.imul(first, 374761393) + Math.imul(second, 668265263) + Math.imul(salt, 1013904223);
  mixed = Math.imul(mixed ^ (mixed >>> 13), 1274126177);
  return ((mixed ^ (mixed >>> 16)) >>> 0) / 4294967296;
}

interface GroundCell {
  key: number;
  kind: FieldKind;
  depth: number;
  lateral: number;
}

function groundCellAt(x: number, y: number): GroundCell {
  const depth = DEPTH_SCALE / (y - HORIZON_Y + DEPTH_OFFSET);
  const lateral = ((x - LOGICAL_WIDTH / 2) * depth) / LATERAL_SCALE;
  const row = Math.floor(depth / FIELD_DEPTH);
  const shift = hashToUnit(row, 0, 1) * FIELD_WIDTH * 2;
  const column = Math.floor((lateral + shift) / (FIELD_WIDTH * (1 + Math.floor(hashToUnit(row, 5, 9) * 2))));
  const kind = FIELD_KINDS[Math.floor(hashToUnit(row, column, 3) * FIELD_KINDS.length)] as FieldKind;
  return { key: row * 100000 + column + 50000, kind, depth, lateral };
}

function fieldColor(cell: GroundCell, x: number, y: number): PaletteColor {
  const acrossStripe = Math.floor(cell.lateral * 1.3) % 2 === 0;
  const alongStripe = Math.floor(cell.depth * 1.4) % 2 === 0;
  if (cell.kind === 'wheat') return acrossStripe ? 'wheat' : 'wheatDark';
  if (cell.kind === 'greenCrop') return acrossStripe ? 'crop' : 'cropDark';
  if (cell.kind === 'darkCrop') return alongStripe ? 'cropDark' : 'crop';
  if (cell.kind === 'plowed') return alongStripe ? 'plowed' : 'plowedDark';
  return (x * 7 + y * 13) % 11 === 0 ? 'crop' : 'meadow';
}

function drawFieldPatchwork(art: PixelCanvas): void {
  for (let y = HORIZON_Y + 1; y < GROUND_BOTTOM; y++) {
    for (let x = 0; x < LOGICAL_WIDTH; x++) {
      const cell = groundCellAt(x, y);
      const isHedge = groundCellAt(x + 1, y).key !== cell.key || groundCellAt(x, y + 1).key !== cell.key;
      art.fill(isHedge ? 'cropDark' : fieldColor(cell, x, y), x, y, 1, 1);
    }
  }
  ditherFade(art, 'skyHaze', 0, HORIZON_Y, LOGICAL_WIDTH, 26, 9, 0);
}

function drawBrook(art: PixelCanvas): void {
  for (let y = HORIZON_Y + 8; y < GROUND_BOTTOM; y++) {
    const below = y - HORIZON_Y;
    const centerX = 186 + below * 1.5 + Math.sin(below * 0.16) * 13;
    const width = 2 + Math.round(below * 0.045);
    art.fill('outline', centerX - width / 2 - 1, y, width + 2, 1);
    art.fill('brook', centerX - width / 2, y, width, 1);
    if ((y + Math.round(centerX)) % 7 === 0) art.fill('waterLight', centerX - width / 4, y, Math.max(1, width / 2), 1);
  }
}

function drawRoad(art: PixelCanvas, gateX: number, gateY: number): void {
  for (let y = HORIZON_Y + 4; y < gateY; y++) {
    const progress = (gateY - y) / (gateY - HORIZON_Y);
    const centerX = gateX - 74 * progress + Math.sin(progress * 6) * 15;
    const width = 2 + Math.round((1 - progress) * 9);
    art.fill('pathDark', centerX - width / 2 - 1, y, width + 2, 1);
    art.fill('pathLight', centerX - width / 2, y, width, 1);
  }
}

function drawFarmstead(art: PixelCanvas, centerX: number, baseY: number, scale: number): void {
  const width = Math.round(16 * scale);
  const wallHeight = Math.max(3, Math.round(7 * scale));
  const roofHeight = Math.max(3, Math.round(7 * scale));
  art.fill('outline', centerX - width / 2 - 1, baseY - wallHeight - roofHeight, width + 2, wallHeight + roofHeight + 1);
  art.fill('plaster', centerX - width / 2, baseY - wallHeight, width, wallHeight);
  art.fill('brickDark', centerX - width / 2, baseY - 1, width, 1);
  for (let row = 0; row < roofHeight; row++) {
    const inset = Math.floor((row * width) / (roofHeight * 2.6));
    art.fill(row % 2 === 0 ? 'roofRed' : 'roofRedDark', centerX - width / 2 - 1 + inset, baseY - wallHeight - roofHeight + row, width + 2 - inset * 2, 1);
  }
  art.fill('timber', centerX - 1, baseY - Math.max(2, Math.round(4 * scale)), Math.max(2, Math.round(3 * scale)), Math.max(2, Math.round(4 * scale)));
  const stackX = centerX + width / 2 + 3;
  art.fill('hayDark', stackX, baseY - Math.max(3, Math.round(5 * scale)), Math.max(3, Math.round(6 * scale)), Math.max(3, Math.round(5 * scale)));
  art.fill('hay', stackX, baseY - Math.max(3, Math.round(5 * scale)), Math.max(3, Math.round(6 * scale)), 1);
}

function drawWindmill(art: PixelCanvas, centerX: number, baseY: number): void {
  art.fill('outline', centerX - 6, baseY - 19, 12, 20);
  art.fill('plaster', centerX - 5, baseY - 14, 10, 14);
  art.fill('pathDark', centerX + 2, baseY - 14, 3, 14);
  art.fill('roofRedDark', centerX - 6, baseY - 18, 12, 4);
  art.fill('roofRed', centerX - 4, baseY - 19, 8, 2);
  art.fill('timber', centerX - 1, baseY - 4, 3, 4);
  const hubY = baseY - 15;
  for (let reach = 2; reach <= 11; reach++) {
    art.fill('timber', centerX - reach, hubY - reach, 1, 1);
    art.fill('timber', centerX + reach, hubY + reach, 1, 1);
    art.fill('timber', centerX + reach, hubY - reach, 1, 1);
    art.fill('timber', centerX - reach, hubY + reach, 1, 1);
  }
  for (const sailOffset of [[-9, -6], [6, -9], [5, 5], [-10, 4]] as const) art.fill('awningCream', centerX + sailOffset[0], hubY + sailOffset[1], 4, 3);
  art.fill('timber', centerX - 1, hubY - 1, 3, 3);
}

function drawFarmTree(art: PixelCanvas, centerX: number, baseY: number, scale: number): void {
  const radius = Math.max(2, Math.round(5 * scale));
  art.fill('timber', centerX, baseY - radius, 1, radius);
  for (let row = -radius; row <= 0; row++) {
    const half = Math.round(Math.sqrt(radius * radius - row * row));
    art.fill(row < -radius / 2 ? 'bushLight' : 'bush', centerX - half, baseY - radius * 2 + row + radius, half * 2 + 1, 1);
    art.fill('forest', centerX - half, baseY - radius * 2 + row + radius + 1, half + 1, 1);
  }
}

function drawSheep(art: PixelCanvas, x: number, y: number): void {
  art.fill('cloud', x, y, 2, 1);
  art.fill('void', x + 2, y, 1, 1);
}

export function drawFarmland(art: PixelCanvas, gateX: number, gateY: number): void {
  drawFieldPatchwork(art);
  drawBrook(art);
  drawRoad(art, gateX, gateY);
  for (const [x, y, scale] of [[96, 128, 0.8], [250, 106, 0.5], [60, 148, 1], [140, 112, 0.6], [436, 138, 0.9], [380, 108, 0.5]] as const) drawFarmstead(art, x, y, scale);
  drawWindmill(art, 296, 128);
  for (const [x, y, scale] of [[24, 124, 0.7], [180, 144, 1], [330, 126, 0.6], [410, 128, 0.8], [210, 126, 0.5], [470, 118, 0.5], [270, 148, 0.9]] as const) drawFarmTree(art, x, y, scale);
  for (const [x, y] of [[40, 146], [47, 148], [53, 145], [212, 144], [219, 146], [366, 130], [372, 132], [454, 148], [461, 146]] as const) drawSheep(art, x, y);
}
