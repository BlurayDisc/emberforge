import { castleSpot } from '../content/castle';
import { createRandom } from '../kernel/random';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../kernel/stageSize';
import { ditherRect, fillDisc } from './castleDither';
import { drawFarmland } from './castleFarmlandArt';
import { drawNorthTower } from './castleNorthTowerArt';
import { drawParapetAndWalkway } from './castleParapetArt';
import { drawFarSpire, drawMountains, drawSky } from './castleSkyArt';
import { CURTAIN_WALL_BASE_Y, GATEHOUSE_X, RED_ROOF, drawCurtainWall, drawGatehouse, drawRoundTower, drawWard } from './castleWallArt';
import { createPixelCanvas, type PixelCanvas } from './pixelCanvas';

// Where the cloth of a flag starts, next to the top of its pole. The view lays animated flags on these points.
export const RAMPART_FLAG_ANCHORS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 67, y: 106 },
  { x: 308, y: 120 },
  { x: 354, y: 120 },
  { x: 201, y: 128 },
  { x: 441, y: 132 },
];

// The Old Wood in the distance. The oldest trees stand at the back and are the darkest.
function drawOldWood(art: PixelCanvas): void {
  const spot = castleSpot('old-wood');
  const random = createRandom(71).fork('old-wood');
  const left = spot.x - spot.width / 2;
  const top = spot.y - spot.height;
  const crowns: Array<{ x: number; y: number; radius: number }> = [];
  for (let tree = 0; tree < 46; tree++) crowns.push({ x: random.nextInt(left, left + spot.width), y: random.nextInt(top + 8, spot.y), radius: random.nextInt(5, 9) });
  crowns.sort((first, second) => first.y - second.y);
  for (const crown of crowns) {
    const depthShade = (crown.y - top) / spot.height;
    fillDisc(art, 'outline', crown.x, crown.y - crown.radius, crown.radius + 1);
    fillDisc(art, depthShade < 0.4 ? 'woodDark' : depthShade < 0.75 ? 'forest' : 'bush', crown.x, crown.y - crown.radius, crown.radius);
    fillDisc(art, depthShade < 0.4 ? 'forest' : 'bushLight', crown.x - 1, crown.y - crown.radius - 2, Math.max(2, crown.radius - 3));
  }
  ditherRect(art, 'skyHaze', left - 6, spot.y - 6, spot.width + 12, 8, 7);
}

export function drawRampartsBackdrop(): HTMLCanvasElement {
  const art = createPixelCanvas(LOGICAL_WIDTH, LOGICAL_HEIGHT);
  drawSky(art);
  drawMountains(art);
  const spire = castleSpot('far-spire');
  drawFarSpire(art, spire.x, spire.y);
  drawFarmland(art, GATEHOUSE_X, CURTAIN_WALL_BASE_Y - 24);
  drawOldWood(art);
  drawCurtainWall(art);
  drawRoundTower(art, 200, 152, CURTAIN_WALL_BASE_Y, 20, RED_ROOF);
  drawRoundTower(art, 440, 156, CURTAIN_WALL_BASE_Y, 24, RED_ROOF);
  drawGatehouse(art);
  drawWard(art);
  drawNorthTower(art);
  drawParapetAndWalkway(art);
  return art.canvas;
}
