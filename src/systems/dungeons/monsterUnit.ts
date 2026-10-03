import {
  MONSTER_ATTACK,
  MONSTER_CRITICAL_CHANCE,
  MONSTER_DEFENCE,
  MONSTER_HP,
  MONSTER_RESISTANCE,
} from '../../content/balance/monsterScaling';
import { MONSTERS } from '../../content/monsters';
import { requireById } from '../../content/lookup';
import type { BattleUnit } from '../../model/battle';

function scaledAtLevel(scaling: { base: number; perLevel: number }, level: number): number {
  return scaling.base + scaling.perLevel * level;
}

export function createMonsterUnit(monsterId: string, level: number, unitId: string): BattleUnit {
  const definition = requireById(MONSTERS, monsterId);
  const maxHp = Math.round(scaledAtLevel(MONSTER_HP, level) * definition.hpFactor);
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
    attack: scaledAtLevel(MONSTER_ATTACK, level) * definition.attackFactor,
    attackKind: 'physical',
    defence: scaledAtLevel(MONSTER_DEFENCE, level) * definition.defenceFactor,
    resistance: scaledAtLevel(MONSTER_RESISTANCE, level) * definition.defenceFactor,
    speed: definition.speed,
    critChance: MONSTER_CRITICAL_CHANCE,
    behavior: 'fighter',
    resourceId: 'mana',
    maxResource: 0,
    resource: 0,
    spells: [],
  };
}
