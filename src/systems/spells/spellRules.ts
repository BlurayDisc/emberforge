import { SPELL_LEARN_COST_CURVE, ULTIMATE_LEARN_COST_FACTOR } from '../../content/balance/spells';
import { familyIdOf, findSpell, lowerRankOf, rankOf } from '../../content/spells';
import { interpolatePowerCurve } from '../../kernel/math';
import type { Hero } from '../../model/hero';
import type { SpellDefinition } from '../../model/spell';

export interface SpellProblem {
  key: string;
  params?: Record<string, string | number>;
}

export function learnCostCopper(spell: SpellDefinition): number {
  const kindFactor = spell.isUltimate ? ULTIMATE_LEARN_COST_FACTOR : 1;
  return Math.max(1, Math.round(interpolatePowerCurve(SPELL_LEARN_COST_CURVE, spell.unlockLevel) * kindFactor));
}

// The highest rank that the hero knows in the family of the spell. 0 when it knows none.
export function knownRankOf(hero: Hero, spell: SpellDefinition): number {
  return hero.learnedSpellIds.reduce((highest, id) => {
    const known = findSpell(id);
    return known && familyIdOf(known) === familyIdOf(spell) ? Math.max(highest, rankOf(known)) : highest;
  }, 0);
}

export function findLearnProblem(hero: Hero, spell: SpellDefinition): SpellProblem | null {
  if (spell.classId !== hero.classId) return { key: 'reject.spellWrongClass' };
  if (knownRankOf(hero, spell) >= rankOf(spell)) return { key: 'reject.spellAlreadyLearned' };
  if (hero.level < spell.unlockLevel) return { key: 'reject.spellLevelTooLow', params: { level: spell.unlockLevel } };
  if (rankOf(spell) > 1 && knownRankOf(hero, spell) < rankOf(spell) - 1) return { key: 'reject.spellNeedsLowerRank' };
  return null;
}

// A higher rank takes the place of the lower rank, in the same slot. A new spell takes the first free slot of its kind, so a hero fights with it at once.
export function learnSpell(hero: Hero, spell: SpellDefinition): Hero {
  const replacedId = lowerRankOf(spell)?.id;
  if (replacedId !== undefined && hero.learnedSpellIds.includes(replacedId)) {
    const replaceRank = (id: string | null): string | null => (id === replacedId ? spell.id : id);
    return {
      ...hero,
      learnedSpellIds: hero.learnedSpellIds.map((id) => replaceRank(id) as string),
      equippedSpellIds: hero.equippedSpellIds.map(replaceRank),
      equippedUltimateId: replaceRank(hero.equippedUltimateId),
    };
  }
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
