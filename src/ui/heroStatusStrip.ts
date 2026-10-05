import { runOfHero, type GameStore } from '../game';
import type { Hero } from '../model/hero';
import { element } from './dom';
import { heroDisplayName } from './displayNames';
import { createLiveHealthBar } from './liveBars';
import { addLiveUpdate } from './liveUpdate';
import { createPortrait } from './portraitArt';

// One small chip for each hero. A hero in a fight has a gold frame. A tap opens the Heroes panel.
function createHeroChip(store: GameStore, hero: Hero, openHeroes: () => void): HTMLElement {
  const chip = element('button', 'hero-chip', createPortrait(hero.classId, hero.name, 1), element('div', 'hero-chip-text', element('div', 'hero-chip-name', heroDisplayName(hero.name)), createLiveHealthBar(store, hero.id, { showsTimeNote: false })));
  chip.type = 'button';
  chip.addEventListener('click', openHeroes);
  addLiveUpdate(chip, () => chip.classList.toggle('away', runOfHero(store.getState(), hero.id) !== undefined));
  return chip;
}

// The panel that shows the strip redraws on every state change, so the strip needs no subscription of its own.
export function createTeamStrip(store: GameStore, openHeroes: () => void): HTMLElement {
  return element('div', 'hero-strip', ...store.getState().company.map((hero) => createHeroChip(store, hero, openHeroes)));
}
