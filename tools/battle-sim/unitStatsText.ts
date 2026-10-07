import { BASE_MOVEMENT_SPEED, CLASS_MOVEMENT_PROFILES, DEFAULT_MOVEMENT_PROFILE, FIELD_LENGTH, MONSTER_MOVEMENT_PROFILES, MONSTER_RANK_MOVEMENT_PROFILES } from '../../src/content/balance/battlefield';
import type { BattleUnit } from '../../src/model/battle';
import { spellName } from '../../src/ui/spellText';
import { say } from './battleSimTexts';

function movementProfileOf(unit: BattleUnit) {
  if (unit.rank === 'hero') return CLASS_MOVEMENT_PROFILES[unit.definitionId] ?? DEFAULT_MOVEMENT_PROFILE;
  return MONSTER_MOVEMENT_PROFILES[unit.definitionId] ?? MONSTER_RANK_MOVEMENT_PROFILES[unit.rank] ?? DEFAULT_MOVEMENT_PROFILE;
}

const oneDecimal = (value: number): string => (Math.round(value * 10) / 10).toString();

// The real numbers of one unit as the simulator reads them: the attack time already has the attack speed bonus in it.
export function describeUnitStats(unit: BattleUnit): [string, string][] {
  const profile = movementProfileOf(unit);
  const attackSeconds = unit.baseAttackSeconds / Math.max(0.1, 1 + unit.attackSpeedBonus);
  const rows: [string, string][] = [
    [say('hp'), String(unit.maxHp)],
    [say('damage'), `${unit.attack} (${unit.attackKind})`],
    [unit.rank === 'hero' ? say('defence') : say('armour'), String(unit.defence)],
    [say('resistance'), String(unit.resistance)],
    [say('attackTime'), `${oneDecimal(attackSeconds)} ${say('seconds')}`],
    [say('crit'), `${Math.round(unit.critChance * 100)}% x${oneDecimal(unit.criticalDamageMultiplier)}`],
    [say('moveSpeed'), oneDecimal(BASE_MOVEMENT_SPEED * profile.movementSpeedFactor)],
    [say('range'), profile.rangeFieldFraction > 0 ? oneDecimal(profile.rangeFieldFraction * FIELD_LENGTH) : say('melee')],
  ];
  if (unit.spells.length > 0) rows.push([say('spells'), unit.spells.map((spell) => spellName(spell.id)).join(', ')]);
  return rows;
}
