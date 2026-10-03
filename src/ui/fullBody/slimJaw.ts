import type { Paint } from './figureColors';

// Hair covers the lower cheeks, so a girl's face tapers from the cheekbones to a small chin.
// It runs after the gear, because gear and makeup paint on the same cheek pixels.
export function slimJaw(paint: Paint, hair: string): void {
  paint(hair, 15, 14, 1, 5);
  paint(hair, 24, 14, 1, 5);
  paint(hair, 16, 16, 1, 3);
  paint(hair, 23, 16, 1, 3);
}
