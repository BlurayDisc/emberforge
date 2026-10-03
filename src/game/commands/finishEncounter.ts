import {
  HEAL_BETWEEN_ENCOUNTERS_FRACTION,
  PARTY_WEAKENED_BELOW_AVERAGE_HEALTH,
} from '../../content/balance/dungeonRun';
import type { BattleUnit } from '../../model/battle';
import type { GameState } from '../../model/gameState';
import type { Hero } from '../../model/hero';
import { addMaterials, combineMaterialQuantities } from '../../systems/inventory';
import { rollMonsterLoot } from '../../systems/loot';
import { applyExperience, experienceForKill } from '../../systems/progression';
import { encounterRandomFor, planNextEncounter, type PlannedEncounter } from '../encounterPlanner';
import { CommandRejected, type Command } from '../gameStore';
import { activeRunOf } from '../runStatus';
import { endDungeonRun } from './endDungeonRun';

function applyBattleOutcomeToHero(hero: Hero, finalUnits: readonly BattleUnit[], defeatedMonsters: readonly BattleUnit[]): Hero {
  const finalUnit = finalUnits.find((unit) => unit.id === hero.id);
  const healthFraction = finalUnit ? finalUnit.hp / finalUnit.maxHp : hero.healthFraction;
  const gainedExperience = defeatedMonsters.reduce(
    (total, monster) => total + experienceForKill(monster.level, hero.level, monster.rank),
    0,
  );
  return { ...applyExperience(hero, gainedExperience), healthFraction };
}

function averageHealthFraction(heroes: readonly Hero[]): number {
  return heroes.reduce((sum, hero) => sum + hero.healthFraction, 0) / heroes.length;
}

function healBetweenEncounters(hero: Hero): Hero {
  return { ...hero, healthFraction: Math.min(1, hero.healthFraction + HEAL_BETWEEN_ENCOUNTERS_FRACTION) };
}

function applyVictory(state: GameState, plan: PlannedEncounter): GameState {
  const run = activeRunOf(state);
  if (run === null) throw new CommandRejected('reject.noActiveRun');

  const lootRandom = encounterRandomFor(state, run).fork('loot');
  const loot = plan.monsterUnits.map((monster) => rollMonsterLoot(monster.definitionId, monster.level, lootRandom.fork(monster.id)));
  const copperGained = loot.reduce((sum, drop) => sum + drop.copper, 0);
  const materialsDropped = loot.flatMap((drop) => drop.materials);
  const backpack = addMaterials(state.backpack, materialsDropped);

  const company = state.company.map((hero) =>
    state.partyHeroIds.includes(hero.id) ? applyBattleOutcomeToHero(hero, plan.report.finalUnits, plan.monsterUnits) : hero,
  );
  const party = company.filter((hero) => state.partyHeroIds.includes(hero.id));

  const updatedState: GameState = {
    ...state,
    copper: state.copper + copperGained,
    company,
    backpack: backpack.entries,
    dungeonRun: {
      ...run,
      encounterNumber: run.encounterNumber + 1,
      encountersWon: run.encountersWon + 1,
      copperGained: run.copperGained + copperGained,
      materialsGained: combineMaterialQuantities(run.materialsGained, materialsDropped),
    },
  };

  if (backpack.overflow.length > 0) return endDungeonRun(updatedState, 'backpack-full');
  if (averageHealthFraction(party) < PARTY_WEAKENED_BELOW_AVERAGE_HEALTH) return endDungeonRun(updatedState, 'party-weakened');
  return {
    ...updatedState,
    company: updatedState.company.map((hero) => (state.partyHeroIds.includes(hero.id) ? healBetweenEncounters(hero) : hero)),
  };
}

export function finishEncounterCommand(): Command {
  return (state) => {
    if (activeRunOf(state) === null) throw new CommandRejected('reject.noActiveRun');
    const plan = planNextEncounter(state);
    if (plan.report.winner === 'enemy') return endDungeonRun(state, 'party-defeated');
    return applyVictory(state, plan);
  };
}
