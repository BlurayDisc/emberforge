import { DUNGEONS, type DungeonDefinition } from '../../content/dungeons';
import { requireById } from '../../content/lookup';
import { collectDungeonLootCommand, hasBankUnlock, isDungeonUnlocked, loadStaysOnDungeonScreen, runInDungeon, runOfHero, runAwayCommand, saveStaysOnDungeonScreen, startDungeonRunCommand } from '../../game';
import type { DungeonRun, RunReport } from '../../model/gameState';
import type { Item } from '../../model/item';
import type { MaterialStack } from '../../model/material';
import { actionButton, element } from '../dom';
import { heroDisplayName, itemDisplayName, listOf, materialName } from '../displayNames';
import { describeRejection, t } from '../i18n';
import { openDungeonView } from '../dungeonModal';
import type { ModalHandle } from '../modal';
import { createDungeonIcon, createFightIcon, createLockIcon } from '../iconArt';
import { createList, createListRow } from '../listRow';
import { addDungeonBackdrop } from '../dungeonBackdrop';
import { focusRun } from '../runFocus';
import { createRunProgressBar, elapsedSecondsOfRun } from '../runProgress';
import { openRunReport, repeatRun } from '../runReportModal';
import type { PanelContext, PanelRenderer } from './panelContext';

function monsterNamesOf(dungeon: DungeonDefinition): string {
  const ids = [...dungeon.monsterIds, ...(dungeon.bossMonsterId ? [dungeon.bossMonsterId] : [])];
  return listOf(ids.map((id) => t(`monster.${id}`)));
}

// Saved apart from the game save, like the other settings. A new game keeps it, so it only counts while the Bank upgrade is owned.
let staysOnDungeonScreen = loadStaysOnDungeonScreen();

function start(context: PanelContext, dungeonId: string, heroIds: string[], chooser: ModalHandle | null): void {
  const result = context.store.execute(startDungeonRunCommand(dungeonId, heroIds, Date.now()));
  if (!result.accepted) {
    context.notify(describeRejection(result.rejection));
    return;
  }
  chooser?.close();
  if (staysOnDungeonScreen && hasBankUnlock(context.store.getState(), 'quickDispatch')) return;
  const startedRun = runInDungeon(context.store.getState(), dungeonId);
  if (startedRun) focusRun(startedRun.runNumber);
  context.closePanel();
}

// The Fight button and the row open the same dungeon screen. A free dungeon also holds the hero choice there.
function openDungeonScreen(context: PanelContext, dungeon: DungeonDefinition, canFight: boolean): void {
  const state = context.store.getState();
  openDungeonView(dungeon.id, {
    showsDropRates: hasBankUnlock(state, 'dropRates'),
    showsMonsterStatistics: hasBankUnlock(state, 'monsterStatistics'),
    fight: canFight ? { store: context.store, start: (heroIds, screen) => start(context, dungeon.id, heroIds, screen) } : undefined,
  });
}

// The whole row opens the dungeon screen. Buttons inside the row keep their own action.
function makeDetailsClickable(context: PanelContext, row: HTMLElement, dungeon: DungeonDefinition, canFight = false): HTMLElement {
  row.classList.add('clickable');
  addDungeonBackdrop(row, dungeon.id);
  row.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('button')) return;
    openDungeonScreen(context, dungeon, canFight);
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
  }), dungeon);
}

// A finished fight waits for the player. The stats open first, and only then the dungeon can start again.
function renderFinishedDungeon(context: PanelContext, dungeon: DungeonDefinition, report: RunReport): HTMLElement {
  const open = (): void => openRunReport(context.store, report, context.notify);
  const repeat = (): void => {
    const newRunNumber = repeatRun(context.store, report, context.notify);
    if (newRunNumber === null) return;
    if (staysOnDungeonScreen && hasBankUnlock(context.store.getState(), 'quickDispatch')) return;
    focusRun(newRunNumber);
    context.closePanel();
  };
  const row = createListRow({
    art: element('div', 'fight-art', createDungeonIcon(dungeon.id, 3), element('span', 'fight-badge', createFightIcon(2))),
    title: dungeonTitle(dungeon),
    lines: [
      element('div', `fight-status ${report.result.won ? 'won' : 'lost'}`, t('dungeons.resultsReady', { outcome: report.result.won ? t('result.victory') : t('result.defeat') })),
      element('div', 'card-text small', t('dungeons.resultsHint')),
    ],
    actions: [actionButton(t('dungeons.viewResults'), open, { className: 'action-button primary' }), actionButton(t('report.repeat'), repeat)],
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
function renderPendingLootDungeon(context: PanelContext, dungeon: DungeonDefinition, waiting: readonly MaterialStack[], waitingItems: readonly Item[]): HTMLElement {
  const collect = (): void => {
    const result = context.store.execute(collectDungeonLootCommand(dungeon.id));
    if (!result.accepted) context.notify(describeRejection(result.rejection));
  };
  return makeDetailsClickable(context, createListRow({
    art: element('div', 'fight-art', createDungeonIcon(dungeon.id, 3)),
    title: dungeonTitle(dungeon),
    lines: [
      element('div', 'fight-status lost', t('dungeons.lootWaiting', { list: listOf([...waiting.map((stack) => `${materialName(stack.materialId)} x${stack.quantity}`), ...waitingItems.map(itemDisplayName)]) })),
      element('div', 'card-text small', t('dungeons.lootWaitingHint')),
    ],
    actions: [actionButton(t('dungeons.collectLoot'), collect, { className: 'action-button primary' })],
    className: 'finished',
  }), dungeon);
}

function renderFreeDungeon(context: PanelContext, dungeon: DungeonDefinition): HTMLElement {
  const state = context.store.getState();
  const isCleared = state.clearedDungeonIds.includes(dungeon.id);
  const freeHeroes = state.company.filter((hero) => !runOfHero(state, hero.id));
  const hasHeroToSend = freeHeroes.length >= dungeon.minimumPartySize && freeHeroes.some((hero) => hero.level >= dungeon.minimumHeroLevel);
  return makeDetailsClickable(context, createListRow({
    art: createDungeonIcon(dungeon.id, 3),
    title: dungeonTitle(dungeon),
    lines: [
      element('div', 'card-text', monsterNamesOf(dungeon)),
      levelRangeLine(context, dungeon),
      ...(isCleared ? [element('div', 'card-text small', t('dungeons.cleared'))] : []),
    ],
    actions: [actionButton(t('dungeons.start'), () => openDungeonScreen(context, dungeon, true), { disabled: !hasHeroToSend })],
  }), dungeon, hasHeroToSend);
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
  }), dungeon);
}

function renderStayOnScreenToggle(): HTMLElement {
  const checkbox = element('input', 'stay-toggle-box');
  checkbox.type = 'checkbox';
  checkbox.checked = staysOnDungeonScreen;
  checkbox.addEventListener('change', () => {
    staysOnDungeonScreen = checkbox.checked;
    saveStaysOnDungeonScreen(staysOnDungeonScreen);
  });
  return element('label', 'stay-toggle', checkbox, element('span', 'card-text', t('dungeons.stayOnScreen')));
}

function renderDungeonRow(context: PanelContext, dungeon: DungeonDefinition): HTMLElement {
  const state = context.store.getState();
  const run = runInDungeon(state, dungeon.id);
  if (run) return renderBusyDungeon(context, dungeon, run);
  const unreadReport = state.reports.find((report) => report.dungeonId === dungeon.id);
  if (unreadReport) return renderFinishedDungeon(context, dungeon, unreadReport);
  const waitingLoot = state.pendingLoot[dungeon.id] ?? [];
  const waitingItems = state.pendingItems[dungeon.id] ?? [];
  if (waitingLoot.length > 0 || waitingItems.length > 0) return renderPendingLootDungeon(context, dungeon, waitingLoot, waitingItems);
  return isDungeonUnlocked(state, dungeon) ? renderFreeDungeon(context, dungeon) : renderLockedDungeon(context, dungeon);
}

export const renderDungeonsPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const body = element('div', 'panel-body');
  const dungeons = DUNGEONS.filter((dungeon) => dungeon.townId === state.townId);
  body.append(
    element('p', 'hint', t('dungeons.oneFightHint')),
    ...(hasBankUnlock(state, 'quickDispatch') ? [renderStayOnScreenToggle()] : []),
    createList(
      ...dungeons.map((dungeon) => {
        const row = renderDungeonRow(context, dungeon);
        row.classList.add('dungeon-row');
        return row;
      }),
    ),
  );
  return body;
};
