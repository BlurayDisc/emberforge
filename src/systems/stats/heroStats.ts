import {
  ACTION_THRESHOLD,
  CRITICAL_CHANCE_PER_SKILL_POINT,
  CRITICAL_DAMAGE_MULTIPLIER,
  MAXIMUM_CRITICAL_CHANCE,
  MAXIMUM_DAMAGE_CUT,
  MITIGATION_BASE,
  MITIGATION_PER_ATTACKER_LEVEL,
} from '../../content/balance/battle';
import { CLASSES, type ClassDefinition } from '../../content/classes';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import { findSpell } from '../../content/spells';
import type { AttackKind, BattleUnit } from '../../model/battle';
import type { Hero } from '../../model/hero';
import type { AffixStat } from '../../model/item';
import type { HeroSheet } from '../../model/heroSheet';
import type { StatBlock } from '../../model/statBlock';
import { maximumResourceOf, startingResourceOf } from './maximumResource';

function statAtLevel(base: number, growthPerLevel: number, level: number): number {
  return Math.round(base + growthPerLevel * (level - 1));
}

const STAT_NAMES: readonly (keyof StatBlock)[] = ['hp', 'strength', 'magic', 'skill', 'speed', 'defence', 'resistance'];

const FRACTION_PER_PERCENT_POINT = 0.01;

function affixBonusForStat(hero: Hero, stat: AffixStat): number {
  return Object.values(hero.equipment).reduce(
    (total, item) => total + item.affixes.reduce((sum, affix) => (affix.stat === stat ? sum + affix.value : sum), 0),
    0,
  );
}

function gearBonusForStat(hero: Hero, stat: keyof StatBlock): number {
  return Object.values(hero.equipment).reduce((total, item) => {
    const fromBase = item.baseStats[stat] ?? 0;
    const fromAffixes = item.affixes.reduce((sum, affix) => (affix.stat === stat ? sum + affix.value : sum), 0);
    const setBonus = MATERIALS.find((material) => material.id === item.materialId)?.setBonus;
    const fromSetMaterial = setBonus?.stat === stat ? setBonus.value : 0;
    return total + fromBase + fromAffixes + fromSetMaterial;
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

// The primary attribute of the class gives the damage of its attack kind. The other kind uses the plain attribute.
function damageAttribute(classDefinition: ClassDefinition, attackKind: AttackKind, stats: StatBlock): number {
  if (classDefinition.attackKind === attackKind) return stats[classDefinition.primaryAttribute];
  return attackKind === 'magic' ? stats.magic : stats.strength;
}

// Damage is the attribute plus the weapon damage. The class resource (mana, stamina, hatred or rage) pays for spells.
function criticalChanceOf(stats: StatBlock, hero: Hero): number {
  const fromAffixes = affixBonusForStat(hero, 'criticalChance') * FRACTION_PER_PERCENT_POINT;
  return Math.min(MAXIMUM_CRITICAL_CHANCE, stats.skill * CRITICAL_CHANCE_PER_SKILL_POINT + fromAffixes);
}

function criticalDamageMultiplierOf(hero: Hero): number {
  return CRITICAL_DAMAGE_MULTIPLIER + affixBonusForStat(hero, 'criticalDamage') * FRACTION_PER_PERCENT_POINT;
}

function lifeStealOf(hero: Hero): number {
  return affixBonusForStat(hero, 'lifeSteal') * FRACTION_PER_PERCENT_POINT;
}

function toPercentPoints(fraction: number): number {
  return Math.round(fraction / FRACTION_PER_PERCENT_POINT * 10) / 10;
}

export function computeHeroSheet(hero: Hero): HeroSheet {
  const stats = computeHeroStats(hero);
  const classDefinition = requireById(CLASSES, hero.classId);
  return {
    health: stats.hp,
    resource: maximumResourceOf(classDefinition.resourceId, stats, hero.level),
    physicalDamage: damageAttribute(classDefinition, 'physical', stats) + gearDamage(hero, 'physicalDamage'),
    magicalDamage: damageAttribute(classDefinition, 'magic', stats) + gearDamage(hero, 'magicalDamage'),
    armour: stats.defence,
    resistance: stats.resistance,
    speed: stats.speed,
    strength: stats.strength,
    skill: stats.skill,
    magic: stats.magic,
    criticalChance: toPercentPoints(criticalChanceOf(stats, hero)),
    criticalDamage: toPercentPoints(criticalDamageMultiplierOf(hero)),
    lifeSteal: toPercentPoints(lifeStealOf(hero)),
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
    critChance: criticalChanceOf(stats, hero),
    damageVarianceFraction: classDefinition.damageVarianceFraction,
    criticalDamageMultiplier: criticalDamageMultiplierOf(hero),
    mainAttribute: classDefinition.primaryAttribute,
    mainAttributeValue: stats[classDefinition.primaryAttribute],
    skill: stats.skill,
    lifeSteal: lifeStealOf(hero),
    behavior: classDefinition.behavior,
    resourceId: classDefinition.resourceId,
    maxResource: sheet.resource,
    resource: startingResourceOf(classDefinition.resourceId, sheet.resource),
    // The ultimate comes first, so the AI tries it before the normal slots.
    spells: [hero.equippedUltimateId, ...hero.equippedSpellIds].flatMap((id) => (id === null ? [] : (findSpell(id) ?? []))),
  };
}

export function computeHeroPower(hero: Hero): number {
  const unit = heroToBattleUnit({ ...hero, healthFraction: 1 });
  const reduction = Math.min(MAXIMUM_DAMAGE_CUT, unit.defence / (unit.defence + MITIGATION_BASE + MITIGATION_PER_ATTACKER_LEVEL * unit.level));
  const offence = unit.attack * (unit.speed / ACTION_THRESHOLD) * (1 + unit.critChance * (unit.criticalDamageMultiplier - 1));
  const durability = unit.maxHp / (1 - reduction);
  return Math.round(Math.sqrt(offence * durability));
}
