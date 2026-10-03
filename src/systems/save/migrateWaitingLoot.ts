import type { TimedJob } from '../../model/timedJob';

// Version 14: a finished craft with no room waits at the crafter, and drops with no room wait at the dungeon.
// An old report held the lost drops. They are gone, so the report now lists none as waiting.
export function migrateWaitingLoot(save: Record<string, unknown>): Record<string, unknown> {
  const jobs = ((save.jobs ?? []) as TimedJob[]).map((job) => (job.kind === 'craft' ? { ...job, isWaitingForCollection: false } : job));
  const reports = ((save.reports ?? []) as { result: Record<string, unknown> }[]).map((report) => {
    const { materialsLost: _lostForGood, ...resultWithoutLost } = report.result;
    return { ...report, result: { ...resultWithoutLost, materialsWaiting: [] } };
  });
  return { ...save, jobs, reports, pendingLoot: {} };
}
