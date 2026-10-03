import { Group, Sprite, SpriteMaterial } from 'three';
import { LOGICAL_WIDTH } from '../kernel/stageSize';
import { ANIMAL_COATS, animalSpriteSize, drawAnimalFrame, type AnimalKind } from './animalArt';
import { drawShadowOval } from './castleAmbientArt';
import { castleWorldX, castleWorldY } from './castleScenery';
import { createPixelTexture } from './pixelSprites';

const BREATH_SECONDS = 2.2;
const SHADOW_HEIGHT = 6;

interface CastlePet {
  kind: AnimalKind;
  coatIndex: number;
  screen: number;
  x: number;
  y: number;
}

// Pets rest where a person stands nearby: the dog at the king's feet, the cat beside the queen.
const CASTLE_PETS: readonly CastlePet[] = [
  { kind: 'dog', coatIndex: 0, screen: 0, x: 268, y: 154 },
  { kind: 'cat', coatIndex: 3, screen: 0, x: 221, y: 153 },
  { kind: 'dog', coatIndex: 1, screen: 1, x: 340, y: 252 },
  { kind: 'cat', coatIndex: 1, screen: 1, x: 132, y: 264 },
];

export interface CastlePets {
  update(elapsedSeconds: number): void;
}

export function createCastlePets(root: Group): CastlePets {
  const resting = CASTLE_PETS.map((pet, index) => {
    const coats = ANIMAL_COATS[pet.kind];
    const { width, height } = animalSpriteSize(pet.kind);
    const depth = pet.y * 0.01 - 3;
    const feetX = castleWorldX(pet.screen * LOGICAL_WIDTH + pet.x);
    const feetY = castleWorldY(pet.y);

    const shadow = new Sprite(new SpriteMaterial({ map: createPixelTexture(drawShadowOval(width)), transparent: true }));
    shadow.scale.set(width, SHADOW_HEIGHT, 1);
    shadow.position.set(feetX, feetY - 1, depth - 0.001);
    root.add(shadow);

    const coat = coats[pet.coatIndex % coats.length] as (typeof coats)[number];
    const sprite = new Sprite(new SpriteMaterial({ map: createPixelTexture(drawAnimalFrame(pet.kind, coat, 'rest')), transparent: true }));
    sprite.scale.set(width, height, 1);
    const restingY = feetY + height / 2;
    sprite.position.set(feetX, restingY, depth);
    root.add(sprite);
    return { sprite, restingY, phase: index * 0.7 };
  });

  return {
    // A sleeping pet breathes: one whole pixel up for half of each slow cycle.
    update: (elapsedSeconds) => {
      for (const pet of resting) pet.sprite.position.y = pet.restingY + ((elapsedSeconds + pet.phase) % BREATH_SECONDS < BREATH_SECONDS / 2 ? 0 : 1);
    },
  };
}
