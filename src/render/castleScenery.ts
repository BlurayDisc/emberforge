import { Group, Sprite, SpriteMaterial, type CanvasTexture } from 'three';
import { CASTLE_WIDTH, LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../kernel/stageSize';
import {
  BIRD_FRAME_COUNT, FLAG_FRAME_COUNT, FLAME_FRAME_COUNT, RIBBON_FRAME_COUNT,
  drawBirdFrame, drawFlagFrame, drawFlameFrame, drawRibbonFrame, FLAME_SIZES, type FlameSize,
} from './castleAmbientArt';
import { CLOUD_SHAPE_COUNT, drawCloud } from './castleCloudArt';
import { HALL_FLAMES } from './castleHallArt';
import { northTowerWindow } from './castleNorthTowerArt';
import { RAMPART_FLAG_ANCHORS } from './castleRampartsArt';
import { createPixelTexture } from './pixelSprites';

// Depth order: ramparts backdrop -5, clouds and birds -4.95, hall backdrop -4.9, frame towers -4.85, flames and flags -4.8.
// The hall backdrop sits over the clouds, so a cloud that drifts past the left edge of the ramparts hides behind the hall.
export const RAMPARTS_BACKDROP_DEPTH = -5;
export const SKY_LIFE_DEPTH = -4.95;
export const HALL_BACKDROP_DEPTH = -4.9;
export const FRAME_TOWER_DEPTH = -4.85;
export const SCENERY_DEPTH = -4.8;

export function castleWorldX(logicalX: number): number {
  return logicalX - CASTLE_WIDTH / 2;
}

export function castleWorldY(logicalY: number): number {
  return LOGICAL_HEIGHT / 2 - logicalY;
}

interface FrameAnimation {
  sprite: Sprite;
  frames: readonly CanvasTexture[];
  framesPerSecond: number;
  phase: number;
  shownFrame: number;
}

function textureFrames(count: number, draw: (frame: number) => HTMLCanvasElement): CanvasTexture[] {
  return Array.from({ length: count }, (_, frame) => createPixelTexture(draw(frame)));
}

function createFrameSprite(frames: readonly CanvasTexture[], width: number, height: number): Sprite {
  const sprite = new Sprite(new SpriteMaterial({ map: frames[0] as CanvasTexture, transparent: true }));
  sprite.scale.set(width, height, 1);
  return sprite;
}

// Everything in the castle that moves by itself: flames, flags, the ribbon, clouds and birds.
export interface CastleScenery {
  update(elapsedSeconds: number): void;
}

export function createCastleScenery(root: Group): CastleScenery {
  const animations: FrameAnimation[] = [];
  const addAnimation = (sprite: Sprite, frames: readonly CanvasTexture[], framesPerSecond: number, phase: number): void => {
    root.add(sprite);
    animations.push({ sprite, frames, framesPerSecond, phase, shownFrame: 0 });
  };

  const flameFrames = Object.fromEntries((Object.keys(FLAME_SIZES) as FlameSize[]).map((size) => [size, textureFrames(FLAME_FRAME_COUNT, (frame) => drawFlameFrame(size, frame))])) as Record<FlameSize, CanvasTexture[]>;
  HALL_FLAMES.forEach((flame, index) => {
    const { width, height } = FLAME_SIZES[flame.size];
    const sprite = createFrameSprite(flameFrames[flame.size], width, height);
    sprite.position.set(castleWorldX(flame.x), castleWorldY(flame.y) + height / 2, SCENERY_DEPTH);
    addAnimation(sprite, flameFrames[flame.size], 6, index * 1.7);
  });

  const flagFrames = textureFrames(FLAG_FRAME_COUNT, drawFlagFrame);
  RAMPART_FLAG_ANCHORS.forEach((anchor, index) => {
    const sprite = createFrameSprite(flagFrames, 14, 8);
    sprite.position.set(castleWorldX(LOGICAL_WIDTH + anchor.x) + 7, castleWorldY(anchor.y) - 4, SCENERY_DEPTH);
    addAnimation(sprite, flagFrames, 5, index * 1.3);
  });

  const ribbonFrames = textureFrames(RIBBON_FRAME_COUNT, drawRibbonFrame);
  const window = northTowerWindow();
  const ribbon = createFrameSprite(ribbonFrames, 6, 16);
  ribbon.position.set(castleWorldX(LOGICAL_WIDTH + window.x) + 1, castleWorldY(window.y + 18) - 8, SCENERY_DEPTH);
  addAnimation(ribbon, ribbonFrames, 4, 0);

  const birdFrames = textureFrames(BIRD_FRAME_COUNT, drawBirdFrame);
  const birds = [
    { sprite: createFrameSprite(birdFrames, 8, 4), y: 52, speed: 17, offset: 40 },
    { sprite: createFrameSprite(birdFrames, 8, 4), y: 60, speed: 15, offset: 80 },
    { sprite: createFrameSprite(birdFrames, 8, 4), y: 70, speed: 19, offset: 300 },
  ];
  birds.forEach((bird, index) => addAnimation(bird.sprite, birdFrames, 3 + index, index * 0.5));

  const cloudTextures = Array.from({ length: CLOUD_SHAPE_COUNT }, (_, shape) => ({ texture: createPixelTexture(drawCloud(shape)) }));
  const clouds = [
    { shape: 0, y: 18, speed: 5, offset: 60 },
    { shape: 1, y: 36, speed: 3, offset: 250 },
    { shape: 2, y: 12, speed: 4, offset: 380 },
    { shape: 1, y: 26, speed: 6, offset: 540 },
  ].map((cloud) => {
    const texture = (cloudTextures[cloud.shape] as { texture: CanvasTexture }).texture;
    const image = texture.image as HTMLCanvasElement;
    const sprite = new Sprite(new SpriteMaterial({ map: texture, transparent: true }));
    sprite.scale.set(image.width, image.height, 1);
    root.add(sprite);
    return { ...cloud, sprite, width: image.width };
  });

  // The ramparts screen is the second screen of the castle.
  const skyLeft = LOGICAL_WIDTH;
  return {
    update: (elapsedSeconds) => {
      for (const animation of animations) {
        const frame = Math.floor(elapsedSeconds * animation.framesPerSecond + animation.phase) % animation.frames.length;
        if (frame === animation.shownFrame) continue;
        animation.shownFrame = frame;
        (animation.sprite.material as SpriteMaterial).map = animation.frames[frame] as CanvasTexture;
      }
      for (const cloud of clouds) {
        const travel = LOGICAL_WIDTH + cloud.width * 2;
        const x = ((cloud.offset + elapsedSeconds * cloud.speed) % travel) - cloud.width;
        cloud.sprite.position.set(castleWorldX(skyLeft + Math.round(x)), castleWorldY(cloud.y), SKY_LIFE_DEPTH);
      }
      for (const bird of birds) {
        const travel = LOGICAL_WIDTH + 80;
        const x = ((bird.offset + elapsedSeconds * bird.speed) % travel) - 40;
        bird.sprite.position.set(castleWorldX(skyLeft + Math.round(x)), castleWorldY(bird.y + Math.round(Math.sin(elapsedSeconds * 1.3 + bird.offset) * 2)), SKY_LIFE_DEPTH);
      }
    },
  };
}
