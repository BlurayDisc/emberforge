import { spellsOfClass } from '../../content/spells';
import type { GameState } from '../../model/gameState';
import type { SpellDefinition } from '../../model/spell';
import { familyIdOf, rankOf } from '../../content/spells';
import { findLearnProblem, isSpellEquipped, knownRankOf, learnCostCopper, type SpellProblem } from '../../systems/spells';

export interface SpellOffer {
  spell: SpellDefinition;
  costCopper: number;
  isLearned: boolean;
  isEquipped: boolean;
  isAffordable: boolean;
  // False while the hero is below the spell's level. The Academy hides such spells.
  isInReach: boolean;
  // Why the hero cannot learn the spell now. Null when the hero can.
  problem: SpellProblem | null;
}

// Every spell of the hero's class, from the lowest level, with what stops the hero from learning it.
export function listSpellOffers(state: GameState, heroId: string): SpellOffer[] {
  const hero = state.company.find((candidate) => candidate.id === heroId);
  if (!hero) return [];
  const classSpells = spellsOfClass(hero.classId);
  return classSpells.map((spell) => ({
    spell,
    costCopper: learnCostCopper(spell),
    isLearned: knownRankOf(hero, spell) >= rankOf(spell),
    isEquipped: classSpells.some((candidate) => familyIdOf(candidate) === familyIdOf(spell) && rankOf(candidate) >= rankOf(spell) && isSpellEquipped(hero, candidate.id)),
    isAffordable: state.copper >= learnCostCopper(spell),
    isInReach: hero.level >= spell.unlockLevel,
    problem: findLearnProblem(hero, spell),
  }));
}
