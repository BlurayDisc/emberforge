import materialsData from '../../data/materials.json';
import type { MaterialCategory } from '../model/material';
import type { StatBlock } from '../model/statBlock';

// A set material is dropped by one dungeon. Armour crafted with it always gets this flat bonus.
export interface SetBonus {
  stat: keyof StatBlock;
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
  // The recipe offset inside the bracket from which a crafter can use this set material.
  setCraftLevelOffset?: number;
  // The body armour is the last piece of a set, so it can ask for a crafter level beyond the bracket.
  setBodyArmourCraftLevelOffset?: number;
}

export const MATERIALS = materialsData as unknown as readonly MaterialDefinition[];
