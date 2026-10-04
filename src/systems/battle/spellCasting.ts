import { HEAL_SPELL_CAST_BELOW_HEALTH_FRACTION, ULTIMATE_OPENING_DELAY_SECONDS } from '../../content/balance/spells';
import type { Random } from '../../kernel/random';
import type { BattleEvent, BattleUnit } from '../../model/battle';
import type { BattleSpell, SpellEffect } from '../../model/spell';
import { applyStatus, combatantOf, damageFactorBetween, livingUnitsOf, statusStrength, type Combatant } from './combatant';
import { rollDamage } from './damage';
import { gainResourceFromHit, spendResource } from './resourcePool';

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
  return statusTargets(effect, context).some((unit) => lacksStatus(effect, unit, context));
}

function event(context: CastContext, target: BattleUnit, kind: BattleEvent['kind'], amount: number, isCritical = false): BattleEvent {
  return { timeSeconds: context.timeSeconds, kind, actorId: context.actor.unit.id, targetId: target.id, amount, isCritical, targetHpAfter: target.hp, actorResourceAfter: context.actor.unit.resource, targetResourceAfter: target.resource, spellId: context.spell.id };
}

function castDamage(effect: Extract<SpellEffect, { kind: 'damage' | 'drain' }>, context: CastContext): BattleEvent[] {
  const events: BattleEvent[] = [];
  const targets = effect.kind === 'damage' && effect.target === 'allEnemies'
    ? context.opponents
    : [[...context.opponents].sort((first, second) => first.hp - second.hp)[0] as BattleUnit];
  let dealtTotal = 0;
  for (const target of targets) {
    const targetCombatant = combatantOf(context.combatants, target);
    for (let hit = 0; hit < effect.hits && target.hp > 0; hit++) {
      const damage = rollDamage(context.actor.unit, target, context.random, {
        power: effect.power,
        damageKind: effect.damageKind,
        statusFactor: damageFactorBetween(context.actor, targetCombatant, context.timeSeconds),
      });
      target.hp = Math.max(0, target.hp - damage.amount);
      gainResourceFromHit(context.actor.unit, target);
      dealtTotal += damage.amount;
      events.push(event(context, target, 'attack', damage.amount, damage.isCritical));
    }
    if (effect.kind === 'damage' && effect.inflicts && target.hp > 0) {
      applyStatus(targetCombatant, { status: effect.inflicts.status, strength: effect.inflicts.strength, expiresAtSeconds: context.timeSeconds + effect.inflicts.durationSeconds });
    }
  }
  if (effect.kind === 'drain') {
    const caster = context.actor.unit;
    const healed = Math.min(caster.maxHp - caster.hp, Math.round(dealtTotal * effect.healFraction));
    caster.hp += healed;
    if (healed > 0) events.push(event(context, caster, 'heal', healed));
  }
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
  return statusTargets(effect, context).map((target) => {
    applyStatus(combatantOf(context.combatants, target), { status: effect.status, strength: effect.strength, expiresAtSeconds: context.timeSeconds + effect.durationSeconds });
    return event(context, target, 'effect', 0);
  });
}

function cast(context: CastContext): BattleEvent[] {
  const { effect } = context.spell;
  if (effect.kind === 'heal') return castHeal(effect, context);
  if (effect.kind === 'status') return castStatus(effect, context);
  return castDamage(effect, context);
}

// Returns the events of the first spell that is ready, paid for and useful, or null when the actor should attack.
export function tryCastSpell(actor: Combatant, combatants: readonly Combatant[], timeSeconds: number, random: Random): BattleEvent[] | null {
  const allies = livingUnitsOf(combatants, actor.unit.side);
  const opponents = livingUnitsOf(combatants, actor.unit.side === 'party' ? 'enemy' : 'party');
  for (const spell of actor.unit.spells) {
    if (timeSeconds < readyAtSeconds(actor, spell) || actor.unit.resource < spell.resourceCost) continue;
    const context: CastContext = { actor, combatants, allies, opponents, timeSeconds, random, spell };
    if (!isUseful(spell.effect, context)) continue;
    spendResource(actor.unit, spell.resourceCost);
    actor.spellReadyAtSeconds[spell.id] = timeSeconds + spell.cooldownSeconds;
    const events = cast(context);
    const firstEvent = events[0];
    if (firstEvent && spell.resourceCost > 0) firstEvent.resourceSpent = spell.resourceCost;
    return events;
  }
  return null;
}
