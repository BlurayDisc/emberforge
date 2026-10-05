import { AFFIXES } from '../../../content/affixes';
import { BASE_ITEMS } from '../../../content/baseItems';
import { MATERIALS } from '../../../content/materials';
import type { Item, ItemAffix, ItemQuality, StatBonuses } from '../../../model/item';
import { readEach, readList, readRecord, readText, readWholeNumber, type SalvageTally, type UnknownRecord } from './lenientReaders';

const QUALITIES: readonly ItemQuality[] = ['common', 'uncommon', 'magic', 'rare', 'unique'];
const MAXIMUM_NUMBER = Number.MAX_SAFE_INTEGER;

function salvageAffix(value: unknown): ItemAffix | null {
  const record = readRecord(value);
  const definition = AFFIXES.find((affix) => affix.id === record?.affixId);
  if (!record || !definition || typeof record.value !== 'number' || !Number.isFinite(record.value)) return null;
  return { affixId: definition.id, kind: definition.kind, displayName: definition.displayName, stat: definition.stat, value: record.value };
}

function salvageBaseStats(value: unknown): StatBonuses {
  const record = readRecord(value) ?? {};
  return Object.fromEntries(Object.entries(record).filter(([, amount]) => typeof amount === 'number' && Number.isFinite(amount))) as StatBonuses;
}

function salvageRareNameParts(value: unknown): [string, string] | null {
  const parts = readList(value);
  const [first, second] = parts;
  return parts.length === 2 && typeof first === 'string' && typeof second === 'string' ? [first, second] : null;
}

// The base item and the material must still exist. The shape (slot, size, gear type) always comes from the base item.
// A bad affix is dropped and the item stays.
export function salvageItem(value: unknown, tally: SalvageTally): Item | null {
  const record: UnknownRecord | null = readRecord(value);
  const baseItem = BASE_ITEMS.find((candidate) => candidate.id === record?.baseId);
  const material = MATERIALS.find((candidate) => candidate.id === record?.materialId);
  const id = readText(record?.id);
  if (!record || !baseItem || !material || !id) return null;
  return {
    id,
    baseId: baseItem.id,
    materialId: material.id,
    rareNameParts: salvageRareNameParts(record.rareNameParts),
    slot: baseItem.slot,
    gearType: baseItem.gearType,
    armourWeight: baseItem.armourWeight,
    quality: QUALITIES.find((quality) => quality === record.quality) ?? 'common',
    itemLevel: readWholeNumber(record.itemLevel, 1, MAXIMUM_NUMBER, 1),
    upgradeLevel: readWholeNumber(record.upgradeLevel, 0, MAXIMUM_NUMBER, 0),
    tier: readWholeNumber(record.tier, 1, MAXIMUM_NUMBER, material.tier),
    width: baseItem.width,
    height: baseItem.height,
    baseStats: salvageBaseStats(record.baseStats),
    affixes: readEach(record.affixes, salvageAffix, tally),
    sellValueCopper: readWholeNumber(record.sellValueCopper, 0, MAXIMUM_NUMBER, 0),
  };
}
