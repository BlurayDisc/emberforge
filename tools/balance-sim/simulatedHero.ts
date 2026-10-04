import { NORMAL_SPELL_SLOT_COUNT } from '../../src/content/balance/spells';
import { spellsOfClass } from '../../src/content/spells';
import type { ClassId, Hero } from '../../src/model/hero';
import { equipSpell, learnSpell } from '../../src/systems/spells';

export function createSimulatedHero(classId: ClassId, level: number, index: number): Hero {
  return { id: `hero-${index}`, name: classId, classId, level, experience: 0, healthFraction: 1, healthAsOfMs: 0, downedUntilMs: null, equipment: {}, learnedSpellIds: [], equippedSpellIds: Array.from({ length: NORMAL_SPELL_SLOT_COUNT }, () => null), equippedUltimateId: null, statistics: { monstersDefeated: 0, damageDealt: 0, damageTaken: 0, healingDone: 0, secondsFought: 0, battlesWon: 0, battlesLost: 0 } };
}

// First spells: the hero keeps the spells that were learned first, as when the player never changes the slots.
// Best spells: the hero equips the highest level spells it can use and its highest ultimate.
export function learnSpellsFor(hero: Hero, equipBestSpells: boolean): Hero {
  const available = spellsOfClass(hero.classId).filter((spell) => spell.unlockLevel <= hero.level);
  const learned = available.reduce(learnSpell, hero);
  if (!equipBestSpells) return learned;
  const bestNormal = available.filter((spell) => !spell.isUltimate).slice(-NORMAL_SPELL_SLOT_COUNT);
  const bestUltimate = available.filter((spell) => spell.isUltimate).slice(-1);
  return [...bestNormal, ...bestUltimate].reduce((equipped, spell, index) => equipSpell(equipped, spell, index), learned);
}
