import { createRandom } from '../../kernel/random';
import { produceMillMaterials } from '../../systems/mill';
import { CommandRejected, type Command } from '../gameStore';

export function produceMillMaterialsCommand(nowMs: number): Command {
  return (state) => {
    const mill = produceMillMaterials(state.mill, nowMs, createRandom(state.seed));
    if (mill === null) throw new CommandRejected('reject.nothingDue');
    return { ...state, mill };
  };
}
