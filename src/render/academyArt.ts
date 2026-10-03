import { drawBrickWalls, drawDoor, drawRoof, drawWindow, type BuildingColors } from './buildingParts';
import type { PixelCanvas } from './pixelCanvas';

const ACADEMY_COLORS: BuildingColors = { wall: 'stone', wallDark: 'stoneDark', roof: 'royalPurple', roofDark: 'royalPurpleDark' };

export function drawAcademy(art: PixelCanvas, width: number, height: number): void {
  const roofHeight = Math.round(height * 0.4);
  drawBrickWalls(art, 5, roofHeight, width - 10, height - roofHeight, ACADEMY_COLORS);
  drawRoof(art, 0, 0, width, roofHeight + 2, ACADEMY_COLORS);
  art.fill('gold', width / 2 - 2, Math.round(roofHeight * 0.45), 4, 4);
  drawWindow(art, 10, roofHeight + 6, 'glassBlue');
  drawWindow(art, width - 20, roofHeight + 6, 'glassBlue');
  drawDoor(art, width / 2, height - 1, 12, 20, 'timber');
}
