import { CommandRejected, type Command } from '../gameStore';
import { activeRunOf } from '../runStatus';
import { endDungeonRun } from './endDungeonRun';

export function stopDungeonRunCommand(): Command {
  return (state) => {
    if (activeRunOf(state) === null) throw new CommandRejected('There is no active dungeon run.');
    return endDungeonRun(state, 'stopped');
  };
}
