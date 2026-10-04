import {
  MONSTER_ATTACK,
  MONSTER_CRITICAL_CHANCE,
  MONSTER_DEFENCE,
  MONSTER_HP,
  MONSTER_RESISTANCE,
} from '../../content/balance/monsterScaling';
import { MONSTER_SPELLS } from '../../content/monsterSpells';
import { MONSTERS, type MonsterDefinition } from '../../content/monsters';
import { requireById } from '../../content/lookup';
import type { BattleUnit } from '../../model/battle';

// The exponent bends the curve: above 1 it climbs faster with each level, below 1 it flattens.
function scaledAtLevel(scaling: { base: number; perLevel: number; exponent?: number }, level: number): number {
  return scaling.base + scaling.perLevel * level ** (scaling.exponent ?? 1);
}

interface MonsterStats {
  hp: number;
  attack: number;
  defence: number;
  resistance: number;
}

// A boss uses its own numbers as they are. A normal or rare monster follows the level curve.
function statsOf(definition: MonsterDefinition, level: number): MonsterStats {
  if (definition.fixedStats) return definition.fixedStats;
  return {
    hp: scaledAtLevel(MONSTER_HP, level) * (definition.hpFactor ?? 1),
    attack: scaledAtLevel(MONSTER_ATTACK, level) * (definition.attackFactor ?? 1),
    defence: scaledAtLevel(MONSTER_DEFENCE, level) * (definition.defenceFactor ?? 1),
    resistance: scaledAtLevel(MONSTER_RESISTANCE, level) * (definition.defenceFactor ?? 1),
  };
}

export function createMonsterUnit(monsterId: string, level: number, unitId: string): BattleUnit {
  const definition = requireById(MONSTERS, monsterId);
  const stats = statsOf(definition, level);
  const maxHp = Math.round(stats.hp);
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
    attack: stats.attack,
    attackKind: 'physical',
    defence: stats.defence,
    resistance: stats.resistance,
    speed: definition.speed,
    critChance: MONSTER_CRITICAL_CHANCE,
    behavior: 'fighter',
    resourceId: 'mana',
    maxResource: 0,
    resource: 0,
    spells: (definition.spellIds ?? []).flatMap((spellId) => MONSTER_SPELLS.find((spell) => spell.id === spellId) ?? []),
  };
}
