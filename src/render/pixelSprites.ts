import { CanvasTexture, NearestFilter, SRGBColorSpace, Sprite, SpriteMaterial } from 'three';
import type { BattleUnit } from '../model/battle';
import type { ClassId } from '../model/hero';
import { CREATURE_DRAWERS } from './creatureArt';
import { drawHeroSprite } from './heroSpriteArt';

const canvasBySpriteId = new Map<string, HTMLCanvasElement>();
const textureBySpriteId = new Map<string, CanvasTexture>();

export function createPixelTexture(source: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(source);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function spriteIdOf(unit: BattleUnit): string {
  return unit.rank === 'hero' ? `hero:${unit.definitionId}:${unit.name}` : unit.spriteKey;
}

function canvasForUnit(unit: BattleUnit): HTMLCanvasElement {
  const spriteId = spriteIdOf(unit);
  const cached = canvasBySpriteId.get(spriteId);
  if (cached) return cached;
  const creatureDrawer = CREATURE_DRAWERS[unit.spriteKey];
  const canvas = unit.rank === 'hero' ? drawHeroSprite(unit.definitionId as ClassId, unit.name) : creatureDrawer?.();
  if (!canvas) throw new Error(`Unknown sprite key: ${unit.spriteKey}`);
  canvasBySpriteId.set(spriteId, canvas);
  return canvas;
}

export function spriteSizeOf(unit: BattleUnit): { width: number; height: number } {
  const canvas = canvasForUnit(unit);
  return { width: canvas.width, height: canvas.height };
}

export function createBattleSprite(unit: BattleUnit): Sprite {
  const spriteId = spriteIdOf(unit);
  let texture = textureBySpriteId.get(spriteId);
  if (!texture) {
    texture = createPixelTexture(canvasForUnit(unit));
    textureBySpriteId.set(spriteId, texture);
  }
  const { width, height } = spriteSizeOf(unit);
  const sprite = new Sprite(new SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(width, height, 1);
  return sprite;
}
