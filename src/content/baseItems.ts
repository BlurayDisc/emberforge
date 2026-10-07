import baseItemsData from '../../data/base-items.json';
import type { ArmourWeight, GearType, ItemSlot, StatBonuses } from '../model/item';
import type { MaterialCategory } from '../model/material';

export type ProfessionId = 'weaponsmithing' | 'armoursmithing' | 'fletching' | 'enchanting' | 'leatherworking' | 'tailoring' | 'jewelcrafting';

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
  mainIngredientQuantity: number;
  // Whole numbers. A stat without a growth is the value at the item level of the recipe. A stat with a growth is the value at item level 1.
  baseStats: StatBonuses;
  // The stat that every upgrade step raises by 1.
  mainStat: keyof StatBonuses;
  // A stat listed here grows by a flat amount for each item level above 1 (weapon damage).
  growthPerItemLevel?: StatBonuses;
  craftLevelOffset: number;
}

export const BASE_ITEMS = baseItemsData as unknown as readonly BaseItemDefinition[];

export const PROFESSION_IDS: readonly ProfessionId[] = ['weaponsmithing', 'armoursmithing', 'fletching', 'enchanting', 'leatherworking', 'tailoring', 'jewelcrafting'];
