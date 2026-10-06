import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderContactSheet, type SheetEntry, type SheetOptions } from './contactSheet';
import { encodePng } from './pngEncoder';
import { describeSprite, measureSprite } from './spriteStats';

const OUTPUT_DIRECTORY = join('out', 'art');

export function writeContactSheet(fileName: string, entries: readonly SheetEntry[], options: SheetOptions): string {
  const sheet = renderContactSheet(entries, options);
  mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
  const filePath = join(OUTPUT_DIRECTORY, `${fileName}.png`);
  writeFileSync(filePath, encodePng(sheet.width, sheet.height, sheet.pixels));
  entries.forEach((entry, index) => console.log(describeSprite(index + 1, entry.label, measureSprite(entry.canvas))));
  console.log(`Wrote ${filePath} (${sheet.width}x${sheet.height}, scale ${options.scale})`);
  return filePath;
}
