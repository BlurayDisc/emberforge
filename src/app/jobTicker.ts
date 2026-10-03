import { collectFinishedJobsCommand, findFinishedJobs, type GameStore } from '../game';
import type { TimedJob } from '../model/timedJob';
import { itemDisplayName, materialName } from '../ui/displayNames';
import { t } from '../ui/i18n';
import type { PanelHost } from '../ui/panelHost';

const CHECK_INTERVAL_MILLISECONDS = 1000;

function describeJob(job: TimedJob): string {
  if (job.kind === 'craft') return t('job.craftDone', { name: itemDisplayName(job.item) });
  const name = job.content.kind === 'item' ? itemDisplayName(job.content.item) : materialName(job.content.materialId);
  return t('job.saleDone', { name });
}

// Jobs finish by the clock, also while the page was closed. This check runs at start and every second.
// A craft job whose backpack is full stays in the list and is tried again at the next check.
export function startJobTicker(store: GameStore, panelHost: PanelHost): void {
  const collect = (): void => {
    const nowMs = Date.now();
    const due = findFinishedJobs(store.getState(), nowMs);
    if (due.length === 0) return;
    const levelsBefore = { ...store.getState().crafters };
    if (!store.execute(collectFinishedJobsCommand(nowMs)).accepted) return;
    const remainingIds = new Set(store.getState().jobs.map((job) => job.id));
    const messages = due.filter((job) => !remainingIds.has(job.id)).map(describeJob);
    for (const [professionId, progress] of Object.entries(store.getState().crafters)) {
      if (progress.level > (levelsBefore[professionId]?.level ?? 1)) messages.push(t('workshop.levelUp', { profession: t(`profession.${professionId}`), level: progress.level }));
    }
    if (messages.length > 0) panelHost.notify(messages.join(' '));
  };
  window.setInterval(collect, CHECK_INTERVAL_MILLISECONDS);
  collect();
}
