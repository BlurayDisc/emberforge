import baseItemsData from '../../data/base-items.json';
import type { ArmourWeight, GearType, ItemSlot, StatBonuses } from '../model/item';
import type { MaterialCategory } from '../model/material';

export type ProfessionId = 'weaponsmithing' | 'armoursmithing' | 'fletching' | 'woodworking' | 'tailoring' | 'jewelcrafting';

export interface BaseItemDefinition {
  id: string;
  name: string;
  slot: ItemSlot;
  gearType: GearType;
  armourWeight: ArmourWeight | null;
  width: number;
  height: number;
  profession: ProfessionId;
  mainCategory: MaterialCategory;
  baseStats: StatBonuses;
  craftLevelOffset: number;
}

export const BASE_ITEMS = baseItemsData as unknown as readonly BaseItemDefinition[];

export const PROFESSION_IDS: readonly ProfessionId[] = ['weaponsmithing', 'armoursmithing', 'fletching', 'woodworking', 'tailoring', 'jewelcrafting'];
