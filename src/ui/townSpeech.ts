import type { GameStore } from '../game';
import { LOGICAL_HEIGHT, TOWN_WIDTH } from '../kernel/stageSize';
import { element } from './dom';
import { focusedRunNumber, onRunFocusChange } from './runFocus';
import { pickTownTalk } from './townTalk';

export interface TownSpeech {
  element: HTMLElement;
  show(position: { x: number; y: number } | null): void;
}

// A speech bubble above a villager. The render layer says where, and this code picks the words.
export function createTownSpeech(store: GameStore): TownSpeech {
  const bubble = element('div', 'speech-bubble');
  bubble.style.display = 'none';

  onRunFocusChange(() => {
    if (focusedRunNumber() !== null) bubble.style.display = 'none';
  });

  return {
    element: bubble,
    show: (position) => {
      if (position === null || focusedRunNumber() !== null) {
        bubble.style.display = 'none';
        return;
      }
      bubble.textContent = pickTownTalk(store.getState());
      bubble.style.left = `${(position.x / TOWN_WIDTH) * 100}%`;
      bubble.style.top = `${(position.y / LOGICAL_HEIGHT) * 100}%`;
      bubble.style.display = 'block';
    },
  };
}
