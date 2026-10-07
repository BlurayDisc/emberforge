import type { Sprite, Texture } from 'pixi.js';
import type { HeroPose } from '../heroArt/heroPose';
import type { BattleUnit } from '../model/battle';
import { PALETTE } from './palette';
import { mixHex } from './colorMath';
import type { HealthBar } from './healthBarArt';
import type { RangedAttackStyle } from './rangedAttackStyles';
import { createUnitPlacement, type UnitMotion } from './unitMotion';
import { SLASH_FRAME_COUNT, SMALL_SLASH_BELOW_SPRITE_HEIGHT, slashFrameTextures } from './weaponSlashArt';

const FLASH_TINT = mixHex(PALETTE.blood, '#ffffff', 0.4);
const GLOW_TINT = mixHex(PALETTE.gold, '#ffffff', 0.55);
const FLASH_SECONDS = 0.18;
const LUNGE_SECONDS = 0.28;
const LUNGE_DISTANCE = 16;
const SHAKE_SECONDS = 0.22;
const DEFEAT_SECONDS = 0.6;
const HEALTH_BAR_GAP_ABOVE_HEAD = 6;
const SLASH_START_FRACTION_OF_WIDTH = 0.3;
const SLASH_HEIGHT_FRACTION = 0.55;

export const HIT_FLASH_SECONDS = FLASH_SECONDS;

export interface UnitVisual {
  sprite: Sprite;
  // The sprite as drawn, and the other looks of the same unit between shots (see HeroPose).
  readyTexture: Texture;
  poseTextures: Partial<Record<HeroPose, Texture>>;
  // The slash of a melee swing. Hidden when the unit does not swing.
  slash: Sprite;
  shadow: Sprite;
  healthBar: HealthBar;
  baseTint: number;
  spriteHeight: number;
  spriteWidth: number;
  healthBarHalfWidth: number;
  healthBarHeight: number;
  centerX: number;
  feetY: number;
  side: BattleUnit['side'];
  // The sprite is drawn looking to the right for a hero and to the left for a monster. A unit that faces the other way is mirrored.
  drawnFacing: 1 | -1;
  rangedAttackStyle: RangedAttackStyle | null;
  bobPhase: number;
  flashUntilSeconds: number;
  lungeStartSeconds: number;
  // The way the unit looks: 1 to the right, -1 to the left. A real-time unit turns with its track.
  lungeDirection: number;
  shakeStartSeconds: number;
  defeatedStartSeconds: number;
  // Set only in a real-time battle. The stage then follows the track instead of the old fixed slot.
  motion: UnitMotion | null;
  placement: ReturnType<typeof createUnitPlacement>;
}

export function healthBarTopY(visual: UnitVisual): number {
  return Math.round(visual.feetY - visual.spriteHeight - HEALTH_BAR_GAP_ABOVE_HEAD - visual.healthBarHeight / 2);
}

export function placeHealthBar(visual: UnitVisual): void {
  visual.healthBar.sprite.position.set(Math.round(visual.centerX - visual.healthBarHalfWidth), healthBarTopY(visual));
}

// Draws one unit for this moment: the pose from the motion (real time) or the old bob and lunge, then the hit shake, the hit flash and the collapse.
export function applyAnimation(visual: UnitVisual, elapsedSeconds: number): void {
  const isDefeated = visual.defeatedStartSeconds > 0;
  let offsetX = 0;
  let offsetY = 0;
  if (visual.motion) {
    const placement = visual.placement;
    offsetX = placement.forwardPixels * placement.facing;
    offsetY = isDefeated ? 0 : -placement.liftPixels;
  } else {
    offsetY = isDefeated ? 0 : Math.round(Math.sin(elapsedSeconds * 3 + visual.bobPhase));
    const lungeProgress = (elapsedSeconds - visual.lungeStartSeconds) / LUNGE_SECONDS;
    if (visual.lungeStartSeconds > 0 && lungeProgress < 1) offsetX += Math.sin(Math.PI * lungeProgress) * LUNGE_DISTANCE * visual.lungeDirection;
  }
  const shakeProgress = (elapsedSeconds - visual.shakeStartSeconds) / SHAKE_SECONDS;
  if (visual.shakeStartSeconds > 0 && shakeProgress < 1) offsetX += Math.round(Math.sin(shakeProgress * 40) * 3 * (1 - shakeProgress));

  const sprite = visual.sprite;
  const isGlowing = visual.motion !== null && visual.placement.isGlowing;
  sprite.tint = elapsedSeconds < visual.flashUntilSeconds ? FLASH_TINT : isGlowing ? GLOW_TINT : visual.baseTint;
  let height = visual.spriteHeight;
  if (isDefeated) {
    const collapse = Math.min(1, (elapsedSeconds - visual.defeatedStartSeconds) / DEFEAT_SECONDS);
    height = Math.max(2, visual.spriteHeight * (1 - 0.7 * collapse));
    sprite.alpha = 1 - 0.65 * collapse;
  }
  sprite.texture = (visual.motion !== null && visual.poseTextures[visual.placement.pose]) || visual.readyTexture;
  sprite.height = height;
  const isMirrored = visual.drawnFacing !== visual.lungeDirection && visual.motion !== null;
  sprite.scale.x = isMirrored ? -1 : 1;
  // The sprite stands on its feet, so a collapse shrinks it toward the ground. The left edge is rounded so the pixels stay on the grid.
  const left = Math.round(visual.centerX + offsetX - visual.spriteWidth / 2);
  sprite.position.set(isMirrored ? left + visual.spriteWidth : left, Math.round(visual.feetY + offsetY - height));
  applySlash(visual, isDefeated, offsetX, offsetY);
}

function applySlash(visual: UnitVisual, isDefeated: boolean, offsetX: number, offsetY: number): void {
  const slash = visual.slash;
  const swingProgress = visual.motion ? visual.placement.swingProgress : -1;
  slash.visible = swingProgress >= 0 && !isDefeated;
  if (!slash.visible) return;
  const facing = visual.lungeDirection;
  slash.texture = (slashFrameTextures(visual.spriteHeight < SMALL_SLASH_BELOW_SPRITE_HEIGHT ? 'small' : 'large')[Math.min(SLASH_FRAME_COUNT - 1, Math.floor(swingProgress * SLASH_FRAME_COUNT))]) as Texture;
  slash.scale.x = facing;
  slash.position.set(Math.round(visual.centerX + offsetX + facing * visual.spriteWidth * SLASH_START_FRACTION_OF_WIDTH), Math.round(visual.feetY + offsetY - visual.spriteHeight * SLASH_HEIGHT_FRACTION));
  slash.zIndex = visual.sprite.zIndex + 0.005;
}
