import { DUNGEONS, type DungeonDefinition } from '../../content/dungeons';
import { activeRunsOf, runInDungeon, runOfHero, startDungeonRunCommand, stopDungeonRunCommand } from '../../game';
import type { DungeonRun } from '../../model/gameState';
import type { Hero } from '../../model/hero';
import { actionButton, element, percentBar } from '../dom';
import { className, heroDisplayName, listOf } from '../displayNames';
import { describeRejection, t } from '../i18n';
import { createDungeonIcon, createFightIcon } from '../iconArt';
import { createList, createListRow } from '../listRow';
import { createPortrait } from '../portraitArt';
import { focusRun } from '../runFocus';
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
  if (!result.accepted) {
    context.notify(describeRejection(result.rejection));
    return;
  }
  const startedRun = runInDungeon(context.store.getState(), dungeonId);
  if (startedRun) focusRun(startedRun.runNumber);
  context.closePanel();
}

function renderHeroChoice(context: PanelContext, hero: Hero): HTMLElement {
  const run = runOfHero(context.store.getState(), hero.id);
  const isSelected = selectedHeroIds.includes(hero.id);
  const status = run
    ? element('div', 'card-text small busy-note', t('heroes.awayIn', { dungeon: t(`dungeon.${run.dungeonId}`) }))
    : percentBar(hero.healthFraction, 'bar-health');
  const entry = createListRow({
    art: createPortrait(hero.classId, hero.name, 2),
    title: heroDisplayName(hero.name),
    lines: [element('div', 'card-text small', t('heroes.levelShort', { className: className(hero.classId), level: hero.level })), status],
    className: `hero-choice${isSelected ? ' selected' : ''}${run ? ' busy' : ''}`,
  });
  if (!run) {
    entry.addEventListener('click', () => {
      toggleHero(hero.id, Math.max(...DUNGEONS.map((dungeon) => dungeon.maxPartySize)));
      context.requestRender();
    });
  }
  return entry;
}

function renderFreeDungeon(context: PanelContext, dungeon: DungeonDefinition): HTMLElement {
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
    actions: [actionButton(t('dungeons.start'), () => start(context, dungeon.id), { disabled: !hasValidSelection })],
  });
}

function renderBusyDungeon(context: PanelContext, dungeon: DungeonDefinition, run: DungeonRun): HTMLElement {
  const state = context.store.getState();
  const heroNames = run.heroIds.flatMap((heroId) => {
    const hero = state.company.find((candidate) => candidate.id === heroId);
    return hero ? [heroDisplayName(hero.name)] : [];
  });
  const art = element('div', 'fight-art', createDungeonIcon(dungeon.id, 3), element('span', 'fight-badge', createFightIcon(2)));
  return createListRow({
    art,
    title: t('dungeons.title', { name: t(`dungeon.${dungeon.id}`), boss: dungeon.bossMonsterId ? t('dungeons.bossTag') : '', level: dungeon.level }),
    lines: [
      element('div', 'fight-status', t('dungeons.underFight')),
      element('div', 'card-text small', t('dungeons.fightingHeroes', { heroes: listOf(heroNames) })),
      element('div', 'card-text small', t('run.fightsWon', { count: run.encountersWon })),
    ],
    actions: [
      actionButton(t('dungeons.watch'), () => {
        focusRun(run.runNumber);
        context.closePanel();
      }, { className: 'action-button primary' }),
      actionButton(t('dungeons.stop'), () => context.store.execute(stopDungeonRunCommand(run.runNumber)), { className: 'action-button danger' }),
    ],
    className: 'fighting',
  });
}

export const renderDungeonsPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const body = element('div', 'panel-body');
  selectedHeroIds = selectedHeroIds.filter((heroId) => state.company.some((hero) => hero.id === heroId) && !runOfHero(state, heroId));
  const firstFreeHero = state.company.find((hero) => !runOfHero(state, hero.id));
  if (selectedHeroIds.length === 0 && firstFreeHero) selectedHeroIds = [firstFreeHero.id];

  if (state.company.length === 0) {
    body.append(element('p', 'hint', t('dungeons.noHeroes')));
  } else {
    body.append(
      element('div', 'section-title', t('dungeons.pickHero')),
      createList(...state.company.map((hero) => renderHeroChoice(context, hero))),
    );
  }
  const dungeons = DUNGEONS.filter((dungeon) => dungeon.townId === state.townId);
  body.append(
    createList(
      ...dungeons.map((dungeon) => {
        const run = runInDungeon(state, dungeon.id);
        return run ? renderBusyDungeon(context, dungeon, run) : renderFreeDungeon(context, dungeon);
      }),
    ),
  );
  if (activeRunsOf(state).length > 0) body.append(element('p', 'hint', t('dungeons.multitaskHint')));
  return body;
};
