import type { BattleSpell } from '../../../model/spell';
import { isSpellReadyAndPaid, spellCastDoesSomething } from '../spellCasting';
import type { FieldBattle } from './fieldBattle';
import type { RealtimeUnit } from './realtimeUnit';

// Heroes follow the slot cast order. Monsters keep their own spell choice.
export const followsSlotCastOrder = (unit: RealtimeUnit): boolean => unit.combatant.unit.side === 'party';

// The hero spells are in slot order 1, 2, 3, then the Ultimate (see heroToBattleUnit). The search starts at the slot after
// the last cast and goes round, so every slot gets its turn. A spell that is on cooldown, too expensive, out of reach or wasted is skipped.
export function nextSpellInSlotOrder(battle: FieldBattle, hero: RealtimeUnit, enemyTarget: RealtimeUnit, timeSeconds: number, isInReach: (spell: BattleSpell) => boolean): BattleSpell | null {
  if (!hero.castIsDue) return null;
  const { combatant } = hero;
  const spells = combatant.unit.spells;
  for (let step = 1; step <= spells.length; step++) {
    const spell = spells[(hero.lastCastSpellIndex + step) % spells.length];
    if (!spell || !isSpellReadyAndPaid(combatant, spell, timeSeconds)) continue;
    if (!spellCastDoesSomething(combatant, battle.combatants, timeSeconds, battle.random, spell, enemyTarget.combatant.unit) || !isInReach(spell)) continue;
    return spell;
  }
  return null;
}

// After a cast the next action is a basic attack. After a basic attack (or a Priest heal) the next action is a cast again, if a spell is ready.
export function recordSlotCast(hero: RealtimeUnit, spell: BattleSpell): void {
  hero.castIsDue = false;
  hero.lastCastSpellIndex = hero.combatant.unit.spells.indexOf(spell);
}

export function recordBasicAction(unit: RealtimeUnit): void {
  unit.castIsDue = true;
}
