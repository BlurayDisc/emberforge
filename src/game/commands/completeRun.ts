import type { BattleUnit } from '../../model/battle';
import type { EncounterResult, GameState, HeroEncounterResult } from '../../model/gameState';
import type { Hero } from '../../model/hero';
import type { Item } from '../../model/item';
import { findRecipe } from '../../systems/crafting';
import { addItem, addMaterials } from '../../systems/inventory';
import { generateCraftedItem } from '../../systems/items';
import { rollMonsterLoot, type LootRoll } from '../../systems/loot';
import { heroAfterFight } from '../../systems/recovery';
import { applyExperience } from '../../systems/progression';
import { experienceForDefeatedMonsters } from '../encounterExperience';
import { encounterRandomFor, planNextEncounter, type PlannedEncounter } from '../encounterPlanner';
import { summariseHeroPerformance, type HeroPerformance } from '../encounterStatistics';
import { CommandRejected, type Command } from '../gameStore';
import { craftingCostCopperOf, ingredientCountOf } from '../recipeCost';
import { backpackRowsOf } from '../storage';
import { findActiveRun } from '../runStatus';
import type { DungeonRun } from '../../model/gameState';

interface HeroOutcome {
  hero: Hero;
  result: HeroEncounterResult;
}

function healthLostOf(hero: Hero, plan: PlannedEncounter): { healthLost: number; maxHealth: number } {
  const before = plan.partyUnits.find((candidate) => candidate.id === hero.id);
  const after = plan.report.finalUnits.find((candidate) => candidate.id === hero.id);
  return before && after ? { healthLost: Math.max(0, Math.round(before.hp - after.hp)), maxHealth: Math.round(before.maxHp) } : { healthLost: 0, maxHealth: 1 };
}

function finalHealthFractionOf(hero: Hero, plan: PlannedEncounter): number {
  const unit = plan.report.finalUnits.find((candidate) => candidate.id === hero.id);
  return unit ? unit.hp / unit.maxHp : 1;
}

function applyOutcomeToHero(hero: Hero, performance: HeroPerformance, plan: PlannedEncounter, won: boolean, nowMs: number): HeroOutcome {
  const experienceGained = won ? experienceForDefeatedMonsters(plan.monsterUnits, hero.level) : 0;
  const leveledHero = applyExperience(hero, experienceGained);
  const statistics = hero.statistics;
  return {
    // Wounds stay. The hero regenerates over time, or is downed for a while at 0 health.
    hero: {
      ...heroAfterFight(leveledHero, finalHealthFractionOf(hero, plan), nowMs),
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
      levelAfter: leveledHero.level,
      experienceAfter: leveledHero.experience,
      ...healthLostOf(hero, plan),
    },
  };
}

// A dropped item is made like a crafted one: priced from its basic recipe, with the quality that the monster fixes.
function buildDroppedItems(state: GameState, run: DungeonRun, loot: readonly LootRoll[]): Item[] {
  const itemRandom = encounterRandomFor(state, run).fork('loot-items');
  return loot.flatMap((drop, monsterIndex) =>
    drop.items.map((dropped, itemIndex) => {
      const recipe = findRecipe(dropped.baseId, 1);
      if (!recipe) throw new Error(`A monster drops '${dropped.baseId}', which has no tier 1 recipe`);
      return generateCraftedItem(
        {
          itemId: `drop-${run.runNumber}-${monsterIndex}-${itemIndex}`,
          baseId: dropped.baseId,
          tier: 1,
          setMaterialId: null,
          itemLevel: dropped.itemLevel,
          upgradeLevel: 0,
          craftingCostCopper: craftingCostCopperOf(recipe),
          ingredientCount: ingredientCountOf(recipe),
          quality: dropped.quality,
        },
        itemRandom.fork(`${monsterIndex}-${itemIndex}`),
      );
    }),
  );
}

function rollRunLoot(state: GameState, run: DungeonRun, monsters: readonly BattleUnit[]): LootRoll[] {
  const lootRandom = encounterRandomFor(state, run).fork('loot');
  return monsters.map((monster) => rollMonsterLoot(monster.definitionId, lootRandom.fork(monster.id)));
}

export function completeRunCommand(runNumber: number, nowMs: number): Command {
  return (state) => {
    const run = findActiveRun(state, runNumber);
    if (!run) throw new CommandRejected('reject.noActiveRun');

    // The fight is simulated again from the saved seed, so the report matches the fight the player watched.
    const plan = planNextEncounter(state, runNumber);
    const won = plan.report.winner === 'party';
    const performanceByHero = summariseHeroPerformance(plan.report, run.heroIds, plan.monsterUnits);
    const loot = won ? rollRunLoot(state, run, plan.monsterUnits) : [];
    const materialsDropped = loot.flatMap((drop) => drop.materials);
    const backpack = addMaterials(state.backpack, materialsDropped, backpackRowsOf(state));
    const itemsDropped = buildDroppedItems(state, run, loot);
    let backpackEntries = backpack.entries;
    const itemsWaiting: Item[] = [];
    for (const item of itemsDropped) {
      const withItem = addItem(backpackEntries, item, backpackRowsOf(state));
      if (withItem === null) itemsWaiting.push(item);
      else backpackEntries = withItem;
    }

    const outcomes = state.company
      .filter((hero) => run.heroIds.includes(hero.id))
      .map((hero) => applyOutcomeToHero(hero, performanceByHero.get(hero.id) as HeroPerformance, plan, won, nowMs));
    const outcomeByHeroId = new Map(outcomes.map((outcome) => [outcome.hero.id, outcome]));

    const result: EncounterResult = {
      won,
      durationSeconds: plan.report.durationSeconds,
      monsterIds: plan.monsterUnits.map((monster) => monster.definitionId),
      materials: materialsDropped,
      materialsWaiting: backpack.overflow,
      items: itemsDropped,
      itemsWaiting,
      heroes: outcomes.map((outcome) => outcome.result),
    };
    const firstClear = won && !state.clearedDungeonIds.includes(run.dungeonId);
    return {
      ...state,
      company: state.company.map((hero) => outcomeByHeroId.get(hero.id)?.hero ?? hero),
      backpack: backpackEntries,
      pendingLoot: backpack.overflow.length > 0 ? { ...state.pendingLoot, [run.dungeonId]: backpack.overflow } : state.pendingLoot,
      pendingItems: itemsWaiting.length > 0 ? { ...state.pendingItems, [run.dungeonId]: [...(state.pendingItems[run.dungeonId] ?? []), ...itemsWaiting] } : state.pendingItems,
      dungeonRuns: state.dungeonRuns.filter((candidate) => candidate.runNumber !== runNumber),
      reports: [...state.reports, { runNumber, dungeonId: run.dungeonId, result, firstClear }],
      clearedDungeonIds: firstClear ? [...state.clearedDungeonIds, run.dungeonId] : state.clearedDungeonIds,
    };
  };
}
