import { CLASSES } from '../../content/classes';
import type { BattleUnit } from '../../model/battle';
import type { GameState } from '../../model/gameState';
import type { ClassId, Hero } from '../../model/hero';
import type { MoneyBreakdown } from '../../model/money';
import type { StatBlock } from '../../model/statBlock';
import { hireCostForCompanySize, splitCopper } from '../../systems/economy';
import { experienceToNextLevel } from '../../systems/progression';
import { computeHeroStats, heroToBattleUnit } from '../../systems/stats';

export interface HeroView {
  stats: StatBlock;
  currentHp: number;
  experienceToNextLevel: number;
}

export interface TavernOffer {
  classId: ClassId;
  cost: number;
  isAffordable: boolean;
}

export function describeMoney(totalCopper: number): MoneyBreakdown {
  return splitCopper(totalCopper);
}

export function describeHero(hero: Hero): HeroView {
  const stats = computeHeroStats(hero);
  return {
    stats,
    currentHp: Math.round(stats.hp * hero.healthFraction),
    experienceToNextLevel: experienceToNextLevel(hero.level),
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

export function listPartyBattleUnits(state: GameState): BattleUnit[] {
  return state.partyHeroIds.flatMap((heroId) => {
    const hero = state.company.find((candidate) => candidate.id === heroId);
    return hero ? [heroToBattleUnit(hero)] : [];
  });
}
