// Version 25: Skill is gone (Agility replaces it), Magic is called Intelligence, Speed is attack speed (percent points), and weapon damage, armour and HP are flat numbers on a bigger scale.
// A hero stores no derived stats (they come from the class and the level), so only items change. The code reads old saves as loose JSON, because the old shapes no longer exist as types.
type Loose = Record<string, unknown>;

const RENAMED_STAT: Record<string, string> = { skill: 'agility', magic: 'intelligence', speed: 'attackSpeed' };
const OLD_HP_TO_NEW_HP = 10;

function isItem(value: unknown): value is Loose {
  return typeof value === 'object' && value !== null && 'baseId' in value && 'baseStats' in value && 'affixes' in value;
}

// Only the stat names change here. Version 26 computes the item stats again from the current base items.
function renamedBaseStats(item: Loose): Loose {
  return Object.fromEntries(Object.entries(item.baseStats as Loose).map(([stat, value]) => [RENAMED_STAT[stat] ?? stat, value]));
}

function migrateAffix(affix: Loose): Loose {
  const stat = affix.stat as string;
  const value = affix.value as number;
  return { ...affix, stat: RENAMED_STAT[stat] ?? stat, value: stat === 'hp' ? value * OLD_HP_TO_NEW_HP : value };
}

function migrateItem(item: Loose): Loose {
  return { ...item, baseStats: renamedBaseStats(item), affixes: (item.affixes as Loose[]).map(migrateAffix) };
}

function migrateEveryItem(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(migrateEveryItem);
  if (typeof value !== 'object' || value === null) return value;
  if (isItem(value)) return migrateItem(value);
  return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, migrateEveryItem(inner)]));
}

export function migrateAttributesAndFlatStats(save: Loose): Loose {
  return migrateEveryItem(save) as Loose;
}
