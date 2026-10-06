import { Container, Sprite } from 'pixi.js';
import type { BuildingDefinition, BuildingStyle } from '../../content/buildings';
import { createRandom } from '../../kernel/random';
import { TOWN_WIDTH, LOGICAL_HEIGHT } from '../../kernel/stageSize';
import { createPixelCanvas } from '../pixelCanvas';
import { createFlatSprite, createPixiTexture } from '../pixiTextures';

const SMOKE_DRAW_ORDER = 90500;
const CLOUD_DRAW_ORDER = 90000;
const FIREFLY_DRAW_ORDER = 90800;

// Where each chimney stands in its building art, from the left and the top. The art has one pixel of padding.
const CHIMNEY_BY_STYLE: Partial<Record<BuildingStyle, { fromLeft: (width: number) => number; fromTop: number }>> = {
  workshop: { fromLeft: (width) => width - 22 + 1 + 4, fromTop: 4 + 1 },
  townhouse: { fromLeft: (width) => width - 18 + 1 + 4, fromTop: 6 + 1 },
};

const PUFFS_PER_CHIMNEY = 5;
const PUFF_LIFE_SECONDS = 3.4;
const PUFF_RISE_PIXELS = 16;
const PUFF_COLOR = '#d8dae4';

const CLOUD_COUNT = 4;
const CLOUD_ALPHA = 0.13;
const FIREFLY_COUNT = 22;
const FIREFLY_COLOR = '#ffe680';

interface Puff {
  sprite: Sprite;
  originX: number;
  originY: number;
  phaseSeconds: number;
}

interface Cloud {
  sprite: Sprite;
  speedPixelsPerSecond: number;
}

interface Firefly {
  sprite: Sprite;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  blinkOffset: number;
  nextTurnSeconds: number;
}

// A flat cloud shadow: a solid middle with a dithered edge, so it matches the pixel art.
function drawCloudShadow(width: number, height: number): HTMLCanvasElement {
  const art = createPixelCanvas(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const distance = Math.hypot((x - width / 2) / (width / 2), (y - height / 2) / (height / 2));
      const isSolid = distance < 0.62;
      const isDithered = distance < 1 && (x + y) % 2 === 0;
      if (isSolid || (distance < 0.8 && isDithered) || (distance >= 0.8 && distance < 1 && x % 2 === 0 && y % 2 === 0)) art.fill('#000000', x, y, 1, 1);
    }
  }
  return art.canvas;
}

// Smoke from the chimneys, cloud shadows that drift over the roofs, and fireflies in the dusk. They live in the world, so they scroll with it.
export interface TownAmbience {
  update(elapsedSeconds: number, deltaSeconds: number): void;
}

export function createTownAmbience(world: Container, buildings: readonly BuildingDefinition[], buildingSprites: ReadonlyMap<string, Sprite>): TownAmbience {
  const random = createRandom(11).fork('ambience');

  const puffs: Puff[] = [];
  for (const building of buildings) {
    const chimney = CHIMNEY_BY_STYLE[building.style];
    const buildingSprite = buildingSprites.get(building.id);
    if (!chimney || !buildingSprite) continue;
    for (let index = 0; index < PUFFS_PER_CHIMNEY; index++) {
      const sprite = createFlatSprite(PUFF_COLOR, 3, 3);
      sprite.zIndex = SMOKE_DRAW_ORDER;
      world.addChild(sprite);
      puffs.push({
        sprite,
        originX: buildingSprite.x + chimney.fromLeft(building.width),
        originY: buildingSprite.y + chimney.fromTop,
        phaseSeconds: (index / PUFFS_PER_CHIMNEY) * PUFF_LIFE_SECONDS + random.nextFloat(),
      });
    }
  }

  const clouds: Cloud[] = Array.from({ length: CLOUD_COUNT }, (_, index) => {
    const width = random.nextInt(110, 170);
    const sprite = new Sprite(createPixiTexture(drawCloudShadow(width, random.nextInt(38, 56))));
    sprite.alpha = CLOUD_ALPHA;
    sprite.zIndex = CLOUD_DRAW_ORDER;
    sprite.position.set((index / CLOUD_COUNT) * TOWN_WIDTH, random.nextInt(10, LOGICAL_HEIGHT - 70));
    world.addChild(sprite);
    return { sprite, speedPixelsPerSecond: random.nextInt(5, 10) };
  });

  const fireflies: Firefly[] = Array.from({ length: FIREFLY_COUNT }, () => {
    const sprite = createFlatSprite(FIREFLY_COLOR, 1, 1);
    sprite.zIndex = FIREFLY_DRAW_ORDER;
    world.addChild(sprite);
    return { sprite, x: random.nextFloat() * TOWN_WIDTH, y: 30 + random.nextFloat() * (LOGICAL_HEIGHT - 70), velocityX: 0, velocityY: 0, blinkOffset: random.nextFloat() * 6, nextTurnSeconds: 0 };
  });

  return {
    update: (elapsedSeconds, deltaSeconds) => {
      for (const puff of puffs) {
        const age = ((elapsedSeconds + puff.phaseSeconds) % PUFF_LIFE_SECONDS) / PUFF_LIFE_SECONDS;
        const size = age < 0.35 ? 3 : age < 0.7 ? 4 : 5;
        puff.sprite.width = size;
        puff.sprite.height = size;
        puff.sprite.position.set(Math.round(puff.originX + age * 7 + Math.sin(age * 5) * 2 - size / 2), Math.round(puff.originY - age * PUFF_RISE_PIXELS - size));
        puff.sprite.alpha = 0.78 * (1 - age) * Math.min(1, age * 8);
      }
      for (const cloud of clouds) {
        cloud.sprite.x += cloud.speedPixelsPerSecond * deltaSeconds;
        if (cloud.sprite.x > TOWN_WIDTH) cloud.sprite.x = -cloud.sprite.width;
        cloud.sprite.x = Math.round(cloud.sprite.x);
      }
      for (const firefly of fireflies) {
        if (elapsedSeconds >= firefly.nextTurnSeconds) {
          firefly.velocityX = (random.nextFloat() - 0.5) * 12;
          firefly.velocityY = (random.nextFloat() - 0.5) * 8;
          firefly.nextTurnSeconds = elapsedSeconds + 1 + random.nextFloat() * 2;
        }
        firefly.x = Math.max(0, Math.min(TOWN_WIDTH, firefly.x + firefly.velocityX * deltaSeconds));
        firefly.y = Math.max(20, Math.min(LOGICAL_HEIGHT - 30, firefly.y + firefly.velocityY * deltaSeconds));
        firefly.sprite.position.set(Math.round(firefly.x), Math.round(firefly.y));
        const glow = Math.sin((elapsedSeconds + firefly.blinkOffset) * 2.2);
        firefly.sprite.alpha = glow > 0.2 ? 0.95 : glow > -0.3 ? 0.4 : 0;
      }
    },
  };
}
