import { FIELD_LENGTH, SPELL_RANGE_FIELD_FRACTIONS } from '../../../content/balance/battlefield';
import type { BattleSpell, SpellEffect } from '../../../model/spell';
import type { RealtimeUnit } from './realtimeUnit';

// Self and ally spells and shields need no enemy in range.
export function spellNeedsEnemyInRange(effect: SpellEffect): boolean {
  if (effect.kind === 'damage' || effect.kind === 'drain') return true;
  return effect.kind === 'status' && (effect.target === 'enemy' || effect.target === 'allEnemies');
}

// A buff or a shield on the caster or its allies. It waits for the enemy to come near, so the caster walks with the rest at the start of the fight.
export function isPreparationSpell(effect: SpellEffect): boolean {
  return effect.kind === 'shield' || (effect.kind === 'status' && !spellNeedsEnemyInRange(effect));
}

// A spell reaches as far as the attack of the unit, unless the data lists a range for the spell.
export function spellReachOf(caster: RealtimeUnit, spell: BattleSpell): number {
  const listedFraction = SPELL_RANGE_FIELD_FRACTIONS[spell.id];
  return listedFraction === undefined ? caster.attackReach : listedFraction * FIELD_LENGTH;
}
