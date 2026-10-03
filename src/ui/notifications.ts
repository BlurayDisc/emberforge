import { requireById } from '../content/lookup';
import { DUNGEONS } from '../content/dungeons';
import { playSound } from '../audio';
import { dismissAllReportsCommand, dismissReportCommand, type GameStore } from '../game';
import type { RunReport } from '../model/gameState';
import { actionButton, element } from './dom';
import { createEncounterResultCard } from './encounterResultCard';
import { onLanguageChange, t } from './i18n';
import { createFightIcon } from './iconArt';
import { openModal } from './modal';

function openReport(store: GameStore, report: RunReport): void {
  const dungeon = requireById(DUNGEONS, report.dungeonId);
  const content = element('div', 'panel-body');
  if (report.firstClear) content.append(element('p', 'hint welcome', t('report.firstClear')));
  content.append(createEncounterResultCard(report.result, store.getState().company));
  const modal = openModal(t('report.title', { dungeon: t(`dungeon.${dungeon.id}`) }), content, () => store.execute(dismissReportCommand(report.runNumber)));
  content.append(actionButton(t('report.close'), () => modal.close(), { className: 'action-button primary' }));
}

// Each finished run leaves a notice. It stays until the player opens it, even after a reload.
export function createNotificationCenter(store: GameStore): HTMLElement {
  const stack = element('div', 'notification-stack');
  const announced = new Set<number>(store.getState().reports.map((report) => report.runNumber));

  const announceNewReports = (): void => {
    for (const report of store.getState().reports) {
      if (announced.has(report.runNumber)) continue;
      announced.add(report.runNumber);
      playSound(report.result.won ? 'victory' : 'defeat-hero');
      if (report.result.heroes.some((hero) => hero.reachedLevel !== null)) playSound('level-up', 0.4);
    }
  };

  const render = (): void => {
    announceNewReports();
    const reports = store.getState().reports;
    const clearButton = actionButton(t('notify.clearAll'), () => store.execute(dismissAllReportsCommand()), { className: 'action-button small-button clear-notifications' });
    stack.replaceChildren(
      ...(reports.length > 0 ? [clearButton] : []),
      ...reports.map((report) => {
        const outcome = report.result.won ? t('notify.victory') : t('notify.defeat');
        const button = actionButton('', () => openReport(store, report), { className: `notification ${report.result.won ? 'won' : 'lost'}` });
        button.append(createFightIcon(2), element('span', 'notification-text', element('strong', '', t('notify.runFinished', { dungeon: t(`dungeon.${report.dungeonId}`), outcome })), element('span', 'card-text small', t('notify.tapToView'))));
        return button;
      }),
    );
  };

  store.subscribe(render);
  onLanguageChange(render);
  render();
  return stack;
}
