import {
  HEAL_BETWEEN_ENCOUNTERS_FRACTION,
  PARTY_WEAKENED_BELOW_AVERAGE_HEALTH,
} from '../../content/balance/dungeonRun';
import type { BattleUnit } from '../../model/battle';
import type { DungeonRun, EncounterResult, GameState, HeroEncounterResult } from '../../model/gameState';
import type { Hero } from '../../model/hero';
import { addMaterials, combineMaterialQuantities } from '../../systems/inventory';
import { rollMonsterLoot, type LootRoll } from '../../systems/loot';
import { applyExperience, experienceForKill } from '../../systems/progression';
import { encounterRandomFor, planNextEncounter, type PlannedEncounter } from '../encounterPlanner';
import { summariseHeroPerformance, type HeroPerformance } from '../encounterStatistics';
import { CommandRejected, type Command } from '../gameStore';
import { activeRunOf } from '../runStatus';
import { endDungeonRun } from './endDungeonRun';

interface HeroOutcome {
  hero: Hero;
  result: HeroEncounterResult;
}

function applyOutcomeToHero(
  hero: Hero,
  performance: HeroPerformance,
  plan: PlannedEncounter,
  won: boolean,
): HeroOutcome {
  const finalUnit = plan.report.finalUnits.find((unit) => unit.id === hero.id);
  const healthFraction = finalUnit ? finalUnit.hp / finalUnit.maxHp : hero.healthFraction;
  const experienceGained = won
    ? plan.monsterUnits.reduce((total, monster) => total + experienceForKill(monster.level, hero.level, monster.rank), 0)
    : 0;
  const leveledHero = applyExperience(hero, experienceGained);
  const statistics = hero.statistics;
  return {
    hero: {
      ...leveledHero,
      healthFraction,
      statistics: {
        monstersDefeated: statistics.monstersDefeated + performance.monstersDefeated,
        damageDealt: statistics.damageDealt + performance.damageDealt,
        damageTaken: statistics.damageTaken + performance.damageTaken,
        healingDone: statistics.healingDone + performance.healingDone,
        secondsFought: statistics.secondsFought + plan.report.durationSeconds,
        battlesWon: statistics.battlesWon + (won ? 1 : 0),
        battlesLost: statistics.battlesLost + (won ? 0 : 1),
      },
    },
    result: {
      heroId: hero.id,
      damageDealt: performance.damageDealt,
      damageTaken: performance.damageTaken,
      healingDone: performance.healingDone,
      monstersDefeated: performance.monstersDefeated,
      experienceGained,
      reachedLevel: leveledHero.level > hero.level ? leveledHero.level : null,
    },
  };
}

function averageHealthFraction(heroes: readonly Hero[]): number {
  return heroes.reduce((sum, hero) => sum + hero.healthFraction, 0) / heroes.length;
}

function rollEncounterLoot(state: GameState, run: DungeonRun, monsters: readonly BattleUnit[]): LootRoll[] {
  const lootRandom = encounterRandomFor(state, run).fork('loot');
  return monsters.map((monster) => rollMonsterLoot(monster.definitionId, monster.level, lootRandom.fork(monster.id)));
}

export function finishEncounterCommand(): Command {
  return (state) => {
    const run = activeRunOf(state);
    if (run === null) throw new CommandRejected('reject.noActiveRun');

    const plan = planNextEncounter(state);
    const won = plan.report.winner === 'party';
    const performanceByHero = summariseHeroPerformance(plan.report, run.heroIds, plan.monsterUnits);
    const loot = won ? rollEncounterLoot(state, run, plan.monsterUnits) : [];
    const copperGained = loot.reduce((sum, drop) => sum + drop.copper, 0);
    const materialsDropped = loot.flatMap((drop) => drop.materials);
    const backpack = won ? addMaterials(state.backpack, materialsDropped) : { entries: state.backpack, overflow: [] };

    const outcomes = state.company
      .filter((hero) => run.heroIds.includes(hero.id))
      .map((hero) => applyOutcomeToHero(hero, performanceByHero.get(hero.id) as HeroPerformance, plan, won));
    const outcomeByHeroId = new Map(outcomes.map((outcome) => [outcome.hero.id, outcome]));
    const company = state.company.map((hero) => outcomeByHeroId.get(hero.id)?.hero ?? hero);

    const lastEncounter: EncounterResult = {
      won,
      durationSeconds: plan.report.durationSeconds,
      monsterIds: plan.monsterUnits.map((monster) => monster.definitionId),
      copperGained,
      materials: materialsDropped,
      heroes: outcomes.map((outcome) => outcome.result),
    };
    const updatedState: GameState = {
      ...state,
      copper: state.copper + copperGained,
      company,
      backpack: backpack.entries,
      dungeonRun: {
        ...run,
        encounterNumber: run.encounterNumber + 1,
        encountersWon: run.encountersWon + (won ? 1 : 0),
        copperGained: run.copperGained + copperGained,
        materialsGained: combineMaterialQuantities(run.materialsGained, materialsDropped),
        lastEncounter,
      },
    };

    if (!won) return endDungeonRun(updatedState, 'party-defeated');
    if (backpack.overflow.length > 0) return endDungeonRun(updatedState, 'backpack-full');
    const runHeroes = company.filter((hero) => run.heroIds.includes(hero.id));
    if (averageHealthFraction(runHeroes) < PARTY_WEAKENED_BELOW_AVERAGE_HEALTH) return endDungeonRun(updatedState, 'party-weakened');
    return {
      ...updatedState,
      company: company.map((hero) =>
        run.heroIds.includes(hero.id)
          ? { ...hero, healthFraction: Math.min(1, hero.healthFraction + HEAL_BETWEEN_ENCOUNTERS_FRACTION) }
          : hero,
      ),
    };
  };
}
