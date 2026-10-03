import type { Hero } from '../../model/hero';
import type { Item } from '../../model/item';

type SavedItem = Omit<Item, 'upgradeLevel'> & { upgradeLevel?: number };

const withUpgradeLevel = (item: SavedItem): Item => ({ ...item, upgradeLevel: item.upgradeLevel ?? 0 });

// Version 11: every item has an upgrade level. Items made before this rule have level 0.
export function migrateUpgradeLevels(save: Record<string, unknown>): Record<string, unknown> {
  const backpack = ((save.backpack ?? []) as Array<{ content: { kind: string; item?: SavedItem } }>).map((entry) =>
    entry.content.kind === 'item' && entry.content.item ? { ...entry, content: { ...entry.content, item: withUpgradeLevel(entry.content.item) } } : entry,
  );
  const company = ((save.company ?? []) as Hero[]).map((hero) => ({
    ...hero,
    equipment: Object.fromEntries(Object.entries(hero.equipment).map(([slot, item]) => [slot, withUpgradeLevel(item as SavedItem)])),
  }));
  const jobs = ((save.jobs ?? []) as Array<{ item?: SavedItem }>).map((job) => (job.item ? { ...job, item: withUpgradeLevel(job.item) } : job));
  return { ...save, backpack, company, jobs };
}
