import { BUILDINGS } from '../content/buildings';
import { LOGICAL_HEIGHT, TOWN_WIDTH } from '../kernel/stageSize';

function isRoadAt(coverage: Uint8Array, x: number, y: number): boolean {
  const clampedX = Math.max(0, Math.min(TOWN_WIDTH - 1, x));
  const clampedY = Math.max(0, Math.min(LOGICAL_HEIGHT - 1, y));
  return coverage[clampedY * TOWN_WIDTH + clampedX] === 1;
}

// Open ground has no road and no building within the margin. Decorations and trees stay on it.
export function isOpenGround(x: number, y: number, coverage: Uint8Array, margin: number): boolean {
  const nearRoad = [-margin, 0, margin].some((dx) => [-margin * 0.6, 0, margin * 0.6].some((dy) => isRoadAt(coverage, x + dx, Math.round(y + dy))));
  const nearBuilding = BUILDINGS.some(
    (building) => x > building.x - building.width / 2 - margin - 2 && x < building.x + building.width / 2 + margin + 2 && y > building.y - building.height - margin + 2 && y < building.y + margin + 4,
  );
  return !nearRoad && !nearBuilding;
}
