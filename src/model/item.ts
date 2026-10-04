import type { StatBlock } from './statBlock';

export type EquipmentSlot =
  | 'mainHand'
  | 'offHand'
  | 'helm'
  | 'armour'
  | 'gloves'
  | 'legs'
  | 'boots'
  | 'belt'
  | 'amulet'
  | 'ringOne'
  | 'ringTwo';

export type ItemSlot = Exclude<EquipmentSlot, 'ringOne' | 'ringTwo'> | 'ring';

export type GearType =
  | 'sword'
  | 'axe'
  | 'greataxe'
  | 'maul'
  | 'knuckles'
  | 'mace'
  | 'dagger'
  | 'bow'
  | 'staff'
  | 'wand'
  | 'shield'
  | 'quiver'
  | 'tome'
  | 'armour'
  | 'accessory';

export type ArmourWeight = 'heavy' | 'medium' | 'light';
export type ItemQuality = 'common' | 'magic' | 'rare' | 'unique';
export type AffixKind = 'prefix' | 'suffix';
// Percent points, not class stats. A hero only gets them from gear.
export const COMBAT_BONUS_STATS = ['criticalChance', 'criticalDamage', 'lifeSteal'] as const;
export type CombatBonusStat = (typeof COMBAT_BONUS_STATS)[number];
export type AffixStat = keyof StatBlock | CombatBonusStat;
export interface StatBonuses extends Partial<StatBlock> {
  physicalDamage?: number;
  magicalDamage?: number;
}

export interface ItemAffix {
  affixId: string;
  kind: AffixKind;
  displayName: string;
  stat: AffixStat;
  value: number;
}

export interface Item {
  id: string;
  baseId: string;
  materialId: string;
  rareNameParts: [string, string] | null;
  slot: ItemSlot;
  gearType: GearType;
  armourWeight: ArmourWeight | null;
  quality: ItemQuality;
  itemLevel: number;
  upgradeLevel: number;
  tier: number;
  width: number;
  height: number;
  baseStats: StatBonuses;
  affixes: ItemAffix[];
  sellValueCopper: number;
}
