import classesData from '../../data/classes.json';
import type { AttackKind, UnitBehavior } from '../model/battle';
import type { ClassId } from '../model/hero';
import type { ArmourWeight, GearType } from '../model/item';
import type { StatBlock } from '../model/statBlock';

export interface ClassDefinition {
  id: ClassId;
  displayName: string;
  roleDescription: string;
  attackKind: AttackKind;
  behavior: UnitBehavior;
  spriteKey: string;
  weaponTypes: readonly GearType[];
  offHandTypes: readonly GearType[];
  armourWeight: ArmourWeight;
  baseStats: StatBlock;
  growthPerLevel: StatBlock;
}

export const CLASSES = classesData as unknown as readonly ClassDefinition[];
