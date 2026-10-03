import spellsData from '../../data/spells.json';
import type { ClassId } from '../model/hero';
import type { SpellDefinition } from '../model/spell';

export const SPELLS = spellsData as unknown as readonly SpellDefinition[];

export function findSpell(spellId: string): SpellDefinition | undefined {
  return SPELLS.find((spell) => spell.id === spellId);
}

export function spellsOfClass(classId: ClassId): SpellDefinition[] {
  return SPELLS.filter((spell) => spell.classId === classId).sort((first, second) => first.unlockLevel - second.unlockLevel);
}
