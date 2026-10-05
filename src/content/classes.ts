import classesData from '../../data/classes.json';
import type { AttackKind, UnitBehavior } from '../model/battle';
import type { ClassId } from '../model/hero';
import type { ResourceId } from '../model/resource';
import type { ArmourWeight, GearType } from '../model/item';
import type { StatBlock } from '../model/statBlock';

export type PrimaryAttribute = 'strength' | 'skill' | 'magic';

export interface ClassDefinition {
  id: ClassId;
  displayName: string;
  roleDescription: string;
  attackKind: AttackKind;
  // Like the main attribute in Warcraft or Dota: it gives this class its attack damage, one point for one damage.
  primaryAttribute: PrimaryAttribute;
  // How far one hit swings from its base damage (0.1 means 90-110%). A steady class has a small number, a wild class a big one.
  damageVarianceFraction: number;
  behavior: UnitBehavior;
  resourceId: ResourceId;
  spriteKey: string;
  weaponTypes: readonly GearType[];
  offHandTypes: readonly GearType[];
  // The armour weights the class can wear. The first one is its main weight (it sets the sound of a hit on the hero).
  armourWeights: readonly ArmourWeight[];
  baseStats: StatBlock;
  growthPerLevel: StatBlock;
  recoveryRate: number;
  unlockAfterDungeonId: string | null;
}

export const CLASSES = classesData as unknown as readonly ClassDefinition[];
