import { Group, Sprite, SpriteMaterial, type CanvasTexture } from 'three';
import { createRandom, type Random } from '../kernel/random';
import { LOGICAL_HEIGHT, TOWN_WIDTH } from '../kernel/stageSize';
import { addOutline, createPixelCanvas } from './pixelCanvas';
import { createPixelTexture } from './pixelSprites';
import type { Point, Road } from './townLayout';

const SKIN_TONES = ['#f2c9a0', '#e0a878', '#b97b52', '#8a5636'] as const;
const HAIR_COLORS = ['#3a2a1e', '#6a4a2a', '#c9a24e', '#a63a2a', '#d8d4cc'] as const;
const SHIRT_COLORS = ['#a03a32', '#3b6fd6', '#6a8a3a', '#8a5a9a', '#c9a24e', '#58607a'] as const;
const PANTS_COLORS = ['#4a3322', '#3b2a1d', '#2f3b57'] as const;

const MINIMUM_WALKING_ROUTE_PIXELS = 30;
const SPEECH_SECONDS = 6;
const VISIBLE_MARGIN_PIXELS = 60;
const SECONDS_BETWEEN_SPEECHES_MINIMUM = 7;
const SECONDS_BETWEEN_SPEECHES_MAXIMUM = 14;
const SPEECH_ANCHOR_ABOVE_FEET_PIXELS = 20;

type BystanderKind = 'villager' | 'guard';
type HexColor = `#${string}`;

interface Walker {
  sprite: Sprite;
  frames: [CanvasTexture, CanvasTexture];
  route: readonly Point[];
  routeLength: number;
  distance: number;
  direction: 1 | -1;
  speedPixelsPerSecond: number;
  pausedUntilSeconds: number;
}

// Where a speech bubble goes, in stage pixels. The caller picks the words. null means the bubble ends.
export interface BystanderSpeech {
  x: number;
  y: number;
}

export interface Bystanders {
  update(elapsedSeconds: number): void;
}

function drawBystanderFrame(random: Random, kind: BystanderKind, frame: 0 | 1, appearance: { skin: HexColor; hair: HexColor; shirt: HexColor; pants: HexColor }): HTMLCanvasElement {
  const art = createPixelCanvas(12, 18);
  const { skin, hair, shirt, pants } = appearance;
  art.fill(skin, 4, 3, 4, 4);
  art.fill(kind === 'guard' ? '#c0c8d0' : hair, 4, 2, 4, 2);
  if (kind === 'guard') art.fill('#c0c8d0', 3, 3, 1, 3), art.fill('#c0c8d0', 8, 3, 1, 3);
  art.fill('#17110d', 5, 5, 1, 1);
  art.fill('#17110d', 7, 5, 1, 1);
  art.fill(shirt, 3, 7, 6, 6);
  art.fill(shirt, 2, 7, 1, 5);
  art.fill(shirt, 9, 7, 1, 5);
  art.fill(skin, 2, 12, 1, 1);
  art.fill(skin, 9, 12, 1, 1);
  art.fill('#f2c14e', 4, 11, 4, 1);
  art.fill(pants, 4, 13, 2, frame === 0 ? 4 : 3);
  art.fill(pants, 6, 13, 2, frame === 0 ? 3 : 4);
  art.fill('#17110d', 4, frame === 0 ? 17 : 16, 2, 1);
  art.fill('#17110d', 6, frame === 0 ? 16 : 17, 2, 1);
  if (kind === 'guard') art.fill('#8a6340', 10, 2, 1, 15);
  if (random.chance(0.3) && kind === 'villager') art.fill('#6a4a2a', 3, 1, 6, 2);
  addOutline(art, 'outline');
  return art.canvas;
}

function routeLength(route: readonly Point[]): number {
  return route.reduce((total, point, index) => {
    const next = route[index + 1];
    return next ? total + Math.hypot(next.x - point.x, next.y - point.y) : total;
  }, 0);
}

function pointAtDistance(route: readonly Point[], distance: number): Point {
  let remaining = distance;
  for (let index = 0; index < route.length - 1; index++) {
    const start = route[index] as Point;
    const end = route[index + 1] as Point;
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    if (remaining <= length || index === route.length - 2) {
      const progress = length === 0 ? 0 : Math.min(1, remaining / length);
      return { x: start.x + (end.x - start.x) * progress, y: start.y + (end.y - start.y) * progress };
    }
    remaining -= length;
  }
  return route[0] as Point;
}

function depthFor(logicalY: number): number {
  return logicalY * 0.01 - 3;
}

export interface VisibleRange {
  from: number;
  to: number;
}

// Only a villager that the player can see starts a speech.
export function createBystanders(
  root: Group,
  roads: readonly Road[],
  seed: number,
  onSpeech: (speech: BystanderSpeech | null) => void,
  visibleRange: () => VisibleRange,
): Bystanders {
  const random = createRandom(seed).fork('bystanders');
  const walkingRoads = roads.filter((road) => routeLength(road.points) >= MINIMUM_WALKING_ROUTE_PIXELS);
  const walkerPlans = walkingRoads.flatMap((road) => [
    ...Array.from({ length: road.guardCount ?? 0 }, () => ({ road, kind: 'guard' as BystanderKind })),
    ...Array.from({ length: road.villagerCount ?? 0 }, () => ({ road, kind: 'villager' as BystanderKind })),
  ]);
  const walkers: Walker[] = walkerPlans.map(({ road, kind }) => {
    const appearance = {
      skin: random.pick(SKIN_TONES),
      hair: random.pick(HAIR_COLORS),
      shirt: random.pick(SHIRT_COLORS),
      pants: random.pick(PANTS_COLORS),
    };
    const frames: [CanvasTexture, CanvasTexture] = [
      createPixelTexture(drawBystanderFrame(random, kind, 0, appearance)),
      createPixelTexture(drawBystanderFrame(random, kind, 1, appearance)),
    ];
    const sprite = new Sprite(new SpriteMaterial({ map: frames[0], transparent: true }));
    sprite.scale.set(12, 18, 1);
    root.add(sprite);
    const length = routeLength(road.points);
    return {
      sprite,
      frames,
      route: road.points,
      routeLength: length,
      distance: random.nextFloat() * length,
      direction: random.chance(0.5) ? 1 : -1,
      speedPixelsPerSecond: random.nextInt(9, 16),
      pausedUntilSeconds: 0,
    };
  });
  let previousSeconds: number | null = null;
  let speaker: Walker | null = null;
  let speechEndsAtSeconds = 0;
  let nextSpeechAtSeconds = SECONDS_BETWEEN_SPEECHES_MINIMUM;

  const startSpeech = (walker: Walker, elapsedSeconds: number): void => {
    speaker = walker;
    speechEndsAtSeconds = elapsedSeconds + SPEECH_SECONDS;
    walker.pausedUntilSeconds = speechEndsAtSeconds;
    const position = pointAtDistance(walker.route, walker.distance);
    onSpeech({ x: position.x, y: position.y - SPEECH_ANCHOR_ABOVE_FEET_PIXELS });
  };

  // One villager at a time stops and talks. The walker stands still, so the bubble needs no tracking.
  const updateSpeech = (elapsedSeconds: number): void => {
    if (speaker && elapsedSeconds >= speechEndsAtSeconds) {
      speaker = null;
      onSpeech(null);
      nextSpeechAtSeconds = elapsedSeconds + random.nextInt(SECONDS_BETWEEN_SPEECHES_MINIMUM, SECONDS_BETWEEN_SPEECHES_MAXIMUM);
    }
    if (speaker || elapsedSeconds < nextSpeechAtSeconds) return;
    const { from, to } = visibleRange();
    const visibleWalkers = walkers.filter((walker) => {
      const { x } = pointAtDistance(walker.route, walker.distance);
      return x > from + VISIBLE_MARGIN_PIXELS && x < to - VISIBLE_MARGIN_PIXELS;
    });
    if (visibleWalkers.length === 0) nextSpeechAtSeconds = elapsedSeconds + 1;
    else startSpeech(random.pick(visibleWalkers), elapsedSeconds);
  };

  return {
    update: (elapsedSeconds) => {
      const deltaSeconds = previousSeconds === null ? 0 : Math.min(0.1, elapsedSeconds - previousSeconds);
      previousSeconds = elapsedSeconds;
      updateSpeech(elapsedSeconds);
      for (const walker of walkers) {
        const isPaused = elapsedSeconds < walker.pausedUntilSeconds;
        if (!isPaused) {
          walker.distance += walker.direction * walker.speedPixelsPerSecond * deltaSeconds;
          if (walker.distance >= walker.routeLength || walker.distance <= 0) {
            walker.distance = Math.max(0, Math.min(walker.routeLength, walker.distance));
            walker.direction = walker.direction === 1 ? -1 : 1;
            walker.pausedUntilSeconds = elapsedSeconds + random.nextInt(2, 6);
          }
        }
        const position = pointAtDistance(walker.route, walker.distance);
        const frameIndex = isPaused ? 0 : Math.floor(elapsedSeconds * 4) % 2;
        walker.sprite.material.map = walker.frames[frameIndex as 0 | 1];
        walker.sprite.position.set(Math.round(position.x - TOWN_WIDTH / 2), Math.round(LOGICAL_HEIGHT / 2 - position.y + 9), depthFor(position.y));
      }
    },
  };
}

export { depthFor };
