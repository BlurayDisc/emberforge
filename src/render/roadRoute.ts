import type { Point } from './townLayout';

export function routeLength(route: readonly Point[]): number {
  return route.reduce((total, point, index) => {
    const next = route[index + 1];
    return next ? total + Math.hypot(next.x - point.x, next.y - point.y) : total;
  }, 0);
}

export function pointAtDistance(route: readonly Point[], distance: number): Point {
  let remaining = distance;
  for (let index = 0; index < route.length - 1; index++) {
    const start = route[index] as Point;
    const end = route[index + 1] as Point;
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    if (remaining <= length || index === route.length - 2) {
      const progress = length === 0 ? 0 : Math.min(1, remaining / length);
      return { x: start.x + (end.x - start.x) * progress, y: start.y + (end.y - start.y) * progress };
    }
    remaining -= length;
  }
  return route[0] as Point;
}
