import type { BattleUnit } from '../../model/battle';
import type { EncounterResult, GameState, HeroEncounterResult } from '../../model/gameState';
import type { Hero } from '../../model/hero';
import { addMaterials } from '../../systems/inventory';
import { rollMonsterLoot, type LootRoll } from '../../systems/loot';
import { applyExperience, experienceForKill } from '../../systems/progression';
import { encounterRandomFor, planNextEncounter, type PlannedEncounter } from '../encounterPlanner';
import { summariseHeroPerformance, type HeroPerformance } from '../encounterStatistics';
import { CommandRejected, type Command } from '../gameStore';
import { findActiveRun } from '../runStatus';
import type { DungeonRun } from '../../model/gameState';

interface HeroOutcome {
  hero: Hero;
  result: HeroEncounterResult;
}

function applyOutcomeToHero(hero: Hero, performance: HeroPerformance, plan: PlannedEncounter, won: boolean): HeroOutcome {
  const experienceGained = won
    ? plan.monsterUnits.reduce((total, monster) => total + experienceForKill(monster.level, hero.level, monster.rank), 0)
    : 0;
  const leveledHero = applyExperience(hero, experienceGained);
  const statistics = hero.statistics;
  return {
    // Heroes rest after a run, so they start the next one at full health.
    hero: {
      ...leveledHero,
      healthFraction: 1,
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

function rollRunLoot(state: GameState, run: DungeonRun, monsters: readonly BattleUnit[]): LootRoll[] {
  const lootRandom = encounterRandomFor(state, run).fork('loot');
  return monsters.map((monster) => rollMonsterLoot(monster.definitionId, monster.level, lootRandom.fork(monster.id)));
}

export function completeRunCommand(runNumber: number): Command {
  return (state) => {
    const run = findActiveRun(state, runNumber);
    if (!run) throw new CommandRejected('reject.noActiveRun');

    // The fight is simulated again from the saved seed, so the report matches the fight the player watched.
    const plan = planNextEncounter(state, runNumber);
    const won = plan.report.winner === 'party';
    const performanceByHero = summariseHeroPerformance(plan.report, run.heroIds, plan.monsterUnits);
    const loot = won ? rollRunLoot(state, run, plan.monsterUnits) : [];
    const copperGained = loot.reduce((sum, drop) => sum + drop.copper, 0);
    const materialsDropped = loot.flatMap((drop) => drop.materials);
    const backpack = addMaterials(state.backpack, materialsDropped);

    const outcomes = state.company
      .filter((hero) => run.heroIds.includes(hero.id))
      .map((hero) => applyOutcomeToHero(hero, performanceByHero.get(hero.id) as HeroPerformance, plan, won));
    const outcomeByHeroId = new Map(outcomes.map((outcome) => [outcome.hero.id, outcome]));

    const result: EncounterResult = {
      won,
      durationSeconds: plan.report.durationSeconds,
      monsterIds: plan.monsterUnits.map((monster) => monster.definitionId),
      copperGained,
      materials: materialsDropped,
      materialsLost: backpack.overflow,
      heroes: outcomes.map((outcome) => outcome.result),
    };
    const firstClear = won && !state.clearedDungeonIds.includes(run.dungeonId);
    return {
      ...state,
      copper: state.copper + copperGained,
      company: state.company.map((hero) => outcomeByHeroId.get(hero.id)?.hero ?? hero),
      backpack: backpack.entries,
      dungeonRuns: state.dungeonRuns.filter((candidate) => candidate.runNumber !== runNumber),
      reports: [...state.reports, { runNumber, dungeonId: run.dungeonId, result, firstClear }],
      clearedDungeonIds: firstClear ? [...state.clearedDungeonIds, run.dungeonId] : state.clearedDungeonIds,
    };
  };
}
