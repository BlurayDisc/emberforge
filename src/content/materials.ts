import materialsData from '../../data/materials.json';
import type { MaterialCategory } from '../model/material';
import type { AffixStat } from '../model/item';

// A set material is dropped by one dungeon. Armour crafted with it always gets this flat bonus.
export interface SetBonus {
  stat: AffixStat;
  value: number;
}

export interface MaterialDefinition {
  id: string;
  name: string;
  tier: number;
  category: MaterialCategory;
  sellValueCopper: number;
  width: number;
  height: number;
  craftedItemPrefix?: string;
  setBonus?: SetBonus;
  // The level of the dungeon that drops this set material. Every set recipe opens at this crafter level or at the level of its base item, whichever is higher.
  setCraftLevelOffset?: number;
}

export const MATERIALS = materialsData as unknown as readonly MaterialDefinition[];
