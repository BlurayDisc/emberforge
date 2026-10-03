import baseItemsData from '../../data/base-items.json';
import professionsData from '../../data/professions.json';
import type { ArmourWeight, GearType, ItemSlot, StatBonuses } from '../model/item';
import type { MaterialCategory } from '../model/material';

export type ProfessionId = 'blacksmithing' | 'fletching' | 'woodworking' | 'tailoring' | 'jewelcrafting';

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
  secondaryCategory: MaterialCategory;
  baseStats: StatBonuses;
}

export const BASE_ITEMS = baseItemsData as unknown as readonly BaseItemDefinition[];

export const PROFESSION_LABELS = professionsData as Record<ProfessionId, string>;
