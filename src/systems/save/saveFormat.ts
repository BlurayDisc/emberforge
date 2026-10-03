import type { GameState } from '../../model/gameState';
import type { Hero } from '../../model/hero';

export const CURRENT_SAVE_VERSION = 7;

export function serializeGameState(state: GameState): string {
  return JSON.stringify(state);
}

// Version 6 saves lack the timed fields. They get safe defaults, so the player keeps their game.
function upgradeVersionSixHero(hero: Hero): Hero {
  return { ...hero, healthAsOfMs: hero.healthAsOfMs ?? 0, downedUntilMs: hero.downedUntilMs ?? null };
}

export function parseGameState(serialized: string): GameState | null {
  try {
    const parsed = JSON.parse(serialized) as Partial<GameState>;
    if (parsed.saveVersion !== CURRENT_SAVE_VERSION && parsed.saveVersion !== 6) return null;
    if (!Array.isArray(parsed.company) || !Array.isArray(parsed.backpack)) return null;
    return {
      ...(parsed as GameState),
      saveVersion: CURRENT_SAVE_VERSION,
      company: parsed.company.map(upgradeVersionSixHero),
      jobs: parsed.jobs ?? [],
      jobsStarted: parsed.jobsStarted ?? 0,
    };
  } catch {
    return null;
  }
}
