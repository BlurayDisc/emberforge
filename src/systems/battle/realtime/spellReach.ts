import { FIELD_LENGTH, SPELL_RANGE_FIELD_FRACTIONS } from '../../../content/balance/battlefield';
import type { BattleSpell, SpellEffect } from '../../../model/spell';
import type { RealtimeUnit } from './realtimeUnit';

// Self and ally spells and shields need no enemy in range.
export function spellNeedsEnemyInRange(effect: SpellEffect): boolean {
  if (effect.kind === 'damage' || effect.kind === 'drain') return true;
  return effect.kind === 'status' && (effect.target === 'enemy' || effect.target === 'allEnemies');
}

// A spell reaches as far as the attack of the unit, unless the data lists a range for the spell.
export function spellReachOf(caster: RealtimeUnit, spell: BattleSpell): number {
  const listedFraction = SPELL_RANGE_FIELD_FRACTIONS[spell.id];
  return listedFraction === undefined ? caster.attackReach : listedFraction * FIELD_LENGTH;
}
