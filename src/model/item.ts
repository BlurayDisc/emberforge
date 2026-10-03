import type { StatBlock } from './statBlock';

export type EquipmentSlot =
  | 'mainHand'
  | 'offHand'
  | 'helm'
  | 'armour'
  | 'gloves'
  | 'boots'
  | 'belt'
  | 'amulet'
  | 'ringOne'
  | 'ringTwo';

export type ItemSlot = Exclude<EquipmentSlot, 'ringOne' | 'ringTwo'> | 'ring';

export type GearType =
  | 'sword'
  | 'axe'
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
export interface StatBonuses extends Partial<StatBlock> {
  physicalDamage?: number;
  magicalDamage?: number;
}

export interface ItemAffix {
  affixId: string;
  kind: AffixKind;
  displayName: string;
  stat: keyof StatBlock;
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
  tier: number;
  width: number;
  height: number;
  baseStats: StatBonuses;
  affixes: ItemAffix[];
  sellValueCopper: number;
}
