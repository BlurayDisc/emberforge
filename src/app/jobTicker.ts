import { collectFinishedJobsCommand, findFinishedJobs, produceMillMaterialsCommand, type GameStore } from '../game';
import type { BackpackEntry } from '../model/backpack';
import type { TimedJob } from '../model/timedJob';
import { itemDisplayName, materialName } from '../ui/displayNames';
import { t } from '../ui/i18n';
import type { PanelHost } from '../ui/panelHost';

const CHECK_INTERVAL_MILLISECONDS = 1000;

// A sold entry leaves the backpack when the sale ends, so its name is read from the backpack before the jobs finish.
function describeJob(job: TimedJob, backpackBeforeCollect: readonly BackpackEntry[]): string {
  if (job.kind === 'craft') return t('job.craftWaiting', { name: itemDisplayName(job.item) });
  const content = backpackBeforeCollect.find((entry) => entry.saleJobId === job.id)?.content;
  const name = content?.kind === 'item' ? itemDisplayName(content.item) : content ? materialName(content.materialId) : '';
  return t('job.saleDone', { name });
}

// Jobs finish by the clock, also while the page was closed. This check runs at start and every second.
// A finished craft stays at the crafter until the player clicks the crafter (see collectWaitingCraftCommand).
export function startJobTicker(store: GameStore, panelHost: PanelHost): void {
  const collect = (): void => {
    const nowMs = Date.now();
    store.execute(produceMillMaterialsCommand(nowMs));
    const due = findFinishedJobs(store.getState(), nowMs);
    if (due.length === 0) return;
    const backpackBeforeCollect = store.getState().backpack;
    if (!store.execute(collectFinishedJobsCommand(nowMs)).accepted) return;
    panelHost.notify(due.map((job) => describeJob(job, backpackBeforeCollect)).join(' '));
  };
  window.setInterval(collect, CHECK_INTERVAL_MILLISECONDS);
  collect();
}
