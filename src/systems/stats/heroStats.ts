import {
  BASE_CRITICAL_CHANCE,
  CRITICAL_DAMAGE_MULTIPLIER,
  MAXIMUM_CRITICAL_CHANCE,
  MINIMUM_ATTACK_SPEED_FACTOR,
} from '../../content/balance/battle';
import { ATTACK_SPEED_BONUS_PER_AGILITY } from '../../content/balance/heroStats';
import { CLASSES, type ClassDefinition } from '../../content/classes';
import { requireById } from '../../content/lookup';
import { findSpell } from '../../content/spells';
import type { AttackKind, BattleUnit } from '../../model/battle';
import type { Hero } from '../../model/hero';
import type { HeroSheet } from '../../model/heroSheet';
import type { StatBlock } from '../../model/statBlock';
import { attributesAtLevel, statsFromAttributes } from './classStatsAtLevel';
import { gearBonusForStat, gearDamage } from './gearBonuses';
import { maximumResourceOf, startingResourceOf } from './maximumResource';

const FRACTION_PER_PERCENT_POINT = 0.01;

// Attributes come from the class level and the gear. HP and Resistance follow the attributes, then gear adds its flat values.
export function computeHeroStats(hero: Hero): StatBlock {
  const classDefinition = requireById(CLASSES, hero.classId);
  const attributes = attributesAtLevel(classDefinition, hero.level);
  attributes.strength += gearBonusForStat(hero, 'strength');
  attributes.agility += gearBonusForStat(hero, 'agility');
  attributes.intelligence += gearBonusForStat(hero, 'intelligence');
  const stats = statsFromAttributes(classDefinition, attributes);
  stats.hp += gearBonusForStat(hero, 'hp');
  stats.defence += gearBonusForStat(hero, 'defence');
  stats.resistance += gearBonusForStat(hero, 'resistance');
  return stats;
}

// The primary attribute of the class gives the damage of its attack kind. The other kind uses the plain attribute: Strength for physical, Intelligence for magic.
function damageAttribute(classDefinition: ClassDefinition, attackKind: AttackKind, stats: StatBlock): number {
  if (classDefinition.attackKind === attackKind) return stats[classDefinition.primaryAttribute];
  return attackKind === 'magic' ? stats.intelligence : stats.strength;
}

function criticalChanceOf(classDefinition: ClassDefinition, hero: Hero): number {
  const fromGear = gearBonusForStat(hero, 'criticalChance') * FRACTION_PER_PERCENT_POINT;
  return Math.min(MAXIMUM_CRITICAL_CHANCE, BASE_CRITICAL_CHANCE + classDefinition.criticalChanceBonus + fromGear);
}

function criticalDamageMultiplierOf(hero: Hero): number {
  return CRITICAL_DAMAGE_MULTIPLIER + gearBonusForStat(hero, 'criticalDamage') * FRACTION_PER_PERCENT_POINT;
}

function lifeStealOf(hero: Hero): number {
  return gearBonusForStat(hero, 'lifeSteal') * FRACTION_PER_PERCENT_POINT;
}

// Agility and gear share one pool with Haste and Slow in battle.
function attackSpeedBonusOf(stats: StatBlock, hero: Hero): number {
  return stats.agility * ATTACK_SPEED_BONUS_PER_AGILITY + gearBonusForStat(hero, 'attackSpeed') * FRACTION_PER_PERCENT_POINT;
}

function attackSecondsOf(classDefinition: ClassDefinition, attackSpeedBonus: number): number {
  return classDefinition.baseAttackSeconds / Math.max(MINIMUM_ATTACK_SPEED_FACTOR, 1 + attackSpeedBonus);
}

function toPercentPoints(fraction: number): number {
  return Math.round(fraction / FRACTION_PER_PERCENT_POINT * 10) / 10;
}

export function computeHeroSheet(hero: Hero): HeroSheet {
  const stats = computeHeroStats(hero);
  const classDefinition = requireById(CLASSES, hero.classId);
  return {
    health: stats.hp,
    resource: maximumResourceOf(classDefinition.resourceId),
    physicalDamage: Math.round(classDefinition.baseDamage + damageAttribute(classDefinition, 'physical', stats) + gearDamage(hero, 'physicalDamage')),
    magicalDamage: Math.round(classDefinition.baseDamage + damageAttribute(classDefinition, 'magic', stats) + gearDamage(hero, 'magicalDamage')),
    armour: stats.defence,
    resistance: stats.resistance,
    attackSeconds: Math.round(attackSecondsOf(classDefinition, attackSpeedBonusOf(stats, hero)) * 100) / 100,
    strength: stats.strength,
    agility: stats.agility,
    intelligence: stats.intelligence,
    criticalChance: toPercentPoints(criticalChanceOf(classDefinition, hero)),
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
    baseAttackSeconds: classDefinition.baseAttackSeconds,
    attackSpeedBonus: attackSpeedBonusOf(stats, hero),
    critChance: criticalChanceOf(classDefinition, hero),
    damageVarianceFraction: classDefinition.damageVarianceFraction,
    criticalDamageMultiplier: criticalDamageMultiplierOf(hero),
    mainAttributeValue: stats[classDefinition.primaryAttribute],
    lifeSteal: lifeStealOf(hero),
    behavior: classDefinition.behavior,
    resourceId: classDefinition.resourceId,
    maxResource: sheet.resource,
    resource: startingResourceOf(classDefinition.resourceId, sheet.resource),
    // The ultimate comes first, so the AI tries it before the normal slots.
    spells: [hero.equippedUltimateId, ...hero.equippedSpellIds].flatMap((id) => (id === null ? [] : (findSpell(id) ?? []))),
  };
}
