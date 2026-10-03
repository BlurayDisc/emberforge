import { fillDisc } from './castleDither';
import { createPixelCanvas } from './pixelCanvas';

interface CloudShape {
  width: number;
  height: number;
  puffs: ReadonlyArray<readonly [number, number, number]>;
}

// Each puff is centre x, centre y and radius. Shade sits under the puffs, and a small light edge sits on top.
const CLOUD_SHAPES: readonly CloudShape[] = [
  { width: 90, height: 30, puffs: [[18, 20, 9], [34, 15, 12], [54, 17, 11], [70, 21, 8], [44, 22, 9]] },
  { width: 60, height: 22, puffs: [[14, 14, 8], [28, 10, 9], [44, 14, 8], [32, 16, 8]] },
  { width: 130, height: 34, puffs: [[20, 24, 9], [40, 18, 13], [66, 14, 13], [90, 20, 12], [108, 25, 9], [64, 25, 11]] },
];

export const CLOUD_SHAPE_COUNT = CLOUD_SHAPES.length;

export function drawCloud(shapeIndex: number): HTMLCanvasElement {
  const shape = CLOUD_SHAPES[shapeIndex % CLOUD_SHAPES.length] as CloudShape;
  const art = createPixelCanvas(shape.width, shape.height);
  for (const [x, y, radius] of shape.puffs) fillDisc(art, 'cloudDeep', x, y + 2, radius);
  for (const [x, y, radius] of shape.puffs) fillDisc(art, 'cloudShade', x, y + 1, radius);
  for (const [x, y, radius] of shape.puffs) fillDisc(art, 'cloud', x, y - 1, radius - 1);
  return art.canvas;
}
