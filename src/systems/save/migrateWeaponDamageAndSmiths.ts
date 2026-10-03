// Version 8: weapons get damage stats of their own, and Blacksmithing splits into Weaponsmithing and Armoursmithing.
// The code reads old saves as loose JSON, because the old shapes no longer exist as types.
type Loose = Record<string, unknown>;

const WEAPON_GEAR_TYPES = ['sword', 'axe', 'mace', 'dagger', 'bow', 'staff', 'wand', 'quiver', 'tome'];
const WEAPONSMITH_BASE_IDS = ['sword', 'axe', 'mace', 'dagger', 'parrying-dagger'];

function migrateItem(item: Loose): Loose {
  if (!WEAPON_GEAR_TYPES.includes(item.gearType as string)) return item;
  const { strength, magic, ...otherStats } = item.baseStats as Loose;
  const baseStats: Loose = { ...otherStats };
  if (strength !== undefined) baseStats.physicalDamage = strength;
  if (magic !== undefined) baseStats.magicalDamage = magic;
  return { ...item, baseStats };
}

function migrateBackpackContent(content: Loose): Loose {
  return content.kind === 'item' ? { ...content, item: migrateItem(content.item as Loose) } : content;
}

function migrateJob(job: Loose): Loose {
  if (job.kind === 'sell') return { ...job, content: migrateBackpackContent(job.content as Loose) };
  const item = migrateItem(job.item as Loose);
  const professionId = job.professionId === 'blacksmithing' ? (WEAPONSMITH_BASE_IDS.includes(item.baseId as string) ? 'weaponsmithing' : 'armoursmithing') : job.professionId;
  return { ...job, item, professionId };
}

function migrateHero(hero: Loose): Loose {
  const equipment = Object.fromEntries(Object.entries(hero.equipment as Loose).map(([slot, item]) => [slot, migrateItem(item as Loose)]));
  return { ...hero, equipment };
}

function migrateCrafters(crafters: Loose): Loose {
  const { blacksmithing, ...otherCrafters } = crafters;
  return blacksmithing === undefined ? otherCrafters : { ...otherCrafters, weaponsmithing: blacksmithing, armoursmithing: blacksmithing };
}

export function migrateWeaponDamageAndSmiths(save: Loose): Loose {
  return {
    ...save,
    company: (save.company as Loose[]).map(migrateHero),
    backpack: (save.backpack as Loose[]).map((entry) => ({ ...entry, content: migrateBackpackContent(entry.content as Loose) })),
    jobs: ((save.jobs as Loose[] | undefined) ?? []).map(migrateJob),
    crafters: migrateCrafters((save.crafters as Loose | undefined) ?? {}),
  };
}
