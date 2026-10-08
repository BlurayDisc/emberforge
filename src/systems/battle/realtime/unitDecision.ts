import { ATTACK_HIT_FRACTION, HOLD_WHEN_STUCK_SECONDS, PREPARE_SPELLS_WITHIN_DISTANCE, TICK_SECONDS, UNREACHABLE_SWITCH_SECONDS } from '../../../content/balance/battlefield';
import { HEAL_BELOW_HEALTH_FRACTION } from '../../../content/balance/battle';
import type { BattleSpell } from '../../../model/spell';
import { attackSpeedFactorOf } from '../combatant';
import { beginSpellCast, pickReadySpell } from '../spellCasting';
import { livingAlliesOf, livingEnemiesOf, type FieldBattle } from './fieldBattle';
import { followsSlotCastOrder, nextSpellInSlotOrder, recordBasicAction, recordSlotCast } from './heroCastOrder';
import { edgeDistanceBetween, unitIdOf, type RealtimeUnit } from './realtimeUnit';
import { isPreparationSpell, spellNeedsEnemyInRange, spellReachOf } from './spellReach';
import { stepToward } from './steering';
import { chooseEnemyTarget } from './targeting';
import { firstTickTimeAtOrAfter, roundSeconds } from './tickClock';

const healthFractionOf = (unit: RealtimeUnit): number => unit.combatant.unit.hp / unit.combatant.unit.maxHp;

// A healer never heals itself.
function woundedAllyOf(battle: FieldBattle, healer: RealtimeUnit): RealtimeUnit | undefined {
  if (healer.combatant.unit.behavior !== 'healer') return undefined;
  return livingAlliesOf(battle, healer)
    .filter((ally) => healthFractionOf(ally) < HEAL_BELOW_HEALTH_FRACTION)
    .sort((first, second) => healthFractionOf(first) - healthFractionOf(second))[0];
}

function faceToward(unit: RealtimeUnit, goal: RealtimeUnit): void {
  if (Math.abs(goal.x - unit.x) > 1e-6) unit.facing = goal.x > unit.x ? 1 : -1;
}

function startCast(battle: FieldBattle, unit: RealtimeUnit, spell: BattleSpell, target: RealtimeUnit, timeSeconds: number): void {
  const resourceCost = beginSpellCast(unit.combatant, spell, timeSeconds);
  const effectAtSeconds = roundSeconds(timeSeconds + spell.castSeconds);
  const needsEnemy = spellNeedsEnemyInRange(spell.effect);
  unit.pending = { kind: 'cast', spell, resourceCost, targetId: unitIdOf(target), effectAtSeconds };
  unit.readyAtSeconds = effectAtSeconds;
  unit.motion = 'casting';
  if (needsEnemy) faceToward(unit, target);
  battle.actionEvents.push({ kind: 'castStart', timeSeconds, actorId: unitIdOf(unit), targetId: needsEnemy ? unitIdOf(target) : null, spellId: spell.id, effectAtSeconds });
}

// The cooldown of an attack is its attack time (Agility, gear, Haste and Slow in one pool). When the unit became ready between two ticks,
// the next attack starts at that exact time, so a long run of attacks keeps its true rhythm.
function startAttack(battle: FieldBattle, unit: RealtimeUnit, target: RealtimeUnit, isHeal: boolean, timeSeconds: number): void {
  const attackSeconds = unit.combatant.unit.baseAttackSeconds / attackSpeedFactorOf(unit.combatant, timeSeconds);
  const becameReadyBetweenTicks = unit.readyAtSeconds <= timeSeconds && timeSeconds - unit.readyAtSeconds < TICK_SECONDS;
  const startSeconds = becameReadyBetweenTicks ? unit.readyAtSeconds : timeSeconds;
  const hitAtSeconds = Math.max(timeSeconds, startSeconds + attackSeconds * ATTACK_HIT_FRACTION);
  unit.pending = { kind: isHeal ? 'heal' : 'attack', targetId: unitIdOf(target), hitAtSeconds };
  unit.readyAtSeconds = startSeconds + attackSeconds;
  unit.motion = 'attacking';
  recordBasicAction(unit);
  faceToward(unit, target);
  battle.actionEvents.push({
    kind: 'attackStart',
    timeSeconds,
    actorId: unitIdOf(unit),
    targetId: unitIdOf(target),
    hitAtSeconds: firstTickTimeAtOrAfter(hitAtSeconds),
    endsAtSeconds: roundSeconds(unit.readyAtSeconds),
    projectile: unit.isRanged,
    isHeal,
  });
}

function moveToward(battle: FieldBattle, unit: RealtimeUnit, goal: RealtimeUnit): void {
  const stepLength = unit.movementSpeed * TICK_SECONDS;
  const distanceBefore = edgeDistanceBetween(unit, goal);
  const moved = stepToward(unit, goal, battle.units, stepLength, unit.stuckSeconds >= HOLD_WHEN_STUCK_SECONDS);
  unit.motion = moved > 0 ? 'moving' : 'idle';
  // Progress is the gain on the goal, not the length moved. A unit that jitters against a wall gains a step and loses it again,
  // so a gain only pays back half of the time that a non-gain adds.
  const gainedOnGoal = distanceBefore - edgeDistanceBetween(unit, goal);
  unit.stuckSeconds = gainedOnGoal < stepLength * 0.25 ? unit.stuckSeconds + TICK_SECONDS : Math.max(0, unit.stuckSeconds - TICK_SECONDS / 2);
  faceToward(unit, goal);
}

// What a free unit does this tick: cast a ready spell (a hero in slot order, see heroCastOrder), or strike or heal if the goal is in reach, or move toward the goal.
export function decideAction(battle: FieldBattle, unit: RealtimeUnit, timeSeconds: number): void {
  const enemies = livingEnemiesOf(battle, unit);
  const avoidId = unit.stuckSeconds >= UNREACHABLE_SWITCH_SECONDS ? unit.targetId : null;
  if (avoidId !== null && enemies.length > 1) unit.stuckSeconds = 0;
  const enemyTarget = chooseEnemyTarget(unit, enemies, avoidId);
  unit.targetId = enemyTarget ? unitIdOf(enemyTarget) : null;
  if (!enemyTarget) {
    unit.motion = 'idle';
    return;
  }
  const isInReach = (candidate: BattleSpell): boolean => {
    if (isPreparationSpell(candidate.effect)) return edgeDistanceBetween(unit, enemyTarget) <= PREPARE_SPELLS_WITHIN_DISTANCE;
    return !spellNeedsEnemyInRange(candidate.effect) || edgeDistanceBetween(unit, enemyTarget) <= spellReachOf(unit, candidate);
  };
  const spell = followsSlotCastOrder(unit)
    ? nextSpellInSlotOrder(battle, unit, enemyTarget, timeSeconds, isInReach)
    : pickReadySpell(unit.combatant, battle.combatants, timeSeconds, battle.random, enemyTarget.combatant.unit, isInReach);
  if (spell) {
    if (followsSlotCastOrder(unit)) recordSlotCast(unit, spell);
    startCast(battle, unit, spell, enemyTarget, timeSeconds);
    return;
  }
  const woundedAlly = woundedAllyOf(battle, unit);
  const goal = woundedAlly ?? enemyTarget;
  if (edgeDistanceBetween(unit, goal) <= unit.attackReach) {
    startAttack(battle, unit, goal, woundedAlly !== undefined, timeSeconds);
    return;
  }
  // A goal that is walled off does not stop the unit from hitting an enemy that is already in reach.
  const enemyInReach = enemies.find((enemy) => edgeDistanceBetween(unit, enemy) <= unit.attackReach);
  if (woundedAlly === undefined && enemyInReach) {
    unit.targetId = unitIdOf(enemyInReach);
    startAttack(battle, unit, enemyInReach, false, timeSeconds);
    return;
  }
  moveToward(battle, unit, goal);
}

export const stillBusy = (unit: RealtimeUnit, timeSeconds: number): boolean => unit.pending !== null || unit.readyAtSeconds > timeSeconds + 1e-6;
