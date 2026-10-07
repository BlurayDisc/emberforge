import type { Random } from '../kernel/random';
import type { AnimalKind } from './animalArt';
import type { AnimalVoice } from './animalPetting';

const MINIMUM_SECONDS_BETWEEN_CALLS = 25;
const MAXIMUM_SECONDS_BETWEEN_CALLS = 60;

export interface AnimalChatter {
  update(elapsedSeconds: number): void;
}

// Now and then one animal that the player can see makes a small sound. It is rare, so it stays a treat.
export function createAnimalChatter(random: Random, voice: AnimalVoice, visibleKinds: () => readonly AnimalKind[], isQuiet: () => boolean): AnimalChatter {
  let nextCallAtSeconds: number | null = null;
  return {
    update: (elapsedSeconds) => {
      if (nextCallAtSeconds === null) nextCallAtSeconds = elapsedSeconds + random.nextInt(MINIMUM_SECONDS_BETWEEN_CALLS, MAXIMUM_SECONDS_BETWEEN_CALLS);
      if (elapsedSeconds < nextCallAtSeconds) return;
      nextCallAtSeconds = elapsedSeconds + random.nextInt(MINIMUM_SECONDS_BETWEEN_CALLS, MAXIMUM_SECONDS_BETWEEN_CALLS);
      const kinds = visibleKinds();
      if (isQuiet() || kinds.length === 0) return;
      voice(random.pick(kinds), 'idle');
    },
  };
}
