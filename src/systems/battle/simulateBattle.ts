import {
  ACTION_THRESHOLD,
  HEAL_BELOW_HEALTH_FRACTION,
  HEAL_POWER_MULTIPLIER,
  MAXIMUM_BATTLE_SECONDS,
  SECONDS_PER_TICK,
} from '../../content/balance/battle';
import type { Random } from '../../kernel/random';
import type { BattleEvent, BattleReport, BattleSide, BattleUnit } from '../../model/battle';
import { rollDamage } from './damage';

interface Combatant {
  unit: BattleUnit;
  charge: number;
}

function livingUnitsOf(combatants: readonly Combatant[], side: BattleSide): BattleUnit[] {
  return combatants.filter((combatant) => combatant.unit.side === side && combatant.unit.hp > 0).map((c) => c.unit);
}

function healthFractionOf(unit: BattleUnit): number {
  return unit.hp / unit.maxHp;
}

function findHealTarget(allies: readonly BattleUnit[]): BattleUnit | undefined {
  const wounded = allies.filter((ally) => healthFractionOf(ally) < HEAL_BELOW_HEALTH_FRACTION);
  return wounded.sort((first, second) => healthFractionOf(first) - healthFractionOf(second))[0];
}

function chooseAttackTarget(actor: BattleUnit, opponents: readonly BattleUnit[], random: Random): BattleUnit {
  if (actor.side === 'enemy') return random.pick(opponents);
  return [...opponents].sort((first, second) => first.hp - second.hp)[0] as BattleUnit;
}

function act(actor: BattleUnit, combatants: readonly Combatant[], timeSeconds: number, random: Random): BattleEvent {
  const allies = livingUnitsOf(combatants, actor.side);
  const opponents = livingUnitsOf(combatants, actor.side === 'party' ? 'enemy' : 'party');

  // A healer never heals itself. A lone healer would never fall, so it would win every fight.
  const healTarget = actor.behavior === 'healer' ? findHealTarget(allies.filter((ally) => ally.id !== actor.id)) : undefined;
  if (healTarget) {
    const healedAmount = Math.min(
      healTarget.maxHp - healTarget.hp,
      Math.round(actor.attack * HEAL_POWER_MULTIPLIER),
    );
    healTarget.hp += healedAmount;
    return {
      timeSeconds,
      kind: 'heal',
      actorId: actor.id,
      targetId: healTarget.id,
      amount: healedAmount,
      isCritical: false,
      targetHpAfter: healTarget.hp,
    };
  }

  const target = chooseAttackTarget(actor, opponents, random);
  const damage = rollDamage(actor, target, random);
  target.hp = Math.max(0, target.hp - damage.amount);
  return {
    timeSeconds,
    kind: 'attack',
    actorId: actor.id,
    targetId: target.id,
    amount: damage.amount,
    isCritical: damage.isCritical,
    targetHpAfter: target.hp,
  };
}

// The whole fight is simulated at once from a seed, then replayed by the screen.
// This keeps results identical after a reload and lets the balance tool run without a screen.
export function simulateBattle(units: readonly BattleUnit[], random: Random): BattleReport {
  const combatants: Combatant[] = units.map((unit) => ({ unit: { ...unit }, charge: 0 }));
  const events: BattleEvent[] = [];
  const maximumTicks = Math.round(MAXIMUM_BATTLE_SECONDS / SECONDS_PER_TICK);
  let tick = 0;

  while (tick < maximumTicks) {
    if (livingUnitsOf(combatants, 'party').length === 0 || livingUnitsOf(combatants, 'enemy').length === 0) break;
    tick += 1;
    const timeSeconds = Math.round(tick * SECONDS_PER_TICK * 10) / 10;

    for (const combatant of combatants) {
      if (combatant.unit.hp > 0) combatant.charge += combatant.unit.speed * SECONDS_PER_TICK;
    }
    const readyCombatants = combatants
      .filter((combatant) => combatant.unit.hp > 0 && combatant.charge >= ACTION_THRESHOLD)
      .sort((first, second) => second.charge - first.charge);

    for (const combatant of readyCombatants) {
      if (combatant.unit.hp <= 0) continue;
      const hasOpponents = livingUnitsOf(combatants, combatant.unit.side === 'party' ? 'enemy' : 'party').length > 0;
      if (!hasOpponents) break;
      combatant.charge -= ACTION_THRESHOLD;
      events.push(act(combatant.unit, combatants, timeSeconds, random));
    }
  }

  const finalUnits = combatants.map((combatant) => combatant.unit);
  const enemiesRemain = livingUnitsOf(combatants, 'enemy').length > 0;
  return {
    winner: enemiesRemain ? 'enemy' : 'party',
    durationSeconds: Math.round(tick * SECONDS_PER_TICK * 10) / 10,
    events,
    finalUnits,
  };
}
