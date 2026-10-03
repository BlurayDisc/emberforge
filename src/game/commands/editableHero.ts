import type { GameState } from '../../model/gameState';
import type { Hero } from '../../model/hero';
import { CommandRejected } from '../gameStore';
import { runOfHero } from '../runStatus';

// A run replays its fight from the hero as it is at the end. So a hero in a run must not change.
export function requireEditableHero(state: GameState, heroId: string, runRejectionKey: string): Hero {
  const hero = state.company.find((candidate) => candidate.id === heroId);
  if (!hero) throw new CommandRejected('reject.heroMissing');
  if (runOfHero(state, heroId)) throw new CommandRejected(runRejectionKey);
  return hero;
}

export function replaceHero(state: GameState, updatedHero: Hero): Hero[] {
  return state.company.map((hero) => (hero.id === updatedHero.id ? updatedHero : hero));
}
