import { DUNGEONS, type DungeonDefinition } from '../../content/dungeons';
import { requireById } from '../../content/lookup';
import { describeHero, isDungeonUnlocked, runInDungeon, runOfHero, startDungeonRunCommand, stopDungeonRunCommand } from '../../game';
import type { DungeonRun } from '../../model/gameState';
import type { Hero } from '../../model/hero';
import { actionButton, element } from '../dom';
import { createExperienceBar, createLiveHealthBar } from '../liveBars';
import { className, heroDisplayName, listOf } from '../displayNames';
import { describeRejection, t } from '../i18n';
import { openDungeonView } from '../dungeonModal';
import { createDungeonIcon, createFightIcon, createLockIcon } from '../iconArt';
import { createList, createListRow } from '../listRow';
import { createPortrait } from '../portraitArt';
import { focusRun } from '../runFocus';
import { createRunProgressBar } from '../runProgress';
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
  const result = context.store.execute(startDungeonRunCommand(dungeonId, selectedHeroIds, Date.now()));
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
  const status = run
    ? element('div', 'card-text small busy-note', t('heroes.awayIn', { dungeon: t(`dungeon.${run.dungeonId}`) }))
    : createLiveHealthBar(context.store, hero.id);
  const entry = createListRow({
    art: createPortrait(hero.classId, hero.name, 2),
    title: heroDisplayName(hero.name),
    lines: [
      element('div', 'card-text small', t('heroes.levelShort', { className: className(hero.classId), level: hero.level })),
      status,
      createExperienceBar(hero.experience, describeHero(context.store.getState(), hero, Date.now()).experienceToNextLevel),
    ],
    className: `hero-choice${selectedHeroIds.includes(hero.id) ? ' selected' : ''}${run ? ' busy' : ''}`,
  });
  if (!run) {
    entry.addEventListener('click', () => {
      toggleHero(hero.id, Math.max(...DUNGEONS.map((dungeon) => dungeon.maxPartySize)));
      context.requestRender();
    });
  }
  return entry;
}

// The whole row opens the dungeon details. Buttons inside the row keep their own action.
function makeDetailsClickable(row: HTMLElement, dungeonId: string): HTMLElement {
  row.classList.add('clickable');
  row.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('button')) return;
    openDungeonView(dungeonId);
  });
  return row;
}

function dungeonTitle(dungeon: DungeonDefinition): string {
  return t('dungeons.title', { name: t(`dungeon.${dungeon.id}`), boss: dungeon.bossMonsterId ? t('dungeons.bossTag') : '', level: dungeon.level });
}

function levelRangeLine(context: PanelContext, dungeon: DungeonDefinition): HTMLElement {
  const highestHeroLevel = context.store.getState().company.reduce((highest, hero) => Math.max(highest, hero.level), 0);
  const className = highestHeroLevel >= dungeon.recommendedMinLevel ? 'level-ok' : 'level-low';
  return element('div', `card-text small ${className}`, t('dungeons.recommended', { min: dungeon.recommendedMinLevel, max: dungeon.recommendedMaxLevel }));
}

function renderLockedDungeon(context: PanelContext, dungeon: DungeonDefinition): HTMLElement {
  const before = dungeon.unlockAfter ? t(`dungeon.${requireById(DUNGEONS, dungeon.unlockAfter).id}`) : '';
  return makeDetailsClickable(createListRow({
    art: createLockIcon(3),
    title: dungeonTitle(dungeon),
    lines: [levelRangeLine(context, dungeon), element('div', 'card-text small locked-note', t('dungeons.locked', { dungeon: before }))],
    className: 'locked',
  }), dungeon.id);
}

function renderFreeDungeon(context: PanelContext, dungeon: DungeonDefinition): HTMLElement {
  const isCleared = context.store.getState().clearedDungeonIds.includes(dungeon.id);
  const hasValidSelection = selectedHeroIds.length > 0 && selectedHeroIds.length <= dungeon.maxPartySize;
  return makeDetailsClickable(createListRow({
    art: createDungeonIcon(dungeon.id, 3),
    title: dungeonTitle(dungeon),
    lines: [
      element('div', 'card-text', monsterNamesOf(dungeon)),
      levelRangeLine(context, dungeon),
      element('div', 'card-text small', `${t('dungeons.maxHeroes', { max: dungeon.maxPartySize })}${isCleared ? ` | ${t('dungeons.cleared')}` : ''}`),
    ],
    actions: [actionButton(t('dungeons.start'), () => start(context, dungeon.id), { disabled: !hasValidSelection })],
  }), dungeon.id);
}

function renderBusyDungeon(context: PanelContext, dungeon: DungeonDefinition, run: DungeonRun): HTMLElement {
  const state = context.store.getState();
  const heroNames = run.heroIds.flatMap((heroId) => {
    const hero = state.company.find((candidate) => candidate.id === heroId);
    return hero ? [heroDisplayName(hero.name)] : [];
  });
  return makeDetailsClickable(createListRow({
    art: element('div', 'fight-art', createDungeonIcon(dungeon.id, 3), element('span', 'fight-badge', createFightIcon(2))),
    title: dungeonTitle(dungeon),
    lines: [
      element('div', 'fight-status', t('dungeons.underFight')),
      element('div', 'card-text small', t('dungeons.fightingHeroes', { heroes: listOf(heroNames) })),
      createRunProgressBar(run.runNumber),
    ],
    actions: [
      actionButton(t('dungeons.watch'), () => {
        focusRun(run.runNumber);
        context.closePanel();
      }, { className: 'action-button primary' }),
      actionButton(t('dungeons.stop'), () => context.store.execute(stopDungeonRunCommand(run.runNumber)), { className: 'action-button danger' }),
    ],
    className: 'fighting',
  }), dungeon.id);
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
    body.append(element('div', 'section-title', t('dungeons.pickHero')), createList(...state.company.map((hero) => renderHeroChoice(context, hero))));
  }
  const dungeons = DUNGEONS.filter((dungeon) => dungeon.townId === state.townId);
  body.append(
    element('p', 'hint', t('dungeons.oneFightHint')),
    createList(
      ...dungeons.map((dungeon) => {
        const run = runInDungeon(state, dungeon.id);
        if (run) return renderBusyDungeon(context, dungeon, run);
        return isDungeonUnlocked(state, dungeon) ? renderFreeDungeon(context, dungeon) : renderLockedDungeon(context, dungeon);
      }),
    ),
  );
  return body;
};
