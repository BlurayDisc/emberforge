import type { BuildingStyle } from '../content/buildings';
import type { PaletteColor } from './palette';
import {
  drawAwning,
  drawBrickWalls,
  drawChimneyWithSmoke,
  drawCratesAndBarrel,
  drawDoor,
  drawGateArch,
  drawGateTower,
  drawHangingSign,
  drawRoof,
  drawTimberWalls,
  drawTorch,
  drawWindow,
  type BuildingColors,
} from './buildingParts';
import { addOutline, createPixelCanvas, type PixelCanvas } from './pixelCanvas';
import { DECORATIVE_DRAWERS } from './townhouseArt';

const COLORS_BY_STYLE: Record<'tavern' | 'workshop' | 'merchant' | 'gate' | 'keep', BuildingColors> = {
  tavern: { wall: 'plaster', wallDark: 'pathDark', roof: 'roofRed', roofDark: 'roofRedDark' },
  workshop: { wall: 'brick', wallDark: 'brickDark', roof: 'roofSlate', roofDark: 'roofSlateDark' },
  merchant: { wall: 'plaster', wallDark: 'pathDark', roof: 'roofSlate', roofDark: 'roofSlateDark' },
  gate: { wall: 'stone', wallDark: 'stoneDark', roof: 'stoneLight', roofDark: 'stoneDark' },
  keep: { wall: 'stone', wallDark: 'stoneDark', roof: 'roofRed', roofDark: 'roofRedDark' },
};

function drawTavern(art: PixelCanvas, width: number, height: number): void {
  const colors = COLORS_BY_STYLE.tavern;
  const roofHeight = Math.round(height * 0.42);
  const wallTop = roofHeight;
  const wallHeight = height - roofHeight;
  drawTimberWalls(art, 6, wallTop, width - 12, wallHeight, colors);
  drawRoof(art, 0, 0, width, roofHeight + 2, colors);
  drawWindow(art, 16, wallTop + 8, 'lamp');
  drawWindow(art, width - 26, wallTop + 8, 'lamp');
  drawDoor(art, width / 2, height - 1, 14, 22, 'brickDark');
  drawHangingSign(art, width - 12, wallTop + 4);
}

function drawWorkshop(art: PixelCanvas, width: number, height: number): void {
  const colors = COLORS_BY_STYLE.workshop;
  const roofHeight = Math.round(height * 0.42);
  drawChimneyWithSmoke(art, width - 22, 4);
  drawBrickWalls(art, 6, roofHeight, width - 12, height - roofHeight, colors);
  drawRoof(art, 0, 0, width, roofHeight + 2, colors);
  drawWindow(art, 16, roofHeight + 8, 'blood');
  drawWindow(art, width - 26, roofHeight + 8, 'lamp');
  drawDoor(art, width / 2, height - 1, 14, 22, 'brickDark');
  art.fill('stoneDark', 8, height - 8, 12, 4);
  art.fill('steel', 9, height - 9, 10, 2);
}

function drawMerchant(art: PixelCanvas, width: number, height: number): void {
  const colors = COLORS_BY_STYLE.merchant;
  const roofHeight = Math.round(height * 0.4);
  drawTimberWalls(art, 6, roofHeight, width - 12, height - roofHeight, colors);
  drawRoof(art, 0, 0, width, roofHeight + 2, colors);
  drawWindow(art, 14, roofHeight + 6, 'lamp');
  drawWindow(art, width - 24, roofHeight + 6, 'lamp');
  drawDoor(art, width / 2, height - 1, 14, 20, 'brickDark');
  drawAwning(art, width / 2 - 14, roofHeight + 2, 28);
  drawCratesAndBarrel(art, 4, height - 1);
}

function drawGate(art: PixelCanvas, width: number, height: number): void {
  const towerWidth = 18;
  drawGateTower(art, 0, 14, towerWidth, height - 14);
  drawGateTower(art, width - towerWidth, 14, towerWidth, height - 14);
  art.fill('stone', towerWidth, 22, width - towerWidth * 2, height - 22);
  drawGateArch(art, width / 2, height - 1);
  drawTorch(art, towerWidth + 2, height - 30);
  drawTorch(art, width - towerWidth - 4, height - 30);
  art.fill('blood', width / 2 - 3, 24, 6, 8);
  art.fill('gold', width / 2 - 1, 26, 2, 4);
}

function drawKeep(art: PixelCanvas, width: number, height: number): void {
  const towerWidth = 24;
  const centerLeft = Math.round(width / 2 - 18);
  drawBrickWalls(art, 0, 30, width, height - 30, COLORS_BY_STYLE.keep);
  for (let tooth = 0; tooth < width; tooth += 8) art.fill('stone', tooth, 26, 5, 5);
  drawGateTower(art, 0, 14, towerWidth, height - 14);
  drawGateTower(art, width - towerWidth, 14, towerWidth, height - 14);
  drawGateTower(art, centerLeft, 0, 36, height);
  for (const tower of [4, width - towerWidth + 4, centerLeft + 4]) art.fill('void', tower + 6, 22, 3, 8);
  art.fill('void', centerLeft + 14, 12, 8, 12);
  drawGateArch(art, width / 2, height - 1);
  art.fill('timber', centerLeft + 17, -10, 2, 12);
  art.fill('blood', centerLeft + 19, -10, 10, 6);
  art.fill('gold', centerLeft + 22, -8, 3, 2);
  for (const bannerX of [towerWidth + 6, width - towerWidth - 12]) {
    art.fill('blood', bannerX, 44, 6, 16);
    art.fill('gold', bannerX + 2, 48, 2, 4);
  }
}

const DRAWERS: Record<BuildingStyle, (art: PixelCanvas, width: number, height: number) => void> = {
  ...DECORATIVE_DRAWERS,
  tavern: drawTavern,
  workshop: drawWorkshop,
  merchant: drawMerchant,
  gate: drawGate,
  keep: drawKeep,
};

export function drawBuildingArt(style: BuildingStyle, width: number, height: number): HTMLCanvasElement {
  const padding = 1;
  const art = createPixelCanvas(width + padding * 2, height + padding * 2);
  const shifted = {
    ...art,
    fill: (color: PaletteColor, x: number, y: number, fillWidth: number, fillHeight: number) =>
      art.fill(color, x + padding, y + padding, fillWidth, fillHeight),
  };
  DRAWERS[style](shifted, width, height);
  addOutline(art, 'outline');
  return art.canvas;
}
