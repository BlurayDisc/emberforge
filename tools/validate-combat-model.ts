import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { monsterStatsAtLevel } from '../src/content/balance/monsterScaling';

const dataDirectory = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'data');
const ATTRIBUTES = ['strength', 'agility', 'intelligence'];
const MAXIMUM_ATTRIBUTE_TOTAL_SPREAD = 0.15;
const MAXIMUM_BOSS_FACTOR_SPREAD = 0.15;

interface AttributeGrowth {
  start: number;
  gainPerLevel: number;
}

interface CombatClass {
  id: string;
  attackKind: string;
  primaryAttribute: string;
  balanceStatus: string;
  attributes: Record<string, AttributeGrowth>;
  baseHp: number;
  baseDamage: number;
  baseDefence: number;
  baseResistance: number;
  baseAttackSeconds: number;
  criticalChanceBonus: number;
}

interface CombatMonster {
  id: string;
  rank: string;
  statFactor?: number;
  attackSeconds?: number;
  flatStats?: { hp: number; damage: number; armour: number; resistance: number; attackSeconds: number };
}

function load<Content>(file: string): Content {
  return JSON.parse(readFileSync(join(dataDirectory, file), 'utf8')) as Content;
}

function checkClass(heroClass: CombatClass, report: (message: string) => void): void {
  const where = `classes.json: '${heroClass.id}'`;
  if (!['baseline', 'placeholder'].includes(heroClass.balanceStatus)) report(`${where} balanceStatus must be baseline or placeholder`);
  for (const attribute of ATTRIBUTES) {
    const growth = heroClass.attributes?.[attribute];
    if (!growth || !(growth.start > 0) || !(growth.gainPerLevel >= 0)) report(`${where} needs a start above 0 and a gainPerLevel of 0 or more for ${attribute}`);
  }
  if (!ATTRIBUTES.includes(heroClass.primaryAttribute)) report(`${where} has an unknown primaryAttribute '${heroClass.primaryAttribute}'`);
  if (heroClass.attackKind === 'magic' && heroClass.primaryAttribute !== 'intelligence') report(`${where} attacks with magic, so its primaryAttribute must be intelligence`);
  if (heroClass.attackKind === 'physical' && heroClass.primaryAttribute === 'intelligence') report(`${where} attacks with physical damage, so its primaryAttribute must be strength or agility`);
  if (!(heroClass.baseHp > 0 && heroClass.baseDamage > 0 && heroClass.baseDefence >= 0 && heroClass.baseResistance >= 0)) report(`${where} needs a base HP and damage above 0, and base Defence and Resistance of 0 or more`);
  if (!(heroClass.baseAttackSeconds > 0)) report(`${where} needs a baseAttackSeconds above 0`);
  if (!(heroClass.criticalChanceBonus >= 0 && heroClass.criticalChanceBonus < 1)) report(`${where} criticalChanceBonus must be from 0 to below 1`);
}

// Every class has about the same attribute total at level 1 and in its total gain per level, so a class differs by the split, not by the sum.
function checkAttributeBudget(classes: readonly CombatClass[], report: (message: string) => void): void {
  const totalsOf = (heroClass: CombatClass): { start: number; gain: number } => ({
    start: ATTRIBUTES.reduce((sum, attribute) => sum + (heroClass.attributes[attribute]?.start ?? 0), 0),
    gain: ATTRIBUTES.reduce((sum, attribute) => sum + (heroClass.attributes[attribute]?.gainPerLevel ?? 0), 0),
  });
  const baselineTotals = classes.filter((heroClass) => heroClass.balanceStatus === 'baseline').map(totalsOf);
  const baselineStart = baselineTotals.reduce((sum, totals) => sum + totals.start, 0) / baselineTotals.length;
  const baselineGain = baselineTotals.reduce((sum, totals) => sum + totals.gain, 0) / baselineTotals.length;
  for (const heroClass of classes) {
    const totals = totalsOf(heroClass);
    if (Math.abs(totals.start - baselineStart) / baselineStart > MAXIMUM_ATTRIBUTE_TOTAL_SPREAD) report(`classes.json: '${heroClass.id}' attribute start total ${totals.start} is more than 15% from the baseline ${baselineStart.toFixed(1)}`);
    if (Math.abs(totals.gain - baselineGain) / baselineGain > MAXIMUM_ATTRIBUTE_TOTAL_SPREAD) report(`classes.json: '${heroClass.id}' attribute gain total ${totals.gain.toFixed(1)} is more than 15% from the baseline ${baselineGain.toFixed(1)}`);
  }
}

function checkBalanceFiles(report: (message: string) => void): void {
  const battle = load<Record<string, number>>('balance/battle.json') as Record<string, number> & { baseCriticalChance: number; criticalDamageMultiplier: number; minimumAttackSpeedFactor: number };
  for (const removed of ['maximumDamageCut', 'mitigationBase', 'mitigationPerAttackerLevel', 'criticalChancePerSkillPoint']) {
    if (removed in battle) report(`balance/battle.json: '${removed}' belongs to the old percentage model and must be removed`);
  }
  if (!(battle.baseCriticalChance >= 0 && battle.baseCriticalChance < 1 && battle.criticalDamageMultiplier >= 1)) report('balance/battle.json: baseCriticalChance must be from 0 to below 1 and criticalDamageMultiplier at least 1');
  if (!(battle.minimumAttackSpeedFactor > 0 && battle.minimumAttackSpeedFactor <= 1)) report('balance/battle.json: minimumAttackSpeedFactor must be above 0 and at most 1');
  const heroStats = load<Record<string, number>>('balance/hero-stats.json');
  for (const [name, value] of Object.entries(heroStats)) if (!(value > 0)) report(`balance/hero-stats.json: '${name}' must be above 0`);
  const resources = load<Record<string, Record<string, number> & { maximum: number }>>('balance/resources.json');
  for (const [resourceId, rules] of Object.entries(resources)) {
    if (!(rules.maximum > 0)) report(`balance/resources.json: '${resourceId}' needs a fixed maximum above 0`);
    for (const growthField of ['maximumBase', 'maximumPerLevel', 'maximumPerAttributePoint', 'attribute']) if (growthField in rules) report(`balance/resources.json: '${resourceId}' has '${growthField}', but the pools are fixed`);
  }
}

function checkMonsterScaling(monsters: readonly CombatMonster[], report: (message: string) => void): void {
  const scaling = load<{ defaultAttackSeconds: number; anchors: Array<{ level: number; hp: number; damage: number; armour: number; resistance: number }> }>('balance/monster-scaling.json');
  if (!(scaling.defaultAttackSeconds > 0)) report('balance/monster-scaling.json: defaultAttackSeconds must be above 0');
  if (scaling.anchors.length < 2) report('balance/monster-scaling.json: anchors needs at least 2 levels');
  scaling.anchors.forEach((anchor, index) => {
    const previous = scaling.anchors[index - 1];
    if (!(anchor.level >= 1 && anchor.hp > 0 && anchor.damage > 0 && anchor.armour >= 0 && anchor.resistance >= 0)) report(`balance/monster-scaling.json: anchors[${index}] needs a level, HP and damage above 0, armour and resistance of 0 or more`);
    if (previous && anchor.level <= previous.level) report(`balance/monster-scaling.json: anchors[${index}] must have a higher level than the anchor before it`);
  });
  const factorByRank: Record<string, string> = { normal: 'normal monsters', rare: 'rare monsters', boss: 'bosses' };
  for (const monster of monsters) {
    if (monster.statFactor !== undefined && !(monster.statFactor > 0)) report(`monsters.json: '${monster.id}' statFactor must be above 0`);
    if (monster.attackSeconds !== undefined && !(monster.attackSeconds > 0)) report(`monsters.json: '${monster.id}' attackSeconds must be above 0`);
    if (!(monster.rank in factorByRank)) continue;
    if (monster.rank === 'boss') continue;
    if (monster.flatStats) report(`monsters.json: '${monster.id}' is a ${monster.rank}, so it follows the curve and must not set flatStats`);
    if (monster.rank !== 'normal' && !((monster.statFactor ?? 1) > 1)) report(`monsters.json: '${monster.id}' is a ${monster.rank}, so its statFactor must be above 1`);
  }
  checkBossFlatStats(monsters, report);
}

// A boss has flat numbers. HP, damage, armour and Resistance must sit on one common factor of the normal curve at the level of its dungeon, so no side is lifted alone.
function checkBossFlatStats(monsters: readonly CombatMonster[], report: (message: string) => void): void {
  const dungeons = load<Array<{ id: string; level: number; bossMonsterId: string | null }>>('dungeons.json');
  for (const boss of monsters.filter((monster) => monster.rank === 'boss')) {
    const where = `monsters.json: boss '${boss.id}'`;
    const stats = boss.flatStats;
    if (!stats) { report(`${where} needs flatStats (hp, damage, armour, resistance, attackSeconds)`); continue; }
    if (boss.statFactor !== undefined) report(`${where} has a statFactor, but a boss uses flatStats`);
    if (!(stats.hp > 0 && stats.damage > 0 && stats.armour >= 0 && stats.resistance >= 0 && stats.attackSeconds > 0)) { report(`${where} flatStats needs HP, damage and attackSeconds above 0 and armour and resistance of 0 or more`); continue; }
    const dungeon = dungeons.find((candidate) => candidate.bossMonsterId === boss.id);
    if (!dungeon) { report(`${where} is not the boss of any dungeon`); continue; }
    const curve = monsterStatsAtLevel(dungeon.level);
    const factors = { hp: stats.hp / curve.hp, damage: stats.damage / curve.damage, armour: stats.armour / curve.armour, resistance: stats.resistance / curve.resistance };
    const commonFactor = Object.values(factors).reduce((sum, factor) => sum + factor, 0) / 4;
    for (const [stat, factor] of Object.entries(factors)) {
      if (Math.abs(factor - commonFactor) / commonFactor > MAXIMUM_BOSS_FACTOR_SPREAD) report(`${where} ${stat} is x${factor.toFixed(2)} of the level ${dungeon.level} curve, more than 15% from the common factor x${commonFactor.toFixed(2)}`);
    }
  }
}

export function checkCombatModel(classes: readonly CombatClass[], monsters: readonly CombatMonster[], spells: ReadonlyArray<{ id: string; castSeconds?: number }>, report: (message: string) => void): void {
  for (const heroClass of classes) checkClass(heroClass, report);
  checkAttributeBudget(classes, report);
  checkBalanceFiles(report);
  checkMonsterScaling(monsters, report);
  const spellBalance = load<{ defaultCastSeconds: number }>('balance/spells.json');
  if (!(spellBalance.defaultCastSeconds >= 0)) report('balance/spells.json: defaultCastSeconds must be 0 or more');
  for (const spell of spells) if (spell.castSeconds !== undefined && !(spell.castSeconds >= 0)) report(`spells.json: '${spell.id}' castSeconds must be 0 or more (0 is an instant cast)`);
}
