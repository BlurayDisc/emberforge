import { CommandRejected, type Command } from '../gameStore';
import { findActiveRun } from '../runStatus';
import { endDungeonRun } from './endDungeonRun';

export function stopDungeonRunCommand(runNumber: number): Command {
  return (state) => {
    if (!findActiveRun(state, runNumber)) throw new CommandRejected('reject.noActiveRun');
    return endDungeonRun(state, runNumber, 'stopped');
  };
}
