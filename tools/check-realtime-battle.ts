import assert from 'node:assert/strict';
import { createRandom } from '../src/kernel/random';
import type { BattleUnit } from '../src/model/battle';
import type { ClassId } from '../src/model/hero';
import type { RealtimeActionEvent, RealtimeBattleReport } from '../src/model/realtimeBattle';
import type { BattleSpell } from '../src/model/spell';
import { simulateRealtimeBattle } from '../src/systems/battle';
import { MAXIMUM_BATTLE_SECONDS } from '../src/content/balance/battle';
import { BODY_OVERLAP_TOLERANCE, FIELD_LENGTH } from '../src/content/balance/battlefield';
import { createMonsterUnit } from '../src/systems/dungeons';
import { commonGearHeroUnit, normalMonsterUnit } from './balance-sim/realtimeFixtures';

const CLASS_IDS: readonly ClassId[] = ['warrior', 'archer', 'mage', 'priest', 'thief'];
const sturdy = (unit: BattleUnit, hp = 1_000_000): BattleUnit => ({ ...unit, maxHp: hp, hp });
const hero = (classId: ClassId, level = 5, index = 0): BattleUnit => ({ ...commonGearHeroUnit(classId, level, createRandom(7), index), id: `hero-${index}` });
const monster = (id: string, level = 5): BattleUnit => normalMonsterUnit(level, id);
const fight = (units: BattleUnit[], seed = 3): RealtimeBattleReport => simulateRealtimeBattle(units, createRandom(seed).fork('battle'));
type ActionOf<Kind extends RealtimeActionEvent['kind']> = Extract<RealtimeActionEvent, { kind: Kind }>;
const attackStartsOf = (report: RealtimeBattleReport, actorId: string): ActionOf<'attackStart'>[] =>
  report.actionEvents.filter((event): event is ActionOf<'attackStart'> => event.kind === 'attackStart' && event.actorId === actorId);
const firstActionOf = (report: RealtimeBattleReport, actorId: string): number =>
  Math.min(...report.actionEvents.flatMap((event) => ((event.kind === 'attackStart' || event.kind === 'castStart') && event.actorId === actorId ? [event.timeSeconds] : [])));
const castStartsOf = (report: RealtimeBattleReport): ActionOf<'castStart'>[] => report.actionEvents.filter((event): event is ActionOf<'castStart'> => event.kind === 'castStart');
const trackOf = (report: RealtimeBattleReport, unitId: string) => report.tracks.find((track) => track.unitId === unitId)!;
const distanceAt = (report: RealtimeBattleReport, firstId: string, secondId: string, tick: number): number => {
  const first = trackOf(report, firstId);
  const second = trackOf(report, secondId);
  return Math.hypot(first.x[tick]! - second.x[tick]!, first.y[tick]! - second.y[tick]!);
};

// 1. Determinism.
const sameInputs = (): BattleUnit[] => [hero('warrior'), hero('archer', 5, 1), monster('rat-a'), monster('rat-b')];
assert.equal(JSON.stringify(fight(sameInputs(), 11)), JSON.stringify(fight(sameInputs(), 11)), 'same seed and units give the identical report');
assert.notEqual(JSON.stringify(fight(sameInputs(), 11)), JSON.stringify(fight(sameInputs(), 12)), 'another seed gives another fight');

// 2. Two melee units meet after 2 to 3 seconds. Both are sturdy so the fight does not end first.
const meleeFight = fight([sturdy(hero('warrior')), sturdy(monster('rat-a'))]);
const meleeContactSeconds = firstActionOf(meleeFight, 'hero-0');
assert.ok(meleeContactSeconds >= 2 && meleeContactSeconds <= 3, `melee contact at ${meleeContactSeconds}s, wanted 2 to 3`);

// 3. A ranged hero attacks first, once the enemy is in range and before melee contact.
const rangedFight = fight([sturdy(hero('archer')), sturdy(monster('rat-a'))]);
const archerFirst = { timeSeconds: firstActionOf(rangedFight, 'hero-0'), projectile: attackStartsOf(rangedFight, 'hero-0')[0]!.projectile };
const ratFirst = { timeSeconds: firstActionOf(rangedFight, 'rat-a') };
const archerTrack = trackOf(rangedFight, 'hero-0');
const archerStartTick = Math.round(archerFirst.timeSeconds / rangedFight.tickSeconds);
assert.ok(archerFirst.timeSeconds < ratFirst.timeSeconds, 'the archer attacks before the monster reaches it');
assert.ok(archerFirst.projectile, 'an archer attack is a projectile');
assert.ok(distanceAt(rangedFight, 'hero-0', 'rat-a', archerStartTick) - 2 * archerTrack.bodyRadius > archerTrack.attackReach * 0.9, 'the archer starts at about full range');
assert.ok(distanceAt(rangedFight, 'hero-0', 'rat-a', archerStartTick) < FIELD_LENGTH / 2, 'the archer started while the enemy was in range, not at the start');
assert.ok(['attacking', 'casting'].includes(archerTrack.state[archerStartTick]!), 'the archer stands still while it acts');
assert.equal(archerTrack.x[archerStartTick], archerTrack.x[archerStartTick + 1], 'the archer does not move while it acts');

// 4. Bodies never overlap beyond the tolerance, in a crowded fight.
const crowd = fight([sturdy(hero('warrior')), sturdy(hero('thief', 5, 1)), sturdy(hero('mage', 5, 2)), ...['a', 'b', 'c', 'd'].map((name) => sturdy(monster(`rat-${name}`)))]);
for (let tick = 0; tick < crowd.tracks[0]!.x.length; tick++) {
  for (const first of crowd.tracks) {
    for (const second of crowd.tracks) {
      if (first.unitId >= second.unitId || first.state[tick] === 'dead' || second.state[tick] === 'dead') continue;
      assert.ok(distanceAt(crowd, first.unitId, second.unitId, tick) >= first.bodyRadius + second.bodyRadius - BODY_OVERLAP_TOLERANCE - 0.002, `${first.unitId} and ${second.unitId} overlap at tick ${tick}`);
    }
  }
}

// 5. Nearest target: the monster hits the unit in front, not the archer behind it.
const frontAndBack = fight([sturdy(hero('warrior')), sturdy(hero('archer', 5, 1)), sturdy(monster('rat-a'))]);
assert.equal(attackStartsOf(frontAndBack, 'rat-a')[0]!.targetId, 'hero-0', 'a monster attacks the nearest hero');

// 6. A cast takes castSeconds and the cooldown starts when the cast starts. An instant spell lands at once.
const testSpell = (castSeconds: number): BattleSpell => ({ id: 'test.strike', isUltimate: false, cooldownSeconds: 5, castSeconds, resourceCost: 0, effect: { kind: 'damage', damageKind: 'physical', target: 'enemy', hits: 1, power: 2 } });
const casterFight = (castSeconds: number) => fight([{ ...sturdy(hero('warrior')), spells: [testSpell(castSeconds)] }, sturdy(monster('rat-a'))]);
const slowCast = casterFight(1.2);
const [firstCast, secondCast] = castStartsOf(slowCast) as [ActionOf<'castStart'>, ActionOf<'castStart'>];
const slowEffect = slowCast.events.find((event) => event.spellId === 'test.strike')!;
assert.ok(Math.abs(slowEffect.timeSeconds - firstCast.timeSeconds - 1.2) < 1e-6, 'the effect lands castSeconds after the cast began');
assert.ok(secondCast.timeSeconds - firstCast.timeSeconds >= 5 - 1e-6 && secondCast.timeSeconds - firstCast.timeSeconds < 5 + 3, 'the cooldown runs from the cast start');
assert.equal(trackOf(slowCast, 'hero-0').state[Math.round((firstCast.timeSeconds + 0.5) / slowCast.tickSeconds)], 'casting', 'the caster stands still while it casts');
const instantCast = casterFight(0);
const instantStart = castStartsOf(instantCast)[0]!;
assert.equal(instantCast.events.find((event) => event.spellId === 'test.strike')!.timeSeconds, instantStart.timeSeconds, 'an instant spell lands at once');

// 7. The Priest heals a wounded ally.
const woundedWarrior = { ...hero('warrior'), maxHp: 400, hp: 120 };
const healFight = fight([woundedWarrior, hero('priest', 5, 1), { ...sturdy(monster('rat-a')), attack: 1 }]);
assert.ok(healFight.events.some((event) => event.kind === 'heal' && event.actorId === 'hero-1' && event.targetId === 'hero-0' && event.amount > 0), 'the Priest heals the wounded warrior');

// 7b. A ranged hero that a melee monster has closed in on keeps shooting projectiles, and a mana or stamina bar follows the regeneration.
for (const rangedClassId of ['archer', 'mage'] as const) {
  const closedIn = fight([sturdy(hero(rangedClassId)), sturdy(monster('rat-a'))]);
  const ratFirstSwing = firstActionOf(closedIn, 'rat-a');
  const shotsAfterContact = attackStartsOf(closedIn, 'hero-0').filter((attack) => attack.timeSeconds > ratFirstSwing + 0.5);
  assert.ok(shotsAfterContact.length >= 2, `the ${rangedClassId} keeps attacking while the monster is in contact`);
  assert.ok(shotsAfterContact.every((attack) => attack.projectile), `the ${rangedClassId} attacks with projectiles in contact`);
  const resourceTrack = trackOf(closedIn, 'hero-0').resource;
  const spentThenRegenerated = resourceTrack.some((value, tick) => tick > 0 && value > resourceTrack[tick - 1]!);
  assert.ok(spentThenRegenerated, `the ${rangedClassId} resource rises between two actions`);
}

// 7c. Every unit starts to walk at the first tick (a buff waits until the enemy is near), and three big bosses behind each other do not shake.
const startFight = fight([hero('warrior', 10), hero('mage', 10, 1), monster('rat-a', 10), monster('rat-b', 10)]);
assert.ok(startFight.tracks.every((track) => track.state[1] === 'moving'), 'no unit stands still or casts a buff at the start');
const bossCrowd = fight([hero('archer', 10), hero('priest', 10, 1), ...[0, 1, 2].map((index) => ({ ...createMonsterUnit('goblin-chief', 10, `big-${index}`) }))], 3);
for (const track of bossCrowd.tracks.filter((candidate) => candidate.unitId.startsWith('big-'))) {
  let directionChanges = 0;
  for (let tick = 2; tick < track.y.length; tick++) {
    const previousStep = track.y[tick - 1]! - track.y[tick - 2]!;
    const step = track.y[tick]! - track.y[tick - 1]!;
    if (Math.abs(previousStep) > 1e-6 && Math.abs(step) > 1e-6 && Math.sign(previousStep) !== Math.sign(step)) directionChanges += 1;
  }
  assert.ok(directionChanges <= 60, `${track.unitId} shakes: ${directionChanges} direction changes`);
}

// 8. No NaN or negative HP, and every battle ends. All classes, a few levels and seeds.
let battlesRun = 0;
for (const classId of CLASS_IDS) {
  for (const level of [1, 5, 10]) {
    for (let seed = 1; seed <= 20; seed++) {
      const report = fight([hero(classId, level), monster('rat-a', level), monster('rat-b', level)], seed);
      battlesRun += 1;
      assert.ok(report.durationSeconds <= MAXIMUM_BATTLE_SECONDS, 'the battle ends');
      assert.ok(report.finalUnits.every((unit) => Number.isFinite(unit.hp) && unit.hp >= 0 && unit.hp <= unit.maxHp), `${classId} L${level}: bad HP`);
      assert.ok(report.tracks.every((track) => track.x.every(Number.isFinite) && track.y.every(Number.isFinite)), 'no NaN position');
      assert.ok(report.tracks.every((track) => track.x.length === report.tracks[0]!.x.length), 'every track has one sample per tick');
      assert.ok(report.durationSeconds < MAXIMUM_BATTLE_SECONDS, `${classId} L${level} seed ${seed} did not finish`);
    }
  }
}
console.log(`Real-time battle checks passed (${battlesRun} battles). Melee contact at ${meleeContactSeconds}s, archer first attack at ${archerFirst.timeSeconds}s.`);
