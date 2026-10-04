import { CommandRejected, type Command } from '../gameStore';
import { dismissReportCommand } from './dismissReport';
import { startDungeonRunCommand } from './startDungeonRun';

// The same heroes go into the same dungeon again. The report counts as read.
// If the start is rejected (a hero is down, the dungeon holds loot), the whole command is rejected and the report stays.
export function repeatDungeonRunCommand(runNumber: number, nowMs: number): Command {
  return (state) => {
    const report = state.reports.find((candidate) => candidate.runNumber === runNumber);
    if (!report) throw new CommandRejected('reject.reportMissing');
    const heroIds = report.result.heroes.map((hero) => hero.heroId);
    return startDungeonRunCommand(report.dungeonId, heroIds, nowMs)(dismissReportCommand(runNumber)(state));
  };
}
