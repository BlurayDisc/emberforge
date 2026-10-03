import {
  ACTION_THRESHOLD,
  CRITICAL_CHANCE_PER_SKILL_POINT,
  CRITICAL_DAMAGE_MULTIPLIER,
  MAXIMUM_CRITICAL_CHANCE,
  MITIGATION_BASE,
  MITIGATION_PER_ATTACKER_LEVEL,
} from '../../content/balance/battle';
import { MANA_BASE, MANA_PER_MAGIC } from '../../content/balance/heroSheet';
import { CLASSES } from '../../content/classes';
import { requireById } from '../../content/lookup';
import type { BattleUnit } from '../../model/battle';
import type { Hero } from '../../model/hero';
import type { HeroSheet } from '../../model/heroSheet';
import type { StatBlock } from '../../model/statBlock';

function statAtLevel(base: number, growthPerLevel: number, level: number): number {
  return Math.round(base + growthPerLevel * (level - 1));
}

const STAT_NAMES: readonly (keyof StatBlock)[] = ['hp', 'strength', 'magic', 'skill', 'speed', 'defence', 'resistance'];

function gearBonusForStat(hero: Hero, stat: keyof StatBlock): number {
  return Object.values(hero.equipment).reduce((total, item) => {
    const fromBase = item.baseStats[stat] ?? 0;
    const fromAffixes = item.affixes.reduce((sum, affix) => (affix.stat === stat ? sum + affix.value : sum), 0);
    return total + fromBase + fromAffixes;
  }, 0);
}

export function computeHeroStats(hero: Hero): StatBlock {
  const { baseStats, growthPerLevel } = requireById(CLASSES, hero.classId);
  const stats = {} as StatBlock;
  for (const stat of STAT_NAMES) {
    stats[stat] = statAtLevel(baseStats[stat], growthPerLevel[stat], hero.level) + gearBonusForStat(hero, stat);
  }
  return stats;
}

function gearDamage(hero: Hero, damageKey: 'physicalDamage' | 'magicalDamage'): number {
  return Object.values(hero.equipment).reduce((total, item) => total + (item.baseStats[damageKey] ?? 0), 0);
}

// Damage is the attribute plus the weapon damage. Mana is shown only: no skill spends it yet.
export function computeHeroSheet(hero: Hero): HeroSheet {
  const stats = computeHeroStats(hero);
  return {
    health: stats.hp,
    mana: MANA_BASE + MANA_PER_MAGIC * stats.magic,
    physicalDamage: stats.strength + gearDamage(hero, 'physicalDamage'),
    magicalDamage: stats.magic + gearDamage(hero, 'magicalDamage'),
    armour: stats.defence,
    resistance: stats.resistance,
    speed: stats.speed,
    strength: stats.strength,
    skill: stats.skill,
    magic: stats.magic,
  };
}

export function heroToBattleUnit(hero: Hero): BattleUnit {
  const classDefinition = requireById(CLASSES, hero.classId);
  const stats = computeHeroStats(hero);
  const sheet = computeHeroSheet(hero);
  return {
    id: hero.id,
    definitionId: hero.classId,
    name: hero.name,
    side: 'party',
    rank: 'hero',
    spriteKey: classDefinition.spriteKey,
    level: hero.level,
    maxHp: stats.hp,
    hp: Math.max(1, Math.round(stats.hp * hero.healthFraction)),
    attack: classDefinition.attackKind === 'magic' ? sheet.magicalDamage : sheet.physicalDamage,
    attackKind: classDefinition.attackKind,
    defence: stats.defence,
    resistance: stats.resistance,
    speed: stats.speed,
    critChance: Math.min(MAXIMUM_CRITICAL_CHANCE, stats.skill * CRITICAL_CHANCE_PER_SKILL_POINT),
    behavior: classDefinition.behavior,
  };
}

export function computeHeroPower(hero: Hero): number {
  const unit = heroToBattleUnit({ ...hero, healthFraction: 1 });
  const reduction = unit.defence / (unit.defence + MITIGATION_BASE + MITIGATION_PER_ATTACKER_LEVEL * unit.level);
  const offence = unit.attack * (unit.speed / ACTION_THRESHOLD) * (1 + unit.critChance * (CRITICAL_DAMAGE_MULTIPLIER - 1));
  const durability = unit.maxHp / (1 - reduction);
  return Math.round(Math.sqrt(offence * durability));
}
