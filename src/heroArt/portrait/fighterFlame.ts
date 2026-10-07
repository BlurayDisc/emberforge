import type { Hex } from '../heroPalette';
import type { SpritePainter } from '../spritePainter';

const FLAME_PALETTE = {
  r: '#d8431c',
  o: '#ff8a2a',
  y: '#ffc94a',
  W: '#fff3b0',
} as const satisfies Record<string, Hex>;

const LARGE_FLAME = [
  '....r.....',
  '...rr..r..',
  '...ror.rr.',
  '..rooro.r.',
  '.rooyoor..',
  '.royyyoro.',
  'rooyWyyor.',
  'royyWWyyo.',
  'royyWWWyor',
  '.royWWWyo.',
  '..rooyyor.',
  '...rrooo..',
];

const SMALL_FLAME = [
  '...r...',
  '..rr.r.',
  '.rorror',
  '.royoor',
  'royWyor',
  'royWWyo',
  '.royyor',
  '..rooo.',
];

export function paintLargeFlame(painter: SpritePainter, left: number, top: number): void {
  painter.grid(LARGE_FLAME, FLAME_PALETTE, left, top);
}

export function paintSmallFlame(painter: SpritePainter, left: number, top: number): void {
  painter.grid(SMALL_FLAME, FLAME_PALETTE, left, top);
}

export function paintEmbers(painter: SpritePainter, positions: readonly (readonly [number, number])[]): void {
  positions.forEach(([x, y], index) => painter.dot(index % 2 === 0 ? FLAME_PALETTE.y : FLAME_PALETTE.o, x, y));
}

export const FIRE_GLOW: Hex = '#ffb04a';
export const FIRE_GLOW_DEEP: Hex = '#e0642a';
