import { BASE_REGEN_FRACTION_PER_MINUTE, REVIVE_BASE_SECONDS, REVIVE_HEALTH_FRACTION, REVIVE_SECONDS_PER_LEVEL } from '../../content/balance/recovery';
import { CLASSES } from '../../content/classes';
import { requireById } from '../../content/lookup';
import type { Hero } from '../../model/hero';

// Health is stored with the time it was true (healthAsOfMs) and is worked out from the clock when needed.
// Callers pass the time in, so this code never reads the clock and stays testable.
function regenFractionPerMillisecond(hero: Hero): number {
  const classRate = requireById(CLASSES, hero.classId).recoveryRate;
  return (BASE_REGEN_FRACTION_PER_MINUTE * classRate) / 60000;
}

export function isDowned(hero: Hero, nowMs: number): boolean {
  return hero.downedUntilMs !== null && nowMs < hero.downedUntilMs;
}

export function healthFractionAt(hero: Hero, nowMs: number): number {
  if (isDowned(hero, nowMs)) return 0;
  const elapsedMs = Math.max(0, nowMs - hero.healthAsOfMs);
  return Math.min(1, hero.healthFraction + elapsedMs * regenFractionPerMillisecond(hero));
}

export function reviveSeconds(hero: Hero): number {
  const classRate = requireById(CLASSES, hero.classId).recoveryRate;
  return Math.round((REVIVE_BASE_SECONDS + REVIVE_SECONDS_PER_LEVEL * hero.level) / classRate);
}

// Seconds until a hero is at full health, or 0 when already full. Used for the "rested in" text.
export function secondsToFullHealth(hero: Hero, nowMs: number): number {
  const missing = 1 - healthFractionAt(hero, nowMs);
  const downedWait = isDowned(hero, nowMs) ? ((hero.downedUntilMs ?? nowMs) - nowMs) / 1000 : 0;
  const fractionAfterRevive = isDowned(hero, nowMs) ? 1 - hero.healthFraction : missing;
  return Math.ceil(downedWait + (fractionAfterRevive / (regenFractionPerMillisecond(hero) * 1000)));
}

// The hero state after a fight. A hero at 0 health is downed and returns at a fixed fraction after a wait.
export function heroAfterFight(hero: Hero, finalHealthFraction: number, nowMs: number): Hero {
  if (finalHealthFraction > 0) return { ...hero, healthFraction: Math.min(1, finalHealthFraction), healthAsOfMs: nowMs, downedUntilMs: null };
  const revivedAtMs = nowMs + reviveSeconds(hero) * 1000;
  return { ...hero, healthFraction: REVIVE_HEALTH_FRACTION, healthAsOfMs: revivedAtMs, downedUntilMs: revivedAtMs };
}

// Freeze the regenerated health into the stored fields, for example when a run starts.
export function settleHealth(hero: Hero, nowMs: number): Hero {
  if (isDowned(hero, nowMs)) return hero;
  return { ...hero, healthFraction: healthFractionAt(hero, nowMs), healthAsOfMs: nowMs, downedUntilMs: null };
}
