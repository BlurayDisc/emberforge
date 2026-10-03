import type { BuildingDefinition } from '../content/buildings';
import { collectMillMaterialsCommand, describeMill, type GameStore } from '../game';
import { LOGICAL_HEIGHT, TOWN_WIDTH } from '../kernel/stageSize';
import { element } from './dom';
import { describeRejection, t } from './i18n';
import { addLiveUpdate, formatDuration } from './liveUpdate';

function percentOf(value: number, total: number): string {
  return `${(value / total) * 100}%`;
}

// Sits under the Mill in the town. The countdown runs while the Mill works. The Collect button
// shows when materials wait, and stays until the player presses it. It is a sibling of the hotspot
// because a button may not hold another button.
export function createMillStatus(store: GameStore, mill: BuildingDefinition, notify: (message: string) => void): HTMLElement {
  const timer = element('div', 'mill-timer');
  const collectButton = element('button', 'mill-collect');
  collectButton.type = 'button';
  collectButton.addEventListener('click', () => {
    const result = store.execute(collectMillMaterialsCommand());
    if (!result.accepted) notify(describeRejection(result.rejection));
  });
  const status = element('div', 'mill-status', collectButton, timer);
  status.style.left = percentOf(mill.x - mill.width / 2, TOWN_WIDTH);
  status.style.top = percentOf(mill.y, LOGICAL_HEIGHT);
  status.style.width = percentOf(mill.width, TOWN_WIDTH);

  addLiveUpdate(status, () => {
    const view = describeMill(store.getState());
    const storedCount = view.storedCount;
    collectButton.style.display = storedCount > 0 ? 'block' : 'none';
    collectButton.textContent = t('mill.collectCount', { count: storedCount });
    if (view.isFull) timer.textContent = t('mill.fullShort');
    else if (view.nextProductionAtMs === null) timer.textContent = t('mill.startingShort');
    else timer.textContent = formatDuration((view.nextProductionAtMs - Date.now()) / 1000);
  });
  return status;
}
