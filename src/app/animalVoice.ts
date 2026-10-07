import { playSound } from '../audio';
import { ANIMAL_SOUNDS } from '../content/audio';
import type { AnimalVoice } from '../render/animalPetting';

const DELAY_BETWEEN_PETTED_SOUNDS_SECONDS = 0.05;

// A rare call is one sound. A petted animal plays every sound of its happy reaction.
export const playAnimalVoice: AnimalVoice = (kind, mood) => {
  const sounds = ANIMAL_SOUNDS[kind];
  if (!sounds) return;
  if (mood === 'idle') {
    playSound(sounds.idle[Math.floor(Math.random() * sounds.idle.length)] as string);
    return;
  }
  sounds.petted.forEach((effectId, index) => playSound(effectId, index * DELAY_BETWEEN_PETTED_SOUNDS_SECONDS));
};
