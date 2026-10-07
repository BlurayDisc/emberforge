import { Sprite, type Texture } from 'pixi.js';
import type { BattleUnit } from '../model/battle';
import type { ClassId } from '../model/hero';
import { CLASSES_WITH_POSES, drawHeroSprite } from '../heroArt/battleSprite';
import type { HeroPose } from '../heroArt/heroPose';
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

const POSES_BESIDES_READY: readonly HeroPose[] = ['charge', 'released', 'reload'];
const poseTexturesBySpriteId = new Map<string, Partial<Record<HeroPose, Texture>>>();

// The textures of the poses between shots. Drawn once for each hero look and kept. A unit with no poses gets an empty table.
export function poseTexturesOf(unit: BattleUnit): Partial<Record<HeroPose, Texture>> {
  if (unit.rank !== 'hero' || !CLASSES_WITH_POSES.includes(unit.definitionId as ClassId)) return {};
  const spriteId = spriteIdOf(unit);
  const cached = poseTexturesBySpriteId.get(spriteId);
  if (cached) return cached;
  const textures: Partial<Record<HeroPose, Texture>> = {};
  for (const pose of POSES_BESIDES_READY) textures[pose] = createPixiTexture(drawHeroSprite(unit.definitionId as ClassId, unit.name, pose));
  poseTexturesBySpriteId.set(spriteId, textures);
  return textures;
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
