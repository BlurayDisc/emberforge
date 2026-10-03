import { DUNGEONS } from '../content/dungeons';
import { requireById } from '../content/lookup';
import { createRandom, type Random } from '../kernel/random';
import type { BattleReport, BattleUnit } from '../model/battle';
import type { DungeonRun, GameState } from '../model/gameState';
import { simulateBattle } from '../systems/battle';
import { createEncounter } from '../systems/dungeons';
import { heroToBattleUnit } from '../systems/stats';
import { findActiveRun } from './runStatus';

export interface PlannedEncounter {
  partyUnits: BattleUnit[];
  monsterUnits: BattleUnit[];
  report: BattleReport;
}

export function encounterRandomFor(state: GameState, run: DungeonRun): Random {
  return createRandom(state.seed).fork(`run-${run.runNumber}`);
}

export function planNextEncounter(state: GameState, runNumber: number): PlannedEncounter {
  const run = findActiveRun(state, runNumber);
  if (!run) throw new Error(`There is no active dungeon run ${runNumber}`);

  const dungeon = requireById(DUNGEONS, run.dungeonId);
  const random = encounterRandomFor(state, run);
  const partyUnits = run.heroIds.map((heroId) => {
    const hero = state.company.find((candidate) => candidate.id === heroId);
    if (!hero) throw new Error(`Run hero is missing from the company: ${heroId}`);
    return heroToBattleUnit(hero);
  });
  const monsterUnits = createEncounter(dungeon, partyUnits.length, random.fork('monsters'));
  const report = simulateBattle([...partyUnits, ...monsterUnits], random.fork('battle'));
  return { partyUnits, monsterUnits, report };
}
