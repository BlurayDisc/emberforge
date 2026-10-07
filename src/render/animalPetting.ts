import { Rectangle, Sprite, type Container } from 'pixi.js';
import type { AnimalKind } from './animalArt';
import { addOutline, createPixelCanvas } from './pixelCanvas';
import { createPixiTexture } from './pixiTextures';

export type AnimalMood = 'idle' | 'petted';
// The app plays the sound. The render layer only says which animal feels which mood.
export type AnimalVoice = (kind: AnimalKind, mood: AnimalMood) => void;

const HAPPY_SECONDS = 5;
const HOP_CYCLE_SECONDS = 0.8;
const HOP_PORTION_OF_CYCLE = 0.45;
const HOP_PIXELS = 3;
const MINIMUM_SECONDS_BETWEEN_PETTED_VOICES = 0.9;
const HEART_POOL_SIZE = 10;
const HEART_LIFE_SECONDS = 1.1;
const HEART_RISE_PIXELS = 14;
const TOUCH_MARGIN_PIXELS = 4;

export interface PettableAnimal {
  // True while the animal enjoys the touch. A walking animal stands still then.
  isHappy(elapsedSeconds: number): boolean;
  // Whole pixels that the animal is above the ground now.
  hopHeight(elapsedSeconds: number): number;
}

export interface PettableShape {
  // Where the animal sits inside its sprite, in sprite pixels. The touch area grows a little, so a finger can hit it.
  width: number;
  height: number;
  // The sprite point where hearts start, in sprite pixels from the sprite position.
  heartStart: { x: number; y: number };
  // The sprite pixels from the sprite position to the top left corner of the art.
  artOrigin: { x: number; y: number };
}

export interface AnimalPetting {
  attach(sprite: Sprite, kind: AnimalKind, shape: PettableShape): PettableAnimal;
  update(elapsedSeconds: number): void;
}

interface Heart {
  sprite: Sprite;
  startedAtSeconds: number;
  isActive: boolean;
  x: number;
  y: number;
}

interface PettedState {
  kind: AnimalKind;
  happyUntilSeconds: number;
  hopStartedAtSeconds: number;
  lastPettedVoiceSeconds: number;
  wantsMore: boolean;
}

function drawHeart(): HTMLCanvasElement {
  const art = createPixelCanvas(7, 7);
  const red = '#e0455a';
  art.fill(red, 1, 1, 2, 2);
  art.fill(red, 4, 1, 2, 2);
  art.fill(red, 1, 2, 5, 2);
  art.fill(red, 2, 4, 3, 1);
  art.fill(red, 3, 5, 1, 1);
  art.fill('#ffb3bd', 2, 2, 1, 1);
  addOutline(art, 'outline');
  return art.canvas;
}

// A touch makes the animal happy: it hops, hearts rise and it calls. When the touch stops, it calls once more to ask for another.
export function createAnimalPetting(root: Container, voice: AnimalVoice, canTouch: () => boolean, heartDepth: number): AnimalPetting {
  const heartTexture = createPixiTexture(drawHeart());
  const hearts: Heart[] = Array.from({ length: HEART_POOL_SIZE }, () => {
    const sprite = new Sprite(heartTexture);
    sprite.visible = false;
    sprite.zIndex = heartDepth;
    root.addChild(sprite);
    return { sprite, startedAtSeconds: 0, isActive: false, x: 0, y: 0 };
  });
  const states: PettedState[] = [];
  let latestSeconds = 0;

  const spawnHeart = (x: number, y: number): void => {
    const heart = hearts.find((candidate) => !candidate.isActive);
    if (!heart) return;
    heart.isActive = true;
    heart.startedAtSeconds = latestSeconds;
    heart.x = x;
    heart.y = y;
    heart.sprite.visible = true;
  };

  return {
    attach: (sprite, kind, shape) => {
      const state: PettedState = { kind, happyUntilSeconds: 0, hopStartedAtSeconds: 0, lastPettedVoiceSeconds: -Infinity, wantsMore: false };
      states.push(state);
      sprite.eventMode = 'static';
      sprite.cursor = 'pointer';
      sprite.hitArea = new Rectangle(
        shape.artOrigin.x - TOUCH_MARGIN_PIXELS,
        shape.artOrigin.y - TOUCH_MARGIN_PIXELS,
        shape.width + 2 * TOUCH_MARGIN_PIXELS,
        shape.height + 2 * TOUCH_MARGIN_PIXELS,
      );
      sprite.on('pointertap', () => {
        if (!canTouch()) return;
        if (latestSeconds >= state.happyUntilSeconds) state.hopStartedAtSeconds = latestSeconds;
        state.happyUntilSeconds = latestSeconds + HAPPY_SECONDS;
        state.wantsMore = true;
        spawnHeart(sprite.x + shape.heartStart.x, sprite.y + shape.heartStart.y);
        if (latestSeconds - state.lastPettedVoiceSeconds >= MINIMUM_SECONDS_BETWEEN_PETTED_VOICES) {
          state.lastPettedVoiceSeconds = latestSeconds;
          voice(kind, 'petted');
        }
      });
      return {
        isHappy: (elapsedSeconds) => elapsedSeconds < state.happyUntilSeconds,
        hopHeight: (elapsedSeconds) => {
          if (elapsedSeconds >= state.happyUntilSeconds) return 0;
          const phase = ((elapsedSeconds - state.hopStartedAtSeconds) % HOP_CYCLE_SECONDS) / HOP_CYCLE_SECONDS;
          return phase < HOP_PORTION_OF_CYCLE ? Math.round(Math.sin((phase / HOP_PORTION_OF_CYCLE) * Math.PI) * HOP_PIXELS) : 0;
        },
      };
    },
    update: (elapsedSeconds) => {
      latestSeconds = elapsedSeconds;
      for (const state of states) {
        if (state.wantsMore && elapsedSeconds >= state.happyUntilSeconds) {
          state.wantsMore = false;
          if (canTouch()) voice(state.kind, 'idle');
        }
      }
      for (const heart of hearts) {
        if (!heart.isActive) continue;
        const age = (elapsedSeconds - heart.startedAtSeconds) / HEART_LIFE_SECONDS;
        if (age >= 1) {
          heart.isActive = false;
          heart.sprite.visible = false;
          continue;
        }
        heart.sprite.position.set(Math.round(heart.x + Math.sin(age * 7) * 2 - 3), Math.round(heart.y - age * HEART_RISE_PIXELS - 7));
        heart.sprite.alpha = age < 0.6 ? 1 : 1 - (age - 0.6) / 0.4;
      }
    },
  };
}
