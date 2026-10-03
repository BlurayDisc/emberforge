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

type ToolBase = Omit<BaseItemDefinition, 'armourWeight'>;

function withoutArmourWeight(base: ToolBase): BaseItemDefinition {
  return { ...base, armourWeight: null };
}

const WEAPONS_AND_ACCESSORIES: readonly ToolBase[] = [
  { id: 'sword', name: 'Sword', slot: 'mainHand', gearType: 'sword', width: 1, height: 3, profession: 'blacksmithing', mainCategory: 'ore', secondaryCategory: 'fang', baseStats: { strength: 6, skill: 1 } },
  { id: 'axe', name: 'Axe', slot: 'mainHand', gearType: 'axe', width: 1, height: 3, profession: 'blacksmithing', mainCategory: 'ore', secondaryCategory: 'fang', baseStats: { strength: 8 } },
  { id: 'mace', name: 'Mace', slot: 'mainHand', gearType: 'mace', width: 1, height: 3, profession: 'blacksmithing', mainCategory: 'ore', secondaryCategory: 'bone', baseStats: { strength: 5, magic: 2, resistance: 2 } },
  { id: 'dagger', name: 'Dagger', slot: 'mainHand', gearType: 'dagger', width: 1, height: 2, profession: 'blacksmithing', mainCategory: 'ore', secondaryCategory: 'fang', baseStats: { strength: 4, speed: 4, skill: 2 } },
  { id: 'bow', name: 'Bow', slot: 'mainHand', gearType: 'bow', width: 2, height: 3, profession: 'fletching', mainCategory: 'wood', secondaryCategory: 'sinew', baseStats: { strength: 6, skill: 3 } },
  { id: 'staff', name: 'Staff', slot: 'mainHand', gearType: 'staff', width: 1, height: 4, profession: 'woodworking', mainCategory: 'wood', secondaryCategory: 'bone', baseStats: { magic: 8 } },
  { id: 'wand', name: 'Wand', slot: 'mainHand', gearType: 'wand', width: 1, height: 2, profession: 'woodworking', mainCategory: 'wood', secondaryCategory: 'bone', baseStats: { magic: 5, speed: 2 } },
  { id: 'shield', name: 'Shield', slot: 'offHand', gearType: 'shield', width: 2, height: 3, profession: 'blacksmithing', mainCategory: 'ore', secondaryCategory: 'bone', baseStats: { defence: 4, resistance: 1 } },
  { id: 'quiver', name: 'Quiver', slot: 'offHand', gearType: 'quiver', width: 1, height: 2, profession: 'fletching', mainCategory: 'wood', secondaryCategory: 'sinew', baseStats: { strength: 2, skill: 3 } },
  { id: 'tome', name: 'Tome', slot: 'offHand', gearType: 'tome', width: 2, height: 2, profession: 'tailoring', mainCategory: 'cloth', secondaryCategory: 'sinew', baseStats: { magic: 3, resistance: 2 } },
  { id: 'parrying-dagger', name: 'Parrying Dagger', slot: 'offHand', gearType: 'dagger', width: 1, height: 2, profession: 'blacksmithing', mainCategory: 'ore', secondaryCategory: 'fang', baseStats: { strength: 2, skill: 2, speed: 2 } },
  { id: 'belt', name: 'Belt', slot: 'belt', gearType: 'accessory', width: 2, height: 1, profession: 'tailoring', mainCategory: 'hide', secondaryCategory: 'sinew', baseStats: { hp: 6, defence: 1 } },
  { id: 'ring', name: 'Ring', slot: 'ring', gearType: 'accessory', width: 1, height: 1, profession: 'jewelcrafting', mainCategory: 'gem', secondaryCategory: 'ore', baseStats: { skill: 2, hp: 2 } },
  { id: 'amulet', name: 'Amulet', slot: 'amulet', gearType: 'accessory', width: 1, height: 1, profession: 'jewelcrafting', mainCategory: 'gem', secondaryCategory: 'ore', baseStats: { hp: 4, resistance: 2 } },
];

interface ArmourPiece {
  slot: ItemSlot;
  width: number;
  height: number;
  namesByWeight: Record<ArmourWeight, string>;
  defence: number;
  hp: number;
  skill: number;
  speed: number;
}

interface ArmourWeightRule {
  weight: ArmourWeight;
  profession: ProfessionId;
  mainCategory: MaterialCategory;
  secondaryCategory: MaterialCategory;
  defenceFactor: number;
  resistanceFactor: number;
}

const ARMOUR_PIECES: readonly ArmourPiece[] = [
  { slot: 'helm', width: 2, height: 2, namesByWeight: { heavy: 'Helm', medium: 'Cap', light: 'Hood' }, defence: 3, hp: 4, skill: 0, speed: 0 },
  { slot: 'armour', width: 2, height: 3, namesByWeight: { heavy: 'Cuirass', medium: 'Jerkin', light: 'Robe' }, defence: 6, hp: 10, skill: 0, speed: 0 },
  { slot: 'gloves', width: 2, height: 2, namesByWeight: { heavy: 'Gauntlets', medium: 'Gloves', light: 'Mitts' }, defence: 2, hp: 0, skill: 1, speed: 0 },
  { slot: 'boots', width: 2, height: 2, namesByWeight: { heavy: 'Greaves', medium: 'Boots', light: 'Slippers' }, defence: 2, hp: 0, skill: 0, speed: 1 },
];

const ARMOUR_WEIGHT_RULES: readonly ArmourWeightRule[] = [
  { weight: 'heavy', profession: 'blacksmithing', mainCategory: 'ore', secondaryCategory: 'bone', defenceFactor: 1, resistanceFactor: 0.3 },
  { weight: 'medium', profession: 'tailoring', mainCategory: 'hide', secondaryCategory: 'sinew', defenceFactor: 0.7, resistanceFactor: 0.5 },
  { weight: 'light', profession: 'tailoring', mainCategory: 'cloth', secondaryCategory: 'sinew', defenceFactor: 0.4, resistanceFactor: 1 },
];

function createArmourBase(piece: ArmourPiece, rule: ArmourWeightRule): BaseItemDefinition {
  const baseStats: StatBonuses = {
    defence: Math.max(1, Math.round(piece.defence * rule.defenceFactor)),
    resistance: Math.max(1, Math.round(piece.defence * rule.resistanceFactor)),
  };
  if (piece.hp > 0) baseStats.hp = piece.hp;
  if (piece.skill > 0) baseStats.skill = piece.skill;
  if (piece.speed > 0) baseStats.speed = piece.speed;
  return {
    id: `${piece.slot}-${rule.weight}`,
    name: piece.namesByWeight[rule.weight],
    slot: piece.slot,
    gearType: 'armour',
    armourWeight: rule.weight,
    width: piece.width,
    height: piece.height,
    profession: rule.profession,
    mainCategory: rule.mainCategory,
    secondaryCategory: rule.secondaryCategory,
    baseStats,
  };
}

export const BASE_ITEMS: readonly BaseItemDefinition[] = [
  ...WEAPONS_AND_ACCESSORIES.map(withoutArmourWeight),
  ...ARMOUR_PIECES.flatMap((piece) => ARMOUR_WEIGHT_RULES.map((rule) => createArmourBase(piece, rule))),
];

export const PROFESSION_LABELS: Record<ProfessionId, string> = {
  blacksmithing: 'Blacksmithing',
  fletching: 'Fletching',
  woodworking: 'Woodworking',
  tailoring: 'Tailoring',
  jewelcrafting: 'Jewelcrafting',
};
