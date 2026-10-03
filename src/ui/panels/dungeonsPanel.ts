import { DUNGEONS, type DungeonDefinition } from '../../content/dungeons';
import { requireById } from '../../content/lookup';
import { collectDungeonLootCommand, describeHero, hasBankUnlock, isDungeonUnlocked, runInDungeon, runOfHero, runAwayCommand, startDungeonRunCommand } from '../../game';
import type { DungeonRun, RunReport } from '../../model/gameState';
import type { Hero } from '../../model/hero';
import type { MaterialStack } from '../../model/material';
import { actionButton, element } from '../dom';
import { createExperienceBar, createLiveHealthBar } from '../liveBars';
import { className, heroDisplayName, listOf, materialName } from '../displayNames';
import { describeRejection, t } from '../i18n';
import { openDungeonView } from '../dungeonModal';
import { openModal, type ModalHandle } from '../modal';
import { createDungeonIcon, createFightIcon, createLockIcon } from '../iconArt';
import { createList, createListRow } from '../listRow';
import { addDungeonBackdrop } from '../dungeonBackdrop';
import { createPortrait } from '../portraitArt';
import { focusRun } from '../runFocus';
import { createRunProgressBar, elapsedSecondsOfRun } from '../runProgress';
import { openRunReport } from '../runReportModal';
import type { PanelContext, PanelRenderer } from './panelContext';

function monsterNamesOf(dungeon: DungeonDefinition): string {
  const ids = [...dungeon.monsterIds, ...(dungeon.bossMonsterId ? [dungeon.bossMonsterId] : [])];
  return listOf(ids.map((id) => t(`monster.${id}`)));
}

function start(context: PanelContext, dungeonId: string, heroId: string, chooser: ModalHandle): void {
  const result = context.store.execute(startDungeonRunCommand(dungeonId, [heroId], Date.now()));
  if (!result.accepted) {
    context.notify(describeRejection(result.rejection));
    return;
  }
  const startedRun = runInDungeon(context.store.getState(), dungeonId);
  if (startedRun) focusRun(startedRun.runNumber);
  chooser.close();
  context.closePanel();
}

// A hero in another run, or one below the dungeon level, shows why it cannot go.
function heroStatusLine(context: PanelContext, hero: Hero, dungeon: DungeonDefinition): HTMLElement {
  const run = runOfHero(context.store.getState(), hero.id);
  if (run) return element('div', 'card-text small busy-note', t('heroes.awayIn', { dungeon: t(`dungeon.${run.dungeonId}`) }));
  if (hero.level < dungeon.minimumHeroLevel) return element('div', 'card-text small level-low', t('dungeons.heroTooLow', { level: dungeon.minimumHeroLevel }));
  return createLiveHealthBar(context.store, hero.id);
}

function renderHeroChoice(context: PanelContext, hero: Hero, dungeon: DungeonDefinition, chooser: ModalHandle): HTMLElement {
  const isAway = runOfHero(context.store.getState(), hero.id) !== undefined;
  const isTooLow = hero.level < dungeon.minimumHeroLevel;
  const entry = createListRow({
    art: createPortrait(hero.classId, hero.name, 2),
    title: heroDisplayName(hero.name),
    lines: [
      element('div', 'card-text small', t('heroes.levelShort', { className: className(hero.classId), level: hero.level })),
      heroStatusLine(context, hero, dungeon),
      createExperienceBar(hero.experience, describeHero(context.store.getState(), hero, Date.now()).experienceToNextLevel),
    ],
    className: `hero-choice${isAway || isTooLow ? ' busy' : ''}`,
  });
  if (!isAway && !isTooLow) entry.addEventListener('click', () => start(context, dungeon.id, hero.id, chooser));
  return entry;
}

// The player picks the dungeon first. This window then asks which hero goes, and one tap on a hero starts the fight.
function openHeroChooser(context: PanelContext, dungeon: DungeonDefinition): void {
  const heroes = context.store.getState().company;
  const list = element('div', 'chooser-list');
  const handle: ModalHandle = openModal(t('dungeons.chooseHero', { dungeon: t(`dungeon.${dungeon.id}`) }), element('div', 'panel-body', list));
  list.append(createList(...heroes.map((hero) => renderHeroChoice(context, hero, dungeon, handle))));
}

// The whole row opens the dungeon details. Buttons inside the row keep their own action.
function makeDetailsClickable(context: PanelContext, row: HTMLElement, dungeonId: string): HTMLElement {
  row.classList.add('clickable');
  addDungeonBackdrop(row, dungeonId);
  row.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('button')) return;
    openDungeonView(dungeonId, { showsDropRates: hasBankUnlock(context.store.getState(), 'dropRates'), showsMonsterStatistics: hasBankUnlock(context.store.getState(), 'monsterStatistics') });
  });
  return row;
}

function dungeonTitle(dungeon: DungeonDefinition): string {
  return t('dungeons.title', { name: t(`dungeon.${dungeon.id}`), boss: dungeon.bossMonsterId ? t('dungeons.bossTag') : '', level: dungeon.level });
}

// Green when some hero in the company is high enough for the dungeon. Red when none is.
function levelRangeLine(context: PanelContext, dungeon: DungeonDefinition): HTMLElement {
  const canEnter = context.store.getState().company.some((hero) => hero.level >= dungeon.minimumHeroLevel);
  return element('div', `card-text small ${canEnter ? 'level-ok' : 'level-low'}`, t('dungeons.levelRange', { min: dungeon.minimumHeroLevel, max: dungeon.recommendedMaxLevel }));
}

function renderLockedDungeon(context: PanelContext, dungeon: DungeonDefinition): HTMLElement {
  const before = dungeon.unlockAfter ? t(`dungeon.${requireById(DUNGEONS, dungeon.unlockAfter).id}`) : '';
  return makeDetailsClickable(context, createListRow({
    art: createLockIcon(3),
    title: dungeonTitle(dungeon),
    lines: [levelRangeLine(context, dungeon), element('div', 'card-text small locked-note', t('dungeons.locked', { dungeon: before }))],
    className: 'locked',
  }), dungeon.id);
}

// A finished fight waits for the player. The stats open first, and only then the dungeon can start again.
function renderFinishedDungeon(context: PanelContext, dungeon: DungeonDefinition, report: RunReport): HTMLElement {
  const open = (): void => openRunReport(context.store, report);
  const row = createListRow({
    art: element('div', 'fight-art', createDungeonIcon(dungeon.id, 3), element('span', 'fight-badge', createFightIcon(2))),
    title: dungeonTitle(dungeon),
    lines: [
      element('div', `fight-status ${report.result.won ? 'won' : 'lost'}`, t('dungeons.resultsReady', { outcome: report.result.won ? t('result.victory') : t('result.defeat') })),
      element('div', 'card-text small', t('dungeons.resultsHint')),
    ],
    actions: [actionButton(t('dungeons.viewResults'), open, { className: 'action-button primary' })],
    className: 'clickable finished',
  });
  addDungeonBackdrop(row, dungeon.id);
  row.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('button')) return;
    open();
  });
  return row;
}

// Drops that found no room wait at the dungeon. The dungeon stays closed until the player collects them.
function renderPendingLootDungeon(context: PanelContext, dungeon: DungeonDefinition, waiting: readonly MaterialStack[]): HTMLElement {
  const collect = (): void => {
    const result = context.store.execute(collectDungeonLootCommand(dungeon.id));
    if (!result.accepted) context.notify(describeRejection(result.rejection));
  };
  return makeDetailsClickable(context, createListRow({
    art: element('div', 'fight-art', createDungeonIcon(dungeon.id, 3)),
    title: dungeonTitle(dungeon),
    lines: [
      element('div', 'fight-status lost', t('dungeons.lootWaiting', { list: listOf(waiting.map((stack) => `${materialName(stack.materialId)} x${stack.quantity}`)) })),
      element('div', 'card-text small', t('dungeons.lootWaitingHint')),
    ],
    actions: [actionButton(t('dungeons.collectLoot'), collect, { className: 'action-button primary' })],
    className: 'finished',
  }), dungeon.id);
}

function renderFreeDungeon(context: PanelContext, dungeon: DungeonDefinition): HTMLElement {
  const state = context.store.getState();
  const isCleared = state.clearedDungeonIds.includes(dungeon.id);
  const hasHeroToSend = state.company.some((hero) => !runOfHero(state, hero.id) && hero.level >= dungeon.minimumHeroLevel);
  return makeDetailsClickable(context, createListRow({
    art: createDungeonIcon(dungeon.id, 3),
    title: dungeonTitle(dungeon),
    lines: [
      element('div', 'card-text', monsterNamesOf(dungeon)),
      levelRangeLine(context, dungeon),
      ...(isCleared ? [element('div', 'card-text small', t('dungeons.cleared'))] : []),
    ],
    actions: [actionButton(t('dungeons.start'), () => openHeroChooser(context, dungeon), { disabled: !hasHeroToSend })],
  }), dungeon.id);
}

function renderBusyDungeon(context: PanelContext, dungeon: DungeonDefinition, run: DungeonRun): HTMLElement {
  const state = context.store.getState();
  const heroNames = run.heroIds.flatMap((heroId) => {
    const hero = state.company.find((candidate) => candidate.id === heroId);
    return hero ? [heroDisplayName(hero.name)] : [];
  });
  return makeDetailsClickable(context, createListRow({
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
      actionButton(t('dungeons.runAway'), () => context.store.execute(runAwayCommand(run.runNumber, elapsedSecondsOfRun(run.runNumber), Date.now())), { className: 'action-button danger' }),
    ],
    className: 'fighting',
  }), dungeon.id);
}

export const renderDungeonsPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const body = element('div', 'panel-body');
  const dungeons = DUNGEONS.filter((dungeon) => dungeon.townId === state.townId);
  body.append(
    element('p', 'hint', t('dungeons.oneFightHint')),
    createList(
      ...dungeons.map((dungeon) => {
        const run = runInDungeon(state, dungeon.id);
        if (run) return renderBusyDungeon(context, dungeon, run);
        const unreadReport = state.reports.find((report) => report.dungeonId === dungeon.id);
        if (unreadReport) return renderFinishedDungeon(context, dungeon, unreadReport);
        const waitingLoot = state.pendingLoot[dungeon.id] ?? [];
        if (waitingLoot.length > 0) return renderPendingLootDungeon(context, dungeon, waitingLoot);
        return isDungeonUnlocked(state, dungeon) ? renderFreeDungeon(context, dungeon) : renderLockedDungeon(context, dungeon);
      }),
    ),
  );
  return body;
};
