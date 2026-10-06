import { Sprite, type Texture } from 'pixi.js';
import type { BattleUnit } from '../model/battle';
import type { ClassId } from '../model/hero';
import { drawHeroSprite } from '../heroArt/battleSprite';
import { CREATURE_DRAWERS } from './creatureArt';
import { createPixiTexture } from './pixiTextures';

const canvasBySpriteId = new Map<string, HTMLCanvasElement>();
const textureBySpriteId = new Map<string, Texture>();

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

export function createBattleSprite(unit: BattleUnit): Sprite {
  const spriteId = spriteIdOf(unit);
  let texture = textureBySpriteId.get(spriteId);
  if (!texture) {
    texture = createPixiTexture(canvasForUnit(unit));
    textureBySpriteId.set(spriteId, texture);
  }
  return new Sprite(texture);
}
