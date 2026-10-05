import spellsData from '../../data/spells.json';
import type { ClassId } from '../model/hero';
import type { SpellDefinition } from '../model/spell';

export const SPELLS = (spellsData as unknown as readonly SpellDefinition[]).filter((spell) => spell.reservedFor === undefined);

export function findSpell(spellId: string): SpellDefinition | undefined {
  return SPELLS.find((spell) => spell.id === spellId);
}

export const familyIdOf = (spell: SpellDefinition): string => spell.familyId ?? spell.id;
export const rankOf = (spell: SpellDefinition): number => spell.rank ?? 1;

export function lowerRankOf(spell: SpellDefinition): SpellDefinition | undefined {
  return rankOf(spell) === 1 ? undefined : SPELLS.find((candidate) => familyIdOf(candidate) === familyIdOf(spell) && rankOf(candidate) === rankOf(spell) - 1);
}

export function spellsOfClass(classId: ClassId): SpellDefinition[] {
  return SPELLS.filter((spell) => spell.classId === classId).sort((first, second) => first.unlockLevel - second.unlockLevel);
}
