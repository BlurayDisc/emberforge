import { Sprite, type Container, type Texture } from 'pixi.js';
import { createRandom } from '../kernel/random';
import { ANIMAL_COATS, animalSpriteSize, drawAnimalFrame, mirrorHorizontally, type AnimalKind, type AnimalPose } from './animalArt';
import type { AnimalPetting, PettableAnimal } from './animalPetting';
import { createPixiTexture } from './pixiTextures';
import { pointAtDistance, routeLength } from './roadRoute';
import type { Road } from './townLayout';
import type { VisibleRange } from './bystanders';

const MINIMUM_WALKING_ROUTE_PIXELS = 30;
const STEPS_PER_SECOND = 5;
const DRAW_ORDER_BEHIND_PEOPLE = 0.01;

interface AnimalBehaviour {
  minimumSpeedPixelsPerSecond: number;
  maximumSpeedPixelsPerSecond: number;
  restChancePerSecond: number;
  minimumRestSeconds: number;
  maximumRestSeconds: number;
}

// A cat is slow and sits often. A dog trots and rarely stops. A hen shuffles and pecks.
const ANIMAL_BEHAVIOUR: Record<AnimalKind, AnimalBehaviour> = {
  cat: { minimumSpeedPixelsPerSecond: 6, maximumSpeedPixelsPerSecond: 10, restChancePerSecond: 0.12, minimumRestSeconds: 4, maximumRestSeconds: 10 },
  dog: { minimumSpeedPixelsPerSecond: 14, maximumSpeedPixelsPerSecond: 20, restChancePerSecond: 0.04, minimumRestSeconds: 2, maximumRestSeconds: 5 },
  hen: { minimumSpeedPixelsPerSecond: 5, maximumSpeedPixelsPerSecond: 8, restChancePerSecond: 0.2, minimumRestSeconds: 2, maximumRestSeconds: 6 },
};

// Walking art faces right. The left-facing frames are drawn mirrored once, so the stage never flips a sprite.
type Facing = 'right' | 'left';

interface RoamingAnimal {
  kind: AnimalKind;
  sprite: Sprite;
  framesByFacing: Record<Facing, Record<AnimalPose, Texture>>;
  route: Road['points'];
  routeLength: number;
  distance: number;
  direction: 1 | -1;
  speedPixelsPerSecond: number;
  restUntilSeconds: number;
  petting: PettableAnimal;
}

export interface TownAnimals {
  update(elapsedSeconds: number): void;
  // The kinds of the animals that stand in the part of the town that the player sees.
  visibleKinds(): readonly AnimalKind[];
}

function createFramesByFacing(kind: AnimalKind, coatIndex: number): Record<Facing, Record<AnimalPose, Texture>> {
  const coat = ANIMAL_COATS[kind][coatIndex % ANIMAL_COATS[kind].length] as (typeof ANIMAL_COATS)[AnimalKind][number];
  const facingRight = { stepA: drawAnimalFrame(kind, coat, 'stepA'), stepB: drawAnimalFrame(kind, coat, 'stepB'), rest: drawAnimalFrame(kind, coat, 'rest') };
  const texturesOf = (flip: (canvas: HTMLCanvasElement) => HTMLCanvasElement): Record<AnimalPose, Texture> => ({
    stepA: createPixiTexture(flip(facingRight.stepA)),
    stepB: createPixiTexture(flip(facingRight.stepB)),
    rest: createPixiTexture(flip(facingRight.rest)),
  });
  return { right: texturesOf((canvas) => canvas), left: texturesOf(mirrorHorizontally) };
}

export function createTownAnimals(root: Container, roads: readonly Road[], seed: number, petting: AnimalPetting, visibleRange: () => VisibleRange): TownAnimals {
  const random = createRandom(seed).fork('animals');
  const plans = roads
    .filter((road) => routeLength(road.points) >= MINIMUM_WALKING_ROUTE_PIXELS)
    .flatMap((road) => Object.entries(road.animals ?? {}).flatMap(([kind, count]) => Array.from({ length: count }, () => ({ road, kind: kind as AnimalKind }))));

  const animals: RoamingAnimal[] = plans.map(({ road, kind }) => {
    const behaviour = ANIMAL_BEHAVIOUR[kind];
    const framesByFacing = createFramesByFacing(kind, random.nextInt(0, ANIMAL_COATS[kind].length - 1));
    const sprite = new Sprite(framesByFacing.right.stepA);
    root.addChild(sprite);
    const { width, height } = animalSpriteSize(kind);
    const length = routeLength(road.points);
    return {
      kind,
      sprite,
      framesByFacing,
      route: road.points,
      routeLength: length,
      distance: random.nextFloat() * length,
      direction: random.chance(0.5) ? 1 : -1,
      speedPixelsPerSecond: random.nextInt(behaviour.minimumSpeedPixelsPerSecond, behaviour.maximumSpeedPixelsPerSecond),
      restUntilSeconds: 0,
      petting: petting.attach(sprite, kind, { width, height, heartStart: { x: width / 2, y: 0 }, artOrigin: { x: 0, y: 0 } }),
    };
  });

  let previousSeconds: number | null = null;
  return {
    update: (elapsedSeconds) => {
      const deltaSeconds = previousSeconds === null ? 0 : Math.min(0.1, elapsedSeconds - previousSeconds);
      previousSeconds = elapsedSeconds;
      for (const animal of animals) {
        const behaviour = ANIMAL_BEHAVIOUR[animal.kind];
        const isHappy = animal.petting.isHappy(elapsedSeconds);
        let isResting = isHappy || elapsedSeconds < animal.restUntilSeconds;
        if (!isResting && random.chance(behaviour.restChancePerSecond * deltaSeconds)) {
          animal.restUntilSeconds = elapsedSeconds + random.nextInt(behaviour.minimumRestSeconds, behaviour.maximumRestSeconds);
          isResting = true;
        }
        if (!isResting) {
          animal.distance += animal.direction * animal.speedPixelsPerSecond * deltaSeconds;
          if (animal.distance >= animal.routeLength || animal.distance <= 0) {
            animal.distance = Math.max(0, Math.min(animal.routeLength, animal.distance));
            animal.direction = animal.direction === 1 ? -1 : 1;
          }
        }
        const position = pointAtDistance(animal.route, animal.distance);
        const pose: AnimalPose = isResting ? 'rest' : Math.floor(elapsedSeconds * STEPS_PER_SECOND) % 2 === 0 ? 'stepA' : 'stepB';
        const { width, height } = animalSpriteSize(animal.kind);
        animal.sprite.texture = animal.framesByFacing[animal.direction === 1 ? 'right' : 'left'][pose];
        animal.sprite.position.set(Math.round(position.x - width / 2), Math.round(position.y - height) - animal.petting.hopHeight(elapsedSeconds));
        animal.sprite.zIndex = position.y - DRAW_ORDER_BEHIND_PEOPLE;
      }
    },
    visibleKinds: () => {
      const { from, to } = visibleRange();
      return animals.filter((animal) => animal.sprite.x > from && animal.sprite.x < to).map((animal) => animal.kind);
    },
  };
}
