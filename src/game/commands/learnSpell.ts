import { findSpell } from '../../content/spells';
import { findLearnProblem, learnCostCopper, learnSpell } from '../../systems/spells';
import { CommandRejected, type Command } from '../gameStore';
import { replaceHero, requireEditableHero } from './editableHero';

export function learnSpellCommand(heroId: string, spellId: string): Command {
  return (state) => {
    const hero = requireEditableHero(state, heroId, 'reject.stopRunBeforeSpellChange');
    const spell = findSpell(spellId);
    if (!spell) throw new CommandRejected('reject.spellUnknown');
    const problem = findLearnProblem(hero, spell);
    if (problem) throw new CommandRejected(problem.key, problem.params);
    const cost = learnCostCopper(spell);
    if (state.copper < cost) throw new CommandRejected('reject.notEnoughMoney');
    return { ...state, copper: state.copper - cost, company: replaceHero(state, learnSpell(hero, spell)) };
  };
}
