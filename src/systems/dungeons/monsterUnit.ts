import { BASE_CRITICAL_CHANCE, CRITICAL_DAMAGE_MULTIPLIER, MONSTER_DAMAGE_VARIANCE_FRACTION } from '../../content/balance/battle';
import { DEFAULT_MONSTER_ATTACK_SECONDS, monsterStatsAtLevel } from '../../content/balance/monsterScaling';
import { MONSTER_SPELLS } from '../../content/monsterSpells';
import { MONSTERS, type FlatMonsterStats } from '../../content/monsters';
import { requireById } from '../../content/lookup';
import type { BattleUnit } from '../../model/battle';

function liftedCurveStats(level: number, statFactor: number): Omit<FlatMonsterStats, 'attackSeconds'> {
  const curve = monsterStatsAtLevel(level);
  return { hp: curve.hp * statFactor, damage: curve.damage * statFactor, armour: curve.armour * statFactor, resistance: curve.resistance * statFactor };
}

export function createMonsterUnit(monsterId: string, level: number, unitId: string): BattleUnit {
  const definition = requireById(MONSTERS, monsterId);
  const flatStats = definition.flatStats ?? liftedCurveStats(level, definition.statFactor ?? 1);
  const maxHp = Math.round(flatStats.hp);
  return {
    id: unitId,
    definitionId: definition.id,
    name: definition.name,
    side: 'enemy',
    rank: definition.rank,
    spriteKey: definition.spriteKey,
    level,
    maxHp,
    hp: maxHp,
    attack: Math.round(flatStats.damage),
    attackKind: 'physical',
    defence: Math.round(flatStats.armour),
    resistance: Math.round(flatStats.resistance),
    baseAttackSeconds: definition.flatStats?.attackSeconds ?? definition.attackSeconds ?? DEFAULT_MONSTER_ATTACK_SECONDS,
    attackSpeedBonus: 0,
    critChance: BASE_CRITICAL_CHANCE,
    damageVarianceFraction: MONSTER_DAMAGE_VARIANCE_FRACTION,
    mainAttributeValue: 0,
    criticalDamageMultiplier: CRITICAL_DAMAGE_MULTIPLIER,
    lifeSteal: 0,
    behavior: 'fighter',
    armourPenetration: definition.armourPenetration,
    resourceId: 'mana',
    maxResource: 0,
    resource: 0,
    spells: (definition.spellIds ?? []).flatMap((spellId) => MONSTER_SPELLS.find((spell) => spell.id === spellId) ?? []),
  };
}
