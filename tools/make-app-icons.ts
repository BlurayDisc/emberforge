import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { encodePng } from './headless-art/pngEncoder';

// Draws the app icon (a forge flame over an anvil) as 16x16 pixel art and writes the PNG sizes for the browser tab, the home screen and the install dialog.
// Usage: npm run icons
const COLORS: Record<string, [number, number, number]> = {
  '.': [0x24, 0x19, 0x12],
  o: [0xe8, 0x74, 0x2a],
  y: [0xf2, 0xc1, 0x4e],
  w: [0xff, 0xe4, 0x9a],
  a: [0x9a, 0xa3, 0xb2],
  d: [0x4a, 0x50, 0x60],
};

const PICTURE = [
  '................',
  '.......o........',
  '.......oo.......',
  '......ooyo......',
  '.....ooyyoo.....',
  '.....oyywyo.....',
  '....ooyywyoo....',
  '....oyywwyyo....',
  '....oyywwyyo....',
  '.....oyyyyo.....',
  '..aaaaaaaaaaa...',
  '.aaaaaaaaaaaadd.',
  '..ddaaaaaaadd...',
  '.....dddddd.....',
  '.....daaaad.....',
  '....dddddddd....',
];

const PICTURE_SIZE = 16;
// Android crops a maskable icon to a circle or a squircle, so the picture stays inside the middle 80 percent.
const SAFE_ZONE_FRACTION = 0.8;

function drawIcon(sizePixels: number, pixelScale: number): Buffer {
  const rgba = new Uint8ClampedArray(sizePixels * sizePixels * 4);
  const offset = Math.floor((sizePixels - PICTURE_SIZE * pixelScale) / 2);
  for (let y = 0; y < sizePixels; y++) {
    for (let x = 0; x < sizePixels; x++) {
      const pictureX = Math.floor((x - offset) / pixelScale);
      const pictureY = Math.floor((y - offset) / pixelScale);
      const inside = pictureX >= 0 && pictureY >= 0 && pictureX < PICTURE_SIZE && pictureY < PICTURE_SIZE;
      const [red, green, blue] = COLORS[inside ? (PICTURE[pictureY] as string)[pictureX] as string : '.'] as [number, number, number];
      rgba.set([red, green, blue, 255], (y * sizePixels + x) * 4);
    }
  }
  return encodePng(sizePixels, sizePixels, rgba);
}

const scaleFor = (sizePixels: number): number => Math.max(1, Math.floor((sizePixels * SAFE_ZONE_FRACTION) / PICTURE_SIZE));
const OUTPUT_DIRECTORY = join('public', 'icons');
mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
const ICONS: { fileName: string; sizePixels: number; pixelScale: number }[] = [
  { fileName: 'favicon-32.png', sizePixels: 32, pixelScale: 2 },
  { fileName: 'apple-touch-icon.png', sizePixels: 180, pixelScale: scaleFor(180) },
  { fileName: 'icon-192.png', sizePixels: 192, pixelScale: scaleFor(192) },
  { fileName: 'icon-512.png', sizePixels: 512, pixelScale: scaleFor(512) },
];
for (const icon of ICONS) writeFileSync(join(OUTPUT_DIRECTORY, icon.fileName), drawIcon(icon.sizePixels, icon.pixelScale));
console.log(`Wrote ${ICONS.length} icons to ${OUTPUT_DIRECTORY}`);
