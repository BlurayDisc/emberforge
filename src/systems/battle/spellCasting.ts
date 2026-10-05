import { BURN_TICK_SECONDS } from '../../content/balance/battle';
import { HEAL_SPELL_CAST_BELOW_HEALTH_FRACTION, ULTIMATE_OPENING_DELAY_SECONDS } from '../../content/balance/spells';
import type { Random } from '../../kernel/random';
import type { BattleEvent, BattleUnit } from '../../model/battle';
import type { BattleSpell, InflictedStatus, SpellEffect } from '../../model/spell';
import { applyStatus, combatantOf, damageFactorBetween, defenceFactorOf, empowerBonusesOf, livingUnitsOf, statusStrength, type ActiveStatus, type Combatant } from './combatant';
import { rollDamage, type DamageRoll } from './damage';
import { dodgeEvent, dodgesHit, shieldFieldsOf, takeDamage } from './damageTaken';
import { applyLifeSteal } from './lifeSteal';
import { frontlineOpponent } from './frontlineTarget';
import { gainResourceFromHit, spendResource } from './resourcePool';
import { reflectThorns } from './thorns';

interface CastContext {
  actor: Combatant;
  combatants: readonly Combatant[];
  allies: BattleUnit[];
  opponents: BattleUnit[];
  timeSeconds: number;
  random: Random;
  spell: BattleSpell;
}

const healthFractionOf = (unit: BattleUnit): number => unit.hp / unit.maxHp;
const isWounded = (unit: BattleUnit): boolean => healthFractionOf(unit) < HEAL_SPELL_CAST_BELOW_HEALTH_FRACTION;

function readyAtSeconds(actor: Combatant, spell: BattleSpell): number {
  return actor.spellReadyAtSeconds[spell.id] ?? (spell.isUltimate ? ULTIMATE_OPENING_DELAY_SECONDS : 0);
}

function statusTargets(effect: Extract<SpellEffect, { kind: 'status' }>, context: CastContext): BattleUnit[] {
  if (effect.target === 'self') return [context.actor.unit];
  if (effect.target === 'allAllies') return context.allies;
  if (effect.target === 'allEnemies') return context.opponents;
  if (context.actor.unit.targetPriority === 'highestDefence' && context.opponents.length > 0) return [frontlineOpponent(context.opponents)];
  const strongestOpponent = [...context.opponents].sort((first, second) => second.maxHp - first.maxHp)[0];
  return strongestOpponent ? [strongestOpponent] : [];
}

function lacksStatus(effect: Extract<SpellEffect, { kind: 'status' }>, unit: BattleUnit, context: CastContext): boolean {
  return statusStrength(combatantOf(context.combatants, unit), effect.status, context.timeSeconds) === 0;
}

// The AI casts a spell only when it does something: no heal for a healthy party, no second buff on top of a buff.
function isUseful(effect: SpellEffect, context: CastContext): boolean {
  if (effect.kind === 'damage' || effect.kind === 'drain') return context.opponents.length > 0;
  if (effect.kind === 'heal') return (effect.target === 'self' ? [context.actor.unit] : context.allies).some(isWounded);
  if (effect.kind === 'shield') return context.opponents.length > 0 && !(context.actor.shield && context.actor.shield.expiresAtSeconds > context.timeSeconds);
  return statusTargets(effect, context).some((unit) => lacksStatus(effect, unit, context));
}

function event(context: CastContext, target: BattleUnit, kind: BattleEvent['kind'], amount: number, isCritical = false): BattleEvent {
  return { timeSeconds: context.timeSeconds, kind, actorId: context.actor.unit.id, targetId: target.id, amount, isCritical, targetHpAfter: target.hp, actorResourceAfter: context.actor.unit.resource, targetResourceAfter: target.resource, spellId: context.spell.id };
}

// A hit adds a share of the caster's Defence (with its Fortify) and, for a hybrid spell, a second part that deals magic damage.
function rollSpellHit(effect: Extract<SpellEffect, { kind: 'damage' | 'drain' }>, context: CastContext, target: BattleUnit, targetCombatant: Combatant): DamageRoll {
  const statusFactor = damageFactorBetween(context.actor, targetCombatant, context.timeSeconds, effect.damageKind);
  const defencePower = effect.kind === 'damage' ? effect.defencePower ?? 0 : 0;
  const empower = empowerBonusesOf(context.actor, context.timeSeconds);
  const physicalPart = rollDamage(context.actor.unit, target, context.random, {
    power: effect.power,
    damageKind: effect.damageKind,
    statusFactor,
    targetDefenceFactor: defenceFactorOf(targetCombatant, context.timeSeconds),
    bonusDamage: defencePower * context.actor.unit.defence * defenceFactorOf(context.actor, context.timeSeconds),
    ...empower,
  });
  const magicPower = effect.kind === 'damage' ? effect.magicPower ?? 0 : 0;
  if (magicPower === 0) return physicalPart;
  const magicPart = rollDamage(context.actor.unit, target, context.random, { power: magicPower, damageKind: 'magic', statusFactor: damageFactorBetween(context.actor, targetCombatant, context.timeSeconds, 'magic'), ...empower });
  return { amount: physicalPart.amount + magicPart.amount, isCritical: physicalPart.isCritical || magicPart.isCritical };
}

function activeStatusFrom(inflicted: InflictedStatus, context: CastContext): ActiveStatus {
  const expiresAtSeconds = context.timeSeconds + inflicted.durationSeconds;
  const status: ActiveStatus = { status: inflicted.status, strength: inflicted.strength, expiresAtSeconds };
  if (inflicted.charges !== undefined) status.charges = inflicted.charges;
  if (inflicted.status === 'burn') {
    const sourceAttack = context.actor.unit.attack + empowerBonusesOf(context.actor, context.timeSeconds).attackBonus;
    status.burn = { sourceId: context.actor.unit.id, sourceAttack, sourceLevel: context.actor.unit.level, nextTickAtSeconds: Math.round((context.timeSeconds + BURN_TICK_SECONDS) * 10) / 10 };
  }
  return status;
}

// The targets in the order that the hits fall. A spread spell hands its hits to the living enemies in turn.
function targetForHit(effect: Extract<SpellEffect, { kind: 'damage' | 'drain' }>, hitNumber: number, context: CastContext, fixedTarget: BattleUnit): BattleUnit | undefined {
  if (effect.kind !== 'damage' || effect.target !== 'spreadEnemies') return fixedTarget;
  const living = context.opponents.filter((opponent) => opponent.hp > 0);
  return living[hitNumber % living.length];
}

function castDamage(effect: Extract<SpellEffect, { kind: 'damage' | 'drain' }>, context: CastContext): BattleEvent[] {
  const events: BattleEvent[] = [];
  const isSpread = effect.kind === 'damage' && effect.target === 'spreadEnemies';
  const singleTarget = context.actor.unit.targetPriority === 'highestDefence' ? frontlineOpponent(context.opponents) : [...context.opponents].sort((first, second) => first.hp - second.hp)[0] as BattleUnit;
  const targets = effect.kind === 'damage' && effect.target === 'allEnemies' ? context.opponents : [singleTarget];
  const landedOn = new Set<string>();
  let dealtTotal = 0;
  const strike = (target: BattleUnit): void => {
    const targetCombatant = combatantOf(context.combatants, target);
    if (dodgesHit(targetCombatant, context.timeSeconds)) {
      events.push(dodgeEvent(context.actor, targetCombatant, context.timeSeconds, context.spell.id));
      return;
    }
    const damage = rollSpellHit(effect, context, target, targetCombatant);
    const taken = takeDamage(targetCombatant, damage.amount, context.timeSeconds);
    gainResourceFromHit(context.actor.unit, target);
    const damageThatLanded = damage.amount - taken.absorbed;
    dealtTotal += damageThatLanded;
    landedOn.add(target.id);
    events.push({ ...event(context, target, 'attack', damage.amount, damage.isCritical), ...shieldFieldsOf(targetCombatant, taken) });
    events.push(...reflectThorns(context.actor, targetCombatant, damageThatLanded, context.timeSeconds));
  };
  if (isSpread) {
    for (let hit = 0; hit < effect.hits && context.actor.unit.hp > 0; hit++) {
      const target = targetForHit(effect, hit, context, singleTarget);
      if (!target) break;
      strike(target);
    }
  } else {
    for (const target of targets) {
      for (let hit = 0; hit < effect.hits && target.hp > 0 && context.actor.unit.hp > 0; hit++) strike(target);
    }
  }
  if (effect.kind === 'damage' && effect.inflicts) {
    for (const target of context.opponents.filter((opponent) => landedOn.has(opponent.id) && opponent.hp > 0)) {
      applyStatus(combatantOf(context.combatants, target), activeStatusFrom(effect.inflicts, context));
    }
  }
  if (effect.kind === 'damage' && effect.alsoOnSelf) applyStatus(context.actor, activeStatusFrom(effect.alsoOnSelf, context));
  if (effect.kind === 'drain') {
    const caster = context.actor.unit;
    const healed = Math.min(caster.maxHp - caster.hp, Math.round(dealtTotal * effect.healFraction));
    caster.hp += healed;
    if (healed > 0) events.push(event(context, caster, 'heal', healed));
  }
  events.push(...applyLifeSteal(context.actor.unit, dealtTotal, context.timeSeconds, context.spell.id));
  return events;
}

function castHeal(effect: Extract<SpellEffect, { kind: 'heal' }>, context: CastContext): BattleEvent[] {
  const wounded = (effect.target === 'self' ? [context.actor.unit] : context.allies).filter((unit) => unit.hp < unit.maxHp);
  const targets = effect.target === 'allAllies' ? wounded : [[...wounded].sort((first, second) => healthFractionOf(first) - healthFractionOf(second))[0] as BattleUnit];
  return targets.map((target) => {
    const woundFactor = 1 - statusStrength(combatantOf(context.combatants, target), 'wound', context.timeSeconds);
    const healed = Math.min(target.maxHp - target.hp, Math.round(context.actor.unit.attack * effect.power * woundFactor));
    target.hp += healed;
    return event(context, target, 'heal', healed);
  });
}

function castStatus(effect: Extract<SpellEffect, { kind: 'status' }>, context: CastContext): BattleEvent[] {
  const events = statusTargets(effect, context).map((target) => {
    applyStatus(combatantOf(context.combatants, target), activeStatusFrom(effect, context));
    return event(context, target, 'effect', 0);
  });
  if (effect.alsoOnSelf) applyStatus(context.actor, activeStatusFrom(effect.alsoOnSelf, context));
  return events;
}

// The shield takes the resource that it cost and turns it into absorb points. It ends when the time runs out or the damage empties it.
function castShield(effect: Extract<SpellEffect, { kind: 'shield' }>, context: CastContext, resourceSpent: number): BattleEvent[] {
  const remaining = Math.round(resourceSpent * effect.absorbPerResourcePoint);
  context.actor.shield = { remaining, expiresAtSeconds: context.timeSeconds + effect.durationSeconds };
  return [{ ...event(context, context.actor.unit, 'effect', 0), targetShieldAfter: remaining }];
}

// A shield costs a share of the whole pool. Every other spell has a fixed cost.
export function resourceCostOf(spell: BattleSpell, unit: BattleUnit): number {
  return spell.effect.kind === 'shield' ? Math.round(unit.maxResource * spell.effect.resourceFraction) : spell.resourceCost;
}

function cast(context: CastContext, resourceSpent: number): BattleEvent[] {
  const { effect } = context.spell;
  if (effect.kind === 'shield') return castShield(effect, context, resourceSpent);
  if (effect.kind === 'heal') return castHeal(effect, context);
  if (effect.kind === 'status') return castStatus(effect, context);
  return castDamage(effect, context);
}

// Returns the events of the first spell that is ready, paid for and useful, or null when the actor should attack.
export function tryCastSpell(actor: Combatant, combatants: readonly Combatant[], timeSeconds: number, random: Random): BattleEvent[] | null {
  const allies = livingUnitsOf(combatants, actor.unit.side);
  const opponents = livingUnitsOf(combatants, actor.unit.side === 'party' ? 'enemy' : 'party');
  for (const spell of actor.unit.spells) {
    const resourceCost = resourceCostOf(spell, actor.unit);
    if (timeSeconds < readyAtSeconds(actor, spell) || actor.unit.resource < resourceCost) continue;
    const context: CastContext = { actor, combatants, allies, opponents, timeSeconds, random, spell };
    if (!isUseful(spell.effect, context)) continue;
    spendResource(actor.unit, resourceCost);
    actor.spellReadyAtSeconds[spell.id] = timeSeconds + spell.cooldownSeconds;
    const events = cast(context, resourceCost);
    const firstEvent = events[0];
    if (firstEvent && resourceCost > 0) firstEvent.resourceSpent = resourceCost;
    return events;
  }
  return null;
}
