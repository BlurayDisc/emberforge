import { heroAfterFight } from '../../systems/recovery';
import { planNextEncounter } from '../encounterPlanner';
import { CommandRejected, type Command } from '../gameStore';
import { findActiveRun } from '../runStatus';

// Running away drops the fight: no loot, no experience, no report. The hero keeps the wounds taken until now,
// because the same seeded fight is replayed up to the moment the player left.
export function runAwayCommand(runNumber: number, elapsedSeconds: number, nowMs: number): Command {
  return (state) => {
    const run = findActiveRun(state, runNumber);
    if (!run) throw new CommandRejected('reject.noActiveRun');
    const plan = planNextEncounter(state, runNumber);
    const woundedHeroes = new Map(
      plan.partyUnits.map((unit) => {
        const healthAfterEvents = plan.report.events
          .filter((event) => event.timeSeconds <= elapsedSeconds && event.targetId === unit.id)
          .reduce((_previousHealth, event) => event.targetHpAfter, unit.hp);
        return [unit.id, healthAfterEvents / unit.maxHp] as const;
      }),
    );
    return {
      ...state,
      company: state.company.map((hero) => {
        const healthFraction = woundedHeroes.get(hero.id);
        return healthFraction === undefined ? hero : heroAfterFight(hero, healthFraction, nowMs);
      }),
      dungeonRuns: state.dungeonRuns.filter((candidate) => candidate.runNumber !== runNumber),
    };
  };
}
