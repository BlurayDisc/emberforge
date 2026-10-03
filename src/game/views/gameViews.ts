import { CLASSES } from '../../content/classes';
import type { GameState } from '../../model/gameState';
import type { ClassId, Hero } from '../../model/hero';
import type { MoneyBreakdown } from '../../model/money';
import type { StatBlock } from '../../model/statBlock';
import { hireCostForCompanySize, splitCopper } from '../../systems/economy';
import { experienceToNextLevel } from '../../systems/progression';
import { healthFractionAt, isDowned, secondsToFullHealth } from '../../systems/recovery';
import { runOfHero } from '../runStatus';
import { computeHeroPower, computeHeroStats } from '../../systems/stats';

export interface HeroView {
  stats: StatBlock;
  currentHp: number;
  healthFraction: number;
  isDowned: boolean;
  secondsToRevive: number;
  secondsToFullHealth: number;
  experienceToNextLevel: number;
  power: number;
  damagePerSecond: number;
}

export interface TavernOffer {
  classId: ClassId;
  cost: number;
  isAffordable: boolean;
}

export function describeMoney(totalCopper: number): MoneyBreakdown {
  return splitCopper(totalCopper);
}

// A hero in a run keeps the health it started with. Everyone else regenerates with the clock.
export function describeHero(state: GameState, hero: Hero, nowMs: number): HeroView {
  const stats = computeHeroStats(hero);
  const isAway = runOfHero(state, hero.id) !== undefined;
  const healthFraction = isAway ? hero.healthFraction : healthFractionAt(hero, nowMs);
  const downed = !isAway && isDowned(hero, nowMs);
  return {
    stats,
    currentHp: Math.round(stats.hp * healthFraction),
    healthFraction,
    isDowned: downed,
    secondsToRevive: downed ? Math.ceil(((hero.downedUntilMs ?? nowMs) - nowMs) / 1000) : 0,
    secondsToFullHealth: isAway ? 0 : secondsToFullHealth(hero, nowMs),
    experienceToNextLevel: experienceToNextLevel(hero.level),
    power: computeHeroPower(hero),
    damagePerSecond: hero.statistics.secondsFought > 0 ? hero.statistics.damageDealt / hero.statistics.secondsFought : 0,
  };
}

export function listTavernOffers(state: GameState): TavernOffer[] {
  const cost = hireCostForCompanySize(state.company.length);
  if (cost === null) return [];
  return CLASSES.map((classDefinition) => ({
    classId: classDefinition.id,
    cost,
    isAffordable: state.copper >= cost,
  }));
}
