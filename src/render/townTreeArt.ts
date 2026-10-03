import { createPixelCanvas, type PixelCanvas } from './pixelCanvas';

export const TREE_SPRITE_WIDTH = 16;
export const TREE_SPRITE_HEIGHT = 30;

export function drawTree(art: PixelCanvas, centerX: number, baseY: number): void {
  art.fill('timber', centerX - 2, baseY - 12, 4, 12);
  const canopyRows: Array<[number, number]> = [[-9, 8], [-12, 12], [-15, 14], [-18, 14], [-21, 12], [-24, 8]];
  canopyRows.forEach(([offset, width]) => {
    art.fill('forest', centerX - width / 2, baseY + offset - 4, width, 4);
    art.fill('grass', centerX - width / 2 + 2, baseY + offset - 4, Math.max(2, width / 3), 1);
  });
  art.fill('outline', centerX - 7, baseY - 1, 14, 1);
}

// One tree on its own canvas, with the trunk foot on the bottom row. Every tree in town shares it.
export function drawTreeSprite(): HTMLCanvasElement {
  const art = createPixelCanvas(TREE_SPRITE_WIDTH, TREE_SPRITE_HEIGHT);
  drawTree(art, TREE_SPRITE_WIDTH / 2, TREE_SPRITE_HEIGHT);
  return art.canvas;
}
