import { drawAscii, drawingToImage } from './pixelDraw';

const SKELETON_ROWS = [
  '................................',
  '................................',
  '................................',
  '..........oooooooooooo..........',
  '........oobbbbbbbbbbbboo........',
  '.......obbbbbbbbbbbbbbbbo.......',
  '......obbbbbbbbbbbbbbbbbbo......',
  '......obbbbbbbbbbbbbbbbbbo......',
  '.....obbbbbbbbbbbbbbbbbbbbo.....',
  '.....obbbbbbbbbbbbbbbbbbbbo.....',
  '.....obbxxbbbbbbbbbbbbxxbbo.....',
  '.....obbbxxbbbbbbbbbbxxbbbo.....',
  '.....obbbbxxbbbbbbbbxxbbbbo.....',
  '.....obbbbbxxbbbbbbxxbbbbbo.....',
  '.....obbbbxxbbbbbbbbxxbbbbo.....',
  '.....obbbxxbbbbbbbbbbxxbbbo.....',
  '.....obbxxbbbbbbbbbbbbxxbbo.....',
  '......obbbbbbbbooobbbbbbbo......',
  '......obbbbbbboooooobbbbbo......',
  '.......obbbbbbbooobbbbbbo.......',
  '........oobbbbbbbbbbbboo........',
  '.........obbbbbbbbbbbbo.........',
  '.........obbobobobobbbo.........',
  '.........obbobobobobbbo.........',
  '.........obbobobobobbbo.........',
  '..........oooooooooooo..........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];
const SKELETON_LEGEND = { o: '#17110d', b: '#e8e0c8', x: '#17110d' };
const BACKDROP_COLOR = '#2b2a33';

let skeletonCanvas: HTMLCanvasElement | null = null;

// Same 32x32 size and frame as a hero portrait. The eyes are crosses (X_X). The canvas is drawn once.
export function createSkeletonPortrait(scale = 2): HTMLImageElement {
  if (!skeletonCanvas) {
    const drawing = drawAscii(SKELETON_ROWS, SKELETON_LEGEND);
    const backdrop = document.createElement('canvas');
    backdrop.width = 32;
    backdrop.height = 32;
    const context = backdrop.getContext('2d');
    if (!context) throw new Error('2D canvas is not available');
    context.fillStyle = BACKDROP_COLOR;
    context.fillRect(0, 0, 32, 32);
    context.drawImage(drawing.canvas, 0, 0);
    context.fillStyle = '#17110d';
    context.fillRect(0, 0, 32, 1);
    context.fillRect(0, 31, 32, 1);
    context.fillRect(0, 0, 1, 32);
    context.fillRect(31, 0, 1, 32);
    skeletonCanvas = backdrop;
  }
  return drawingToImage({ canvas: skeletonCanvas, fill: () => undefined }, scale, 'pixel-portrait');
}
