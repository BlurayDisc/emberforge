import { LOGICAL_HEIGHT, TOWN_WIDTH } from '../kernel/stageSize';
import { TOWN_ROADS, TOWN_SQUARES, type Point } from './townLayout';

function distanceToSegment(point: Point, start: Point, end: Point): number {
  const lengthSquared = (end.x - start.x) ** 2 + (end.y - start.y) ** 2;
  const progress = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y)) / lengthSquared));
  return Math.hypot(point.x - (start.x + progress * (end.x - start.x)), point.y - (start.y + progress * (end.y - start.y)));
}

// One byte for each ground pixel: 1 when a road or a square covers it.
// Each road segment only visits the pixels near it, because the town is 1440 pixels wide.
export function roadCoverage(): Uint8Array {
  const coverage = new Uint8Array(TOWN_WIDTH * LOGICAL_HEIGHT);
  for (const road of TOWN_ROADS) {
    const reach = Math.ceil(road.width / 2 + 2);
    for (let index = 0; index < road.points.length - 1; index++) {
      const start = road.points[index] as Point;
      const end = road.points[index + 1] as Point;
      const fromX = Math.max(0, Math.floor(Math.min(start.x, end.x) - reach));
      const toX = Math.min(TOWN_WIDTH - 1, Math.ceil(Math.max(start.x, end.x) + reach));
      const fromY = Math.max(0, Math.floor(Math.min(start.y, end.y) - reach));
      const toY = Math.min(LOGICAL_HEIGHT - 1, Math.ceil(Math.max(start.y, end.y) + reach));
      for (let y = fromY; y <= toY; y++) {
        for (let x = fromX; x <= toX; x++) {
          const wobble = Math.sin((x + y) * 0.09) * 1.2;
          if (distanceToSegment({ x, y }, start, end) <= road.width / 2 + wobble) coverage[y * TOWN_WIDTH + x] = 1;
        }
      }
    }
  }
  for (const square of TOWN_SQUARES) {
    for (let y = square.center.y - square.halfHeight; y < square.center.y + square.halfHeight; y++) {
      for (let x = square.center.x - square.halfWidth; x < square.center.x + square.halfWidth; x++) coverage[y * TOWN_WIDTH + x] = 1;
    }
  }
  return coverage;
}
