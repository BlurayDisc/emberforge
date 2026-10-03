import type { AttackKind, UnitBehavior } from '../model/battle';
import type { ClassId } from '../model/hero';
import type { StatBlock } from '../model/statBlock';

export interface ClassDefinition {
  id: ClassId;
  displayName: string;
  roleDescription: string;
  attackKind: AttackKind;
  behavior: UnitBehavior;
  spriteKey: string;
  baseStats: StatBlock;
  growthPerLevel: StatBlock;
}

export const CLASSES: readonly ClassDefinition[] = [
  {
    id: 'warrior',
    displayName: 'Warrior',
    roleDescription: 'Front-line melee fighter with high HP and Defence.',
    attackKind: 'physical',
    behavior: 'fighter',
    spriteKey: 'hero-warrior',
    baseStats: { hp: 52, strength: 9, magic: 1, skill: 6, speed: 100, defence: 7, resistance: 2 },
    growthPerLevel: { hp: 10, strength: 1.9, magic: 0.2, skill: 0.8, speed: 0.1, defence: 1.4, resistance: 0.6 },
  },
  {
    id: 'archer',
    displayName: 'Archer',
    roleDescription: 'Ranged physical damage. Fast and accurate.',
    attackKind: 'physical',
    behavior: 'fighter',
    spriteKey: 'hero-archer',
    baseStats: { hp: 40, strength: 8, magic: 1, skill: 9, speed: 108, defence: 4, resistance: 3 },
    growthPerLevel: { hp: 7.5, strength: 1.8, magic: 0.2, skill: 1, speed: 0.1, defence: 0.9, resistance: 0.7 },
  },
  {
    id: 'mage',
    displayName: 'Mage',
    roleDescription: 'Ranged magic damage. Fragile.',
    attackKind: 'magic',
    behavior: 'fighter',
    spriteKey: 'hero-mage',
    baseStats: { hp: 34, strength: 1, magic: 10, skill: 6, speed: 96, defence: 3, resistance: 6 },
    growthPerLevel: { hp: 6, strength: 0.2, magic: 2.1, skill: 0.8, speed: 0.1, defence: 0.6, resistance: 1.2 },
  },
  {
    id: 'priest',
    displayName: 'Priest',
    roleDescription: 'Heals allies below half health.',
    attackKind: 'magic',
    behavior: 'healer',
    spriteKey: 'hero-priest',
    baseStats: { hp: 38, strength: 1, magic: 8, skill: 5, speed: 98, defence: 3, resistance: 7 },
    growthPerLevel: { hp: 7, strength: 0.2, magic: 1.8, skill: 0.6, speed: 0.1, defence: 0.6, resistance: 1.3 },
  },
  {
    id: 'thief',
    displayName: 'Thief',
    roleDescription: 'Very fast melee attacker with high critical chance.',
    attackKind: 'physical',
    behavior: 'fighter',
    spriteKey: 'hero-thief',
    baseStats: { hp: 38, strength: 8, magic: 1, skill: 12, speed: 125, defence: 4, resistance: 3 },
    growthPerLevel: { hp: 7, strength: 1.7, magic: 0.2, skill: 1.2, speed: 0.2, defence: 0.8, resistance: 0.6 },
  },
];
