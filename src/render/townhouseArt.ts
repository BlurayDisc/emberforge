import type { BuildingStyle } from '../content/buildings';
import {
  STONE_COLORS,
  drawBrickWalls,
  drawChimneyWithSmoke,
  drawDoor,
  drawRoof,
  drawTimberWalls,
  drawTorch,
  drawWindow,
  type BuildingColors,
} from './buildingParts';
import type { PixelCanvas } from './pixelCanvas';

type DecorativeStyle = Exclude<BuildingStyle, 'tavern' | 'workshop' | 'merchant' | 'gate' | 'keep'>;
type Drawer = (art: PixelCanvas, width: number, height: number) => void;

const THATCH: BuildingColors = { wall: 'plaster', wallDark: 'pathDark', roof: 'hay', roofDark: 'hayDark' };
const SLATE_TIMBER: BuildingColors = { wall: 'plaster', wallDark: 'pathDark', roof: 'roofSlate', roofDark: 'roofSlateDark' };
const RED_TIMBER: BuildingColors = { wall: 'plaster', wallDark: 'pathDark', roof: 'roofRed', roofDark: 'roofRedDark' };
const BARN: BuildingColors = { wall: 'fur', wallDark: 'timber', roof: 'roofRed', roofDark: 'roofRedDark' };
const BARRACKS: BuildingColors = { wall: 'brick', wallDark: 'brickDark', roof: 'roofSlate', roofDark: 'roofSlateDark' };

function drawCottage(art: PixelCanvas, width: number, height: number): void {
  const roofHeight = Math.round(height * 0.5);
  drawTimberWalls(art, 5, roofHeight, width - 10, height - roofHeight, THATCH);
  drawRoof(art, 0, 0, width, roofHeight + 2, THATCH);
  if (width >= 52) {
    drawWindow(art, 7, roofHeight + 6, 'lamp');
    drawWindow(art, width - 17, roofHeight + 6, 'lamp');
  }
  drawDoor(art, width / 2, height - 1, 10, 16, 'brickDark');
}

function drawTownhouse(art: PixelCanvas, width: number, height: number): void {
  const colors = width % 2 === 0 ? SLATE_TIMBER : RED_TIMBER;
  const roofHeight = Math.round(height * 0.4);
  drawChimneyWithSmoke(art, width - 18, 6);
  drawTimberWalls(art, 5, roofHeight, width - 10, height - roofHeight, colors);
  drawRoof(art, 0, 0, width, roofHeight + 2, colors);
  drawWindow(art, 10, roofHeight + 6, 'lamp');
  drawWindow(art, width - 20, roofHeight + 6, 'lamp');
  drawDoor(art, width / 2, height - 1, 12, 18, 'brickDark');
}

function drawChapel(art: PixelCanvas, width: number, height: number): void {
  const towerWidth = 24;
  const naveTop = Math.round(height * 0.45);
  drawBrickWalls(art, 0, naveTop, width - towerWidth, height - naveTop, STONE_COLORS);
  drawRoof(art, 0, naveTop - 18, width - towerWidth, 20, { wall: 'stone', wallDark: 'stoneDark', roof: 'roofSlate', roofDark: 'roofSlateDark' });
  drawBrickWalls(art, width - towerWidth, 14, towerWidth, height - 14, STONE_COLORS);
  art.fill('roofSlate', width - towerWidth - 2, 8, towerWidth + 4, 8);
  art.fill('roofSlateDark', width - towerWidth + 4, 2, towerWidth - 8, 7);
  art.fill('stoneLight', width - towerWidth / 2 - 1, -8, 2, 12);
  art.fill('stoneLight', width - towerWidth / 2 - 4, -5, 8, 2);
  art.fill('void', width - towerWidth / 2 - 3, 22, 6, 10);
  art.fill('cobalt', 10, naveTop + 10, 6, 12);
  art.fill('cobalt', 26, naveTop + 10, 6, 12);
  drawDoor(art, (width - towerWidth) / 2 + 8, height - 1, 14, 22, 'brickDark');
}

function drawBarn(art: PixelCanvas, width: number, height: number): void {
  const roofHeight = Math.round(height * 0.4);
  art.fill('fur', 4, roofHeight, width - 8, height - roofHeight);
  for (let plank = 6; plank < width - 6; plank += 5) art.fill('timber', plank, roofHeight, 1, height - roofHeight);
  drawRoof(art, 0, 0, width, roofHeight + 2, BARN);
  const doorLeft = width / 2 - 14;
  art.fill('timber', doorLeft, height - 26, 28, 26);
  art.fill('brickDark', doorLeft + 2, height - 24, 24, 24);
  art.fill('timber', doorLeft + 13, height - 24, 2, 24);
  art.fill('timber', doorLeft + 2, height - 24, 24, 2);
  art.fill('hay', width / 2 - 6, roofHeight + 4, 12, 6);
  art.fill('hayDark', width / 2 - 6, roofHeight + 9, 12, 1);
}

function drawMill(art: PixelCanvas, width: number, height: number): void {
  const bodyTop = Math.round(height * 0.38);
  const bodyWidth = Math.round(width * 0.6);
  const bodyLeft = Math.round((width - bodyWidth) / 2);
  drawBrickWalls(art, bodyLeft, bodyTop, bodyWidth, height - bodyTop, STONE_COLORS);
  art.fill('plaster', bodyLeft + 2, bodyTop, bodyWidth - 4, 10);
  art.fill('roofRed', bodyLeft - 2, bodyTop - 8, bodyWidth + 4, 9);
  art.fill('roofRedDark', bodyLeft + 4, bodyTop - 14, bodyWidth - 8, 7);
  const hubX = Math.round(width / 2);
  const hubY = bodyTop - 4;
  art.fill('timber', hubX - 1, hubY - 20, 2, 40);
  art.fill('timber', hubX - 20, hubY - 1, 40, 2);
  for (const [sailX, sailY] of [[hubX - 19, hubY - 19], [hubX + 5, hubY - 19], [hubX - 19, hubY + 5], [hubX + 5, hubY + 5]] as const) {
    art.fill('parchment', sailX, sailY, 14, 14);
    art.fill('pathDark', sailX, sailY + 6, 14, 1);
  }
  art.fill('timber', hubX - 2, hubY - 2, 4, 4);
  drawDoor(art, hubX, height - 1, 10, 16, 'brickDark');
  drawWindow(art, hubX - 5, bodyTop + 14, 'lamp');
}

function drawBarracks(art: PixelCanvas, width: number, height: number): void {
  const roofHeight = Math.round(height * 0.38);
  drawBrickWalls(art, 3, roofHeight, width - 6, height - roofHeight, BARRACKS);
  drawRoof(art, 0, 0, width, roofHeight + 2, BARRACKS);
  drawWindow(art, 12, roofHeight + 6, 'lamp');
  drawWindow(art, width - 22, roofHeight + 6, 'lamp');
  drawDoor(art, width / 2, height - 1, 16, 22, 'timber');
  for (const bannerX of [width / 2 - 24, width / 2 + 18]) {
    art.fill('blood', bannerX, roofHeight + 4, 6, 18);
    art.fill('gold', bannerX + 2, roofHeight + 8, 2, 4);
  }
  drawTorch(art, width / 2 - 14, height - 28);
  drawTorch(art, width / 2 + 12, height - 28);
}

function drawWatchtower(art: PixelCanvas, width: number, height: number): void {
  drawBrickWalls(art, 2, 12, width - 4, height - 12, STONE_COLORS);
  for (let tooth = 2; tooth < width - 2; tooth += 6) art.fill('stone', tooth, 6, 4, 6);
  art.fill('void', width / 2 - 2, 24, 4, 9);
  art.fill('void', width / 2 - 2, 44, 4, 9);
  art.fill('timber', width / 2, -10, 1, 16);
  art.fill('blood', width / 2 + 1, -10, 8, 5);
  drawDoor(art, width / 2, height - 1, 8, 12, 'brickDark');
}

function drawStall(art: PixelCanvas, width: number, height: number): void {
  art.fill('timber', 2, 8, 2, height - 8);
  art.fill('timber', width - 4, 8, 2, height - 8);
  for (let stripe = 0; stripe < width; stripe += 5) {
    art.fill(Math.floor(stripe / 5) % 2 === 0 ? 'blood' : 'awningCream', stripe, 0, 5, 9);
    art.fill('roofRedDark', stripe, 9, 5, 1);
  }
  art.fill('timber', 0, height - 12, width, 12);
  art.fill('pathDark', 1, height - 11, width - 2, 3);
  const goods = ['hay', 'blood', 'goblin', 'gold', 'cobalt'] as const;
  for (let index = 0; index < width - 8; index += 7) art.fill(goods[(index / 7) % goods.length] as (typeof goods)[number], 4 + index, height - 16, 5, 5);
}

export const DECORATIVE_DRAWERS: Record<DecorativeStyle, Drawer> = {
  cottage: drawCottage,
  townhouse: drawTownhouse,
  chapel: drawChapel,
  barn: drawBarn,
  mill: drawMill,
  barracks: drawBarracks,
  watchtower: drawWatchtower,
  stall: drawStall,
};
