import { VICTORY_DUNGEON_ID } from '../content/balance/progression';
import { DUNGEONS } from '../content/dungeons';
import { requireById } from '../content/lookup';
import { dismissReportCommand, repeatDungeonRunCommand, runInDungeon, type GameStore } from '../game';
import type { RunReport } from '../model/gameState';
import { actionButton, element } from './dom';
import { createEncounterResultCard } from './encounterResultCard';
import { describeRejection, t } from './i18n';
import { openModal } from './modal';
import { focusRun } from './runFocus';
import { openVictoryScreen } from './victoryScreen';

// Sends the same heroes into the same dungeon again. It returns the number of the new run, or null when the start was rejected.
export function repeatRun(store: GameStore, report: RunReport, notify: (message: string) => void): number | null {
  const result = store.execute(repeatDungeonRunCommand(report.runNumber, Date.now()));
  if (!result.accepted) {
    notify(describeRejection(result.rejection));
    return null;
  }
  return runInDungeon(store.getState(), report.dungeonId)?.runNumber ?? null;
}

// Closing the report in any way marks it as read. Until then the dungeon shows "Results ready".
// Repeat starts the same fight again and watches it. The first clear of the victory dungeon opens the Victory screen after the report.
// A report opened from a panel passes onRepeatStarted, so the panel decides if it stays open. Without it the battle screen is watched.
export function openRunReport(store: GameStore, report: RunReport, notify: (message: string) => void, onRepeatStarted?: (newRunNumber: number) => void): void {
  const dungeon = requireById(DUNGEONS, report.dungeonId);
  const content = element('div', 'panel-body');
  if (report.firstClear) content.append(element('p', 'hint welcome', t('report.firstClear')));
  content.append(createEncounterResultCard(report.result, store.getState().company));
  const showsVictory = report.firstClear && report.dungeonId === VICTORY_DUNGEON_ID;
  const modal = openModal(t('report.title', { dungeon: t(`dungeon.${dungeon.id}`) }), content, () => {
    store.execute(dismissReportCommand(report.runNumber));
    if (showsVictory) openVictoryScreen(store.getState(), store.getState().company.filter((hero) => report.result.heroes.some((result) => result.heroId === hero.id)));
  });
  const repeat = (): void => {
    const newRunNumber = repeatRun(store, report, notify);
    if (newRunNumber === null) return;
    if (onRepeatStarted) onRepeatStarted(newRunNumber);
    else focusRun(newRunNumber);
    modal.close();
  };
  content.append(element('div', 'report-actions', actionButton(t('report.close'), () => modal.close()), actionButton(t('report.repeat'), repeat, { className: 'action-button primary' })));
}
