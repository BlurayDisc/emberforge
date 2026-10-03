import { SPELL_LEARN_COST_BASE_COPPER, SPELL_LEARN_COST_LEVEL_EXPONENT, ULTIMATE_LEARN_COST_FACTOR } from '../../content/balance/spells';
import { findSpell } from '../../content/spells';
import type { Hero } from '../../model/hero';
import type { SpellDefinition } from '../../model/spell';

export interface SpellProblem {
  key: string;
  params?: Record<string, string | number>;
}

export function learnCostCopper(spell: SpellDefinition): number {
  const kindFactor = spell.isUltimate ? ULTIMATE_LEARN_COST_FACTOR : 1;
  return Math.max(1, Math.round(SPELL_LEARN_COST_BASE_COPPER * spell.unlockLevel ** SPELL_LEARN_COST_LEVEL_EXPONENT * kindFactor));
}

export function findLearnProblem(hero: Hero, spell: SpellDefinition): SpellProblem | null {
  if (spell.classId !== hero.classId) return { key: 'reject.spellWrongClass' };
  if (hero.learnedSpellIds.includes(spell.id)) return { key: 'reject.spellAlreadyLearned' };
  if (hero.level < spell.unlockLevel) return { key: 'reject.spellLevelTooLow', params: { level: spell.unlockLevel } };
  return null;
}

// A new spell takes the first free slot of its kind, so a hero fights with it at once.
export function learnSpell(hero: Hero, spell: SpellDefinition): Hero {
  const learnedSpellIds = [...hero.learnedSpellIds, spell.id];
  if (spell.isUltimate) return { ...hero, learnedSpellIds, equippedUltimateId: hero.equippedUltimateId ?? spell.id };
  const freeSlotIndex = hero.equippedSpellIds.indexOf(null);
  if (freeSlotIndex < 0) return { ...hero, learnedSpellIds };
  return { ...hero, learnedSpellIds, equippedSpellIds: hero.equippedSpellIds.map((id, index) => (index === freeSlotIndex ? spell.id : id)) };
}

export function isSpellEquipped(hero: Hero, spellId: string): boolean {
  return hero.equippedSpellIds.includes(spellId) || hero.equippedUltimateId === spellId;
}

// The slot index picks the normal slot to fill. A spell already equipped in another slot moves, and the other slot takes what was in the target slot.
export function equipSpell(hero: Hero, spell: SpellDefinition, slotIndex: number): Hero {
  if (spell.isUltimate) return { ...hero, equippedUltimateId: spell.id };
  const slots = [...hero.equippedSpellIds];
  const previousIndex = slots.indexOf(spell.id);
  if (previousIndex >= 0) slots[previousIndex] = slots[slotIndex] ?? null;
  slots[slotIndex] = spell.id;
  return { ...hero, equippedSpellIds: slots };
}

export function unequipSpell(hero: Hero, spellId: string): Hero {
  return {
    ...hero,
    equippedSpellIds: hero.equippedSpellIds.map((id) => (id === spellId ? null : id)),
    equippedUltimateId: hero.equippedUltimateId === spellId ? null : hero.equippedUltimateId,
  };
}

export function equippedSpellsOf(hero: Hero): SpellDefinition[] {
  const ids = [hero.equippedUltimateId, ...hero.equippedSpellIds];
  return ids.flatMap((id) => (id === null ? [] : (findSpell(id) ?? [])));
}
