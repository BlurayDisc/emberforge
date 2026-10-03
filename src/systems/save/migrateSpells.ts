import { NORMAL_SPELL_SLOT_COUNT } from '../../content/balance/spells';
import type { Hero } from '../../model/hero';

// Version 12: heroes learn spells. Existing heroes know none.
export function migrateSpells(save: Record<string, unknown>): Record<string, unknown> {
  const company = ((save.company ?? []) as Hero[]).map((hero) => ({
    ...hero,
    learnedSpellIds: hero.learnedSpellIds ?? [],
    equippedSpellIds: hero.equippedSpellIds ?? Array.from({ length: NORMAL_SPELL_SLOT_COUNT }, () => null),
    equippedUltimateId: hero.equippedUltimateId ?? null,
  }));
  return { ...save, company };
}
