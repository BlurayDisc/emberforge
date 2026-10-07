import { resolveSpellCast } from '../spellCasting';
import { resolveBasicAttack, resolveBasicHeal } from './basicStrike';
import { findUnit, type FieldBattle } from './fieldBattle';
import { isAlive, type RealtimeUnit } from './realtimeUnit';
import { isDue } from './tickClock';

// The hit of an attack or the effect of a cast lands when its time is due. A unit that died before that casts and hits nothing.
// The unit already paid for a cast when it began, so a target that died in the meantime wastes the spell.
export function resolveDueAction(battle: FieldBattle, unit: RealtimeUnit, timeSeconds: number): void {
  const pending = unit.pending;
  if (!pending || !isAlive(unit)) return;
  const dueAtSeconds = pending.kind === 'cast' ? pending.effectAtSeconds : pending.hitAtSeconds;
  if (!isDue(dueAtSeconds, timeSeconds)) return;
  unit.pending = null;
  if (pending.kind === 'cast') {
    const focusTarget = findUnit(battle, pending.targetId);
    battle.events.push(...resolveSpellCast(unit.combatant, battle.combatants, pending.spell, pending.resourceCost, timeSeconds, battle.random, focusTarget?.combatant.unit));
    return;
  }
  const struck = findUnit(battle, pending.targetId);
  if (!struck || !isAlive(struck)) return;
  battle.events.push(...(pending.kind === 'heal' ? resolveBasicHeal(unit.combatant, struck.combatant, timeSeconds) : resolveBasicAttack(unit.combatant, struck.combatant, timeSeconds, battle.random)));
}
