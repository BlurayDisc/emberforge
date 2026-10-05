import { playSound } from '../audio';
import { collectFinishedJobsCommand, findFinishedJobs, produceMillMaterialsCommand, type GameStore } from '../game';
import type { BackpackEntry } from '../model/backpack';
import type { TimedJob } from '../model/timedJob';
import { itemDisplayName, materialName } from '../ui/displayNames';
import { t } from '../ui/i18n';
import type { PanelHost } from '../ui/panelHost';

const CHECK_INTERVAL_MILLISECONDS = 1000;

// A sold entry leaves the backpack when the sale ends, so its name is read from the backpack before the jobs finish.
function describeJob(job: TimedJob, backpackBeforeCollect: readonly BackpackEntry[]): string {
  if (job.kind === 'craft') return t('job.craftDone', { name: itemDisplayName(job.item) });
  const content = backpackBeforeCollect.find((entry) => entry.saleJobId === job.id)?.content;
  const name = content?.kind === 'item' ? itemDisplayName(content.item) : content ? materialName(content.materialId) : '';
  return t('job.saleDone', { name });
}

function describeWaitingJob(job: TimedJob): string {
  return job.kind === 'craft' ? t('job.craftWaiting', { name: itemDisplayName(job.item) }) : '';
}

// Jobs finish by the clock, also while the page was closed. This check runs at start and every second.
// A craft job whose backpack is full stays in the list and is tried again at the next check.
export function startJobTicker(store: GameStore, panelHost: PanelHost): void {
  const collect = (): void => {
    const nowMs = Date.now();
    store.execute(produceMillMaterialsCommand(nowMs));
    const due = findFinishedJobs(store.getState(), nowMs);
    if (due.length === 0) return;
    const backpackBeforeCollect = store.getState().backpack;
    const levelsBefore = { ...store.getState().crafters };
    if (!store.execute(collectFinishedJobsCommand(nowMs)).accepted) return;
    const remainingIds = new Set(store.getState().jobs.map((job) => job.id));
    const messages = due.map((job) => (remainingIds.has(job.id) ? describeWaitingJob(job) : describeJob(job, backpackBeforeCollect)));
    for (const [professionId, progress] of Object.entries(store.getState().crafters)) {
      if (progress.level > (levelsBefore[professionId]?.level ?? 1)) {
        playSound('crafter-level-up');
        messages.push(t('workshop.levelUp', { profession: t(`profession.${professionId}`), level: progress.level }));
      }
    }
    if (messages.length > 0) panelHost.notify(messages.join(' '));
  };
  window.setInterval(collect, CHECK_INTERVAL_MILLISECONDS);
  collect();
}
