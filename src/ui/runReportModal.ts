import { DUNGEONS } from '../content/dungeons';
import { requireById } from '../content/lookup';
import { dismissReportCommand, type GameStore } from '../game';
import type { RunReport } from '../model/gameState';
import { actionButton, element } from './dom';
import { createEncounterResultCard } from './encounterResultCard';
import { t } from './i18n';
import { openModal } from './modal';

// Closing the report in any way marks it as read. Until then the dungeon shows "Results ready".
export function openRunReport(store: GameStore, report: RunReport): void {
  const dungeon = requireById(DUNGEONS, report.dungeonId);
  const content = element('div', 'panel-body');
  if (report.firstClear) content.append(element('p', 'hint welcome', t('report.firstClear')));
  content.append(createEncounterResultCard(report.result, store.getState().company));
  const modal = openModal(t('report.title', { dungeon: t(`dungeon.${dungeon.id}`) }), content, () => store.execute(dismissReportCommand(report.runNumber)));
  content.append(actionButton(t('report.close'), () => modal.close(), { className: 'action-button primary' }));
}
