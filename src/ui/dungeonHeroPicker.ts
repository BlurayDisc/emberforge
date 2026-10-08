import type { DungeonDefinition } from '../content/dungeons';
import { describeHero, runOfHero, type GameStore } from '../game';
import type { Hero } from '../model/hero';
import { element } from './dom';
import { className, heroDisplayName } from './displayNames';
import { t } from './i18n';
import { createLiveHealthBar } from './liveBars';
import { addLiveUpdate, formatDuration } from './liveUpdate';
import { createPortrait } from './portraitArt';
import { createSkeletonPortrait } from './skeletonPortrait';

export interface DungeonHeroPicker {
  element: HTMLElement;
  selectedHeroIds(): string[];
  rememberSelection(): void;
  canFight(): boolean;
}

// A hero in another run or a down hero cannot go. A dungeon for one hero also needs a hero at the dungeon level.
// A party dungeon needs only one hero at the dungeon level, so a weaker partner can join the fight.
function isHeroDown(store: GameStore, hero: Hero): boolean {
  return describeHero(store.getState(), hero, Date.now()).isDowned;
}

function downTimerLine(store: GameStore, hero: Hero): HTMLElement {
  const line = element('div', 'card-text small danger-text');
  addLiveUpdate(line, () => {
    const view = describeHero(store.getState(), hero, Date.now());
    line.textContent = t('heroes.downed', { time: formatDuration(view.secondsToRevive) });
  });
  return line;
}

function isHeroSelectable(store: GameStore, hero: Hero, dungeon: DungeonDefinition): boolean {
  if (runOfHero(store.getState(), hero.id) !== undefined) return false;
  if (isHeroDown(store, hero)) return false;
  return dungeon.minimumPartySize > 1 || hero.level >= dungeon.minimumHeroLevel;
}

function statusLine(store: GameStore, hero: Hero, dungeon: DungeonDefinition): HTMLElement {
  const run = runOfHero(store.getState(), hero.id);
  if (run) return element('div', 'card-text small busy-note', t('heroes.awayIn', { dungeon: t(`dungeon.${run.dungeonId}`) }));
  if (isHeroDown(store, hero)) return downTimerLine(store, hero);
  if (dungeon.minimumPartySize === 1 && hero.level < dungeon.minimumHeroLevel) return element('div', 'card-text small level-low', t('dungeons.heroTooLow', { level: dungeon.minimumHeroLevel }));
  return createLiveHealthBar(store, hero.id, { showsTimeNote: false });
}

// The heroes of the last fight in each dungeon. The picker chooses them again, so a repeat fight needs no tap on a hero. Lost on reload.
const heroIdsOfLastFight = new Map<string, string[]>();

// One tap selects the hero for a single-hero dungeon (a new tap moves the choice). A party dungeon toggles heroes up to the party size.
// The first free hero is chosen already for a single-hero dungeon, so the usual fight needs one tap on Fight.
export function createDungeonHeroPicker(store: GameStore, dungeon: DungeonDefinition, onChange: () => void): DungeonHeroPicker {
  const heroes = store.getState().company;
  const selectedIds: string[] = [];
  const isParty = dungeon.minimumPartySize > 1;
  const tiles = new Map<string, HTMLElement>();

  const hint = element('div', 'card-text small', isParty ? '' : t('dungeons.pickHero'));
  const markSelection = (): void => {
    tiles.forEach((tile, heroId) => tile.classList.toggle('selected', selectedIds.includes(heroId)));
    if (isParty) hint.textContent = t('dungeons.partySelected', { selected: selectedIds.length, count: dungeon.minimumPartySize });
  };
  const refresh = (): void => {
    markSelection();
    onChange();
  };

  const choose = (hero: Hero): void => {
    const position = selectedIds.indexOf(hero.id);
    if (position >= 0) selectedIds.splice(position, 1);
    else if (isParty && selectedIds.length < dungeon.maxPartySize) selectedIds.push(hero.id);
    else if (!isParty) selectedIds.splice(0, selectedIds.length, hero.id);
    refresh();
  };

  heroes.forEach((hero) => {
    const isSelectable = isHeroSelectable(store, hero, dungeon);
    const tile = element(
      'div',
      `dungeon-hero${isSelectable ? '' : ' busy'}`,
      isHeroDown(store, hero) ? createSkeletonPortrait(2) : createPortrait(hero.classId, hero.name, 2),
      element(
        'div',
        'dungeon-hero-text',
        element('div', 'card-title', heroDisplayName(hero.name)),
        element('div', 'card-text small', t('heroes.levelShort', { className: className(hero.classId), level: hero.level })),
        statusLine(store, hero, dungeon),
      ),
    );
    if (isSelectable) tile.addEventListener('click', () => choose(hero));
    tiles.set(hero.id, tile);
  });
  const heroesOfLastFight = heroes.filter((hero) => heroIdsOfLastFight.get(dungeon.id)?.includes(hero.id) && isHeroSelectable(store, hero, dungeon));
  const firstSelectable = heroes.find((hero) => isHeroSelectable(store, hero, dungeon));
  if (heroesOfLastFight.length > 0) selectedIds.push(...heroesOfLastFight.slice(0, dungeon.maxPartySize).map((hero) => hero.id));
  else if (!isParty && firstSelectable) selectedIds.push(firstSelectable.id);

  const grid = element('div', 'dungeon-hero-grid', ...tiles.values());
  markSelection();
  return {
    element: element('div', 'dungeon-heroes', element('div', 'section-title', t('dungeons.team')), hint, grid),
    selectedHeroIds: () => [...selectedIds],
    rememberSelection: () => heroIdsOfLastFight.set(dungeon.id, [...selectedIds]),
    canFight: () => {
      const selectedHeroes = heroes.filter((hero) => selectedIds.includes(hero.id));
      return selectedHeroes.length >= dungeon.minimumPartySize && selectedHeroes.some((hero) => hero.level >= dungeon.minimumHeroLevel);
    },
  };
}
