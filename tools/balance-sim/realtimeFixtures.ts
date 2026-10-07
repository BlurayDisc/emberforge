import type { Random } from '../../src/kernel/random';
import type { BattleUnit } from '../../src/model/battle';
import type { ClassId } from '../../src/model/hero';
import { createMonsterUnit } from '../../src/systems/dungeons';
import { heroToBattleUnit } from '../../src/systems/stats';
import { dungeonForLevel } from './economy';
import { equipBestGear, type GearRule } from './scenarios/bestEquippableGear';
import { createSimulatedHero, learnSpellsFor } from './simulatedHero';

const ALL_GEAR_SLOTS = ['mainHand', 'offHand', 'helm', 'armour', 'gloves', 'legs', 'boots', 'belt', 'amulet', 'ring'] as const;

// The first fight of the balance tool: the main hand only at level 1, then Common gear in every slot, and the best spells.
export function commonGearHeroUnit(classId: ClassId, level: number, random: Random, index = 0): BattleUnit {
  const gearRule: GearRule = { slots: level <= 1 ? ['mainHand'] : ALL_GEAR_SLOTS, quality: 'common' };
  const hero = createSimulatedHero(classId, level, index);
  return heroToBattleUnit(learnSpellsFor(equipBestGear(hero, random.fork(`gear-${index}`), null, gearRule), true));
}

export function normalMonsterUnit(level: number, unitId: string, monsterIndex = 0): BattleUnit {
  const dungeon = dungeonForLevel(level);
  return createMonsterUnit(dungeon.monsterIds[monsterIndex % dungeon.monsterIds.length]!, level, unitId);
}
