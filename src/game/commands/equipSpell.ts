import { NORMAL_SPELL_SLOT_COUNT } from '../../content/balance/spells';
import { findSpell } from '../../content/spells';
import { equipSpell, unequipSpell } from '../../systems/spells';
import { CommandRejected, type Command } from '../gameStore';
import { replaceHero, requireEditableHero } from './editableHero';

export function equipSpellCommand(heroId: string, spellId: string, slotIndex: number): Command {
  return (state) => {
    const hero = requireEditableHero(state, heroId, 'reject.stopRunBeforeSpellChange');
    const spell = findSpell(spellId);
    if (!spell || !hero.learnedSpellIds.includes(spellId)) throw new CommandRejected('reject.spellNotLearned');
    if (!spell.isUltimate && !(slotIndex >= 0 && slotIndex < NORMAL_SPELL_SLOT_COUNT)) throw new CommandRejected('reject.spellUnknown');
    return { ...state, company: replaceHero(state, equipSpell(hero, spell, slotIndex)) };
  };
}

export function unequipSpellCommand(heroId: string, spellId: string): Command {
  return (state) => {
    const hero = requireEditableHero(state, heroId, 'reject.stopRunBeforeSpellChange');
    return { ...state, company: replaceHero(state, unequipSpell(hero, spellId)) };
  };
}
