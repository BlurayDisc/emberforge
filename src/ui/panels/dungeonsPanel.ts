import { DUNGEONS, type DungeonDefinition } from '../../content/dungeons';
import { activeRunOf, startDungeonRunCommand, stopDungeonRunCommand } from '../../game';
import type { Hero } from '../../model/hero';
import { actionButton, element, percentBar } from '../dom';
import { className, heroDisplayName, listOf } from '../displayNames';
import { describeRejection, t } from '../i18n';
import { createDungeonIcon } from '../iconArt';
import { createList, createListRow } from '../listRow';
import { createPortrait } from '../portraitArt';
import { createRunSummaryCard } from '../runSummary';
import type { PanelContext, PanelRenderer } from './panelContext';

let selectedHeroIds: string[] = [];

function monsterNamesOf(dungeon: DungeonDefinition): string {
  const ids = [...dungeon.monsterIds, ...(dungeon.bossMonsterId ? [dungeon.bossMonsterId] : [])];
  return listOf(ids.map((id) => t(`monster.${id}`)));
}

function toggleHero(heroId: string, maximumHeroes: number): void {
  if (selectedHeroIds.includes(heroId)) {
    selectedHeroIds = selectedHeroIds.filter((selectedId) => selectedId !== heroId);
    return;
  }
  selectedHeroIds = maximumHeroes === 1 ? [heroId] : [...selectedHeroIds, heroId].slice(-maximumHeroes);
}

function start(context: PanelContext, dungeonId: string): void {
  const result = context.store.execute(startDungeonRunCommand(dungeonId, selectedHeroIds));
  if (result.accepted) context.closePanel();
  else context.notify(describeRejection(result.rejection));
}

function renderHeroChoice(context: PanelContext, hero: Hero, isRunning: boolean): HTMLElement {
  const isSelected = selectedHeroIds.includes(hero.id);
  const entry = createListRow({
    art: createPortrait(hero.classId, hero.name, 2),
    title: heroDisplayName(hero.name),
    lines: [element('div', 'card-text small', t('heroes.levelShort', { className: className(hero.classId), level: hero.level })), percentBar(hero.healthFraction, 'bar-health')],
    className: `hero-choice${isSelected ? ' selected' : ''}`,
  });
  if (!isRunning) {
    entry.addEventListener('click', () => {
      toggleHero(hero.id, Math.max(...DUNGEONS.map((dungeon) => dungeon.maxPartySize)));
      context.requestRender();
    });
  }
  return entry;
}

function renderDungeon(context: PanelContext, dungeon: DungeonDefinition, canStart: boolean): HTMLElement {
  const title = t('dungeons.title', {
    name: t(`dungeon.${dungeon.id}`),
    boss: dungeon.bossMonsterId ? t('dungeons.bossTag') : '',
    level: dungeon.level,
  });
  const hasValidSelection = selectedHeroIds.length > 0 && selectedHeroIds.length <= dungeon.maxPartySize;
  return createListRow({
    art: createDungeonIcon(dungeon.id, 3),
    title,
    lines: [
      element('div', 'card-text', monsterNamesOf(dungeon)),
      element('div', 'card-text small', t('dungeons.maxHeroes', { max: dungeon.maxPartySize })),
    ],
    actions: [actionButton(t('dungeons.start'), () => start(context, dungeon.id), { disabled: !canStart || !hasValidSelection })],
  });
}

export const renderDungeonsPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const isRunning = activeRunOf(state) !== null;
  const body = element('div', 'panel-body');
  selectedHeroIds = selectedHeroIds.filter((heroId) => state.company.some((hero) => hero.id === heroId));
  if (selectedHeroIds.length === 0 && state.company[0]) selectedHeroIds = [state.company[0].id];

  const activeRun = activeRunOf(state);
  if (activeRun) {
    const stopButton = actionButton(t('dungeons.stop'), () => context.store.execute(stopDungeonRunCommand()));
    body.append(createRunSummaryCard(activeRun, [stopButton]));
  }
  if (state.company.length === 0) {
    body.append(element('p', 'hint', t('dungeons.noHeroes')));
  } else {
    body.append(
      element('div', 'section-title', t('dungeons.pickHero')),
      createList(...state.company.map((hero) => renderHeroChoice(context, hero, isRunning))),
    );
  }
  const dungeons = DUNGEONS.filter((dungeon) => dungeon.townId === state.townId);
  body.append(createList(...dungeons.map((dungeon) => renderDungeon(context, dungeon, !isRunning))));
  return body;
};
