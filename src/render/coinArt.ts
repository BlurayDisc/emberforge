import { Sprite } from 'pixi.js';
import { PALETTE } from './palette';
import { createPixelCanvas } from './pixelCanvas';
import { createPixiTexture } from './pixiTextures';

export type CoinKind = 'gold' | 'silver' | 'copper';

const COIN_ROWS = [
  '..oooo..',
  '.oLLMMo.',
  'oLMMMMMo',
  'oMMMMMMo',
  'oMMMMMDo',
  'oMMMMDDo',
  '.oDDDDo.',
  '..oooo..',
] as const;

export const COIN_SIZE = 8;

const COIN_COLORS: Readonly<Record<CoinKind, { light: string; middle: string; dark: string }>> = {
  gold: { light: PALETTE.uiGoldLight, middle: PALETTE.uiGold, dark: PALETTE.uiGoldDark },
  silver: { light: '#f4f6fa', middle: PALETTE.uiSilver, dark: '#7d8594' },
  copper: { light: '#f0b88a', middle: PALETTE.uiCopper, dark: '#8f4f26' },
};

const textureByKind = new Map<CoinKind, ReturnType<typeof createPixiTexture>>();

export function createCoinSprite(kind: CoinKind): Sprite {
  let texture = textureByKind.get(kind);
  if (!texture) {
    const art = createPixelCanvas(COIN_SIZE, COIN_SIZE);
    const colors = COIN_COLORS[kind];
    const legend: Record<string, string> = { o: PALETTE.uiInk, L: colors.light, M: colors.middle, D: colors.dark };
    COIN_ROWS.forEach((row, y) => [...row].forEach((token, x) => token !== '.' && art.fill(legend[token] as `#${string}`, x, y, 1, 1)));
    texture = createPixiTexture(art.canvas);
    textureByKind.set(kind, texture);
  }
  return new Sprite(texture);
}
