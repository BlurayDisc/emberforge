import { spellsOfClass } from '../../content/spells';
import type { GameState } from '../../model/gameState';
import type { SpellDefinition } from '../../model/spell';
import { findLearnProblem, isSpellEquipped, learnCostCopper, type SpellProblem } from '../../systems/spells';

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
  return spellsOfClass(hero.classId).map((spell) => ({
    spell,
    costCopper: learnCostCopper(spell),
    isLearned: hero.learnedSpellIds.includes(spell.id),
    isEquipped: isSpellEquipped(hero, spell.id),
    isAffordable: state.copper >= learnCostCopper(spell),
    isInReach: hero.level >= spell.unlockLevel,
    problem: findLearnProblem(hero, spell),
  }));
}
