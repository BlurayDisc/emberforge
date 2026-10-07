import classesData from '../../data/classes.json';
import type { AttackKind, UnitBehavior } from '../model/battle';
import type { ClassId } from '../model/hero';
import type { ResourceId } from '../model/resource';
import type { ArmourWeight, GearType } from '../model/item';

export type AttributeName = 'strength' | 'agility' | 'intelligence';
export type BalanceStatus = 'baseline' | 'placeholder';

export interface AttributeGrowth {
  start: number;
  gainPerLevel: number;
}

export interface ClassDefinition {
  id: ClassId;
  displayName: string;
  roleDescription: string;
  attackKind: AttackKind;
  // Like the main attribute in Warcraft or Dota: it gives this class its attack damage, one point for one damage.
  primaryAttribute: AttributeName;
  // How far one hit swings from its base damage (0.1 means 90-110%). A steady class has a small number, a wild class a big one.
  damageVarianceFraction: number;
  behavior: UnitBehavior;
  resourceId: ResourceId;
  spriteKey: string;
  weaponTypes: readonly GearType[];
  offHandTypes: readonly GearType[];
  // The armour weights the class can wear. The first one is its main weight (it sets the sound of a hit on the hero).
  armourWeights: readonly ArmourWeight[];
  // A placeholder class has numbers that are derived from the baseline classes and wait for their own balance pass.
  balanceStatus: BalanceStatus;
  // Attribute at level L is round(start + gainPerLevel x (L - 1)).
  attributes: Record<AttributeName, AttributeGrowth>;
  baseHp: number;
  baseDamage: number;
  baseDefence: number;
  baseResistance: number;
  baseAttackSeconds: number;
  // Added to the base critical chance of every hero.
  criticalChanceBonus: number;
  recoveryRate: number;
  unlockAfterDungeonId: string | null;
}

export const CLASSES = classesData as unknown as readonly ClassDefinition[];
