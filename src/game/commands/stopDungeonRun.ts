import { CommandRejected, type Command } from '../gameStore';
import { findActiveRun } from '../runStatus';

// Stopping a run drops the fight: no loot, no experience, no report.
export function stopDungeonRunCommand(runNumber: number): Command {
  return (state) => {
    const run = findActiveRun(state, runNumber);
    if (!run) throw new CommandRejected('reject.noActiveRun');
    return {
      ...state,
      dungeonRuns: state.dungeonRuns.filter((candidate) => candidate.runNumber !== runNumber),
    };
  };
}
