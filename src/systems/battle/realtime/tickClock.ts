import { TICK_SECONDS } from '../../../content/balance/battlefield';

// Ticks are 0.05 s, which a float cannot hold exactly. Times are rounded to 0.1 ms so events and comparisons stay clean.
export const roundSeconds = (seconds: number): number => Math.round(seconds * 10000) / 10000;

export const timeOfTick = (tick: number): number => roundSeconds(tick * TICK_SECONDS);

// A tiny allowance so an action due at exactly this tick is not pushed to the next one by float error.
export const isDue = (dueAtSeconds: number, timeSeconds: number): boolean => dueAtSeconds <= timeSeconds + 1e-6;

export const firstTickTimeAtOrAfter = (seconds: number): number => timeOfTick(Math.ceil(seconds / TICK_SECONDS - 1e-6));
