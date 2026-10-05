import type { HeroEncounterResult, RunReport } from '../../model/gameState';

// An old report does not record the health that the heroes lost. It shows no loss.
export function migrateHealthLoss(save: Record<string, unknown>): Record<string, unknown> {
  const reports = ((save.reports ?? []) as RunReport[]).map((report) => ({
    ...report,
    result: {
      ...report.result,
      heroes: (report.result.heroes ?? []).map((heroResult): HeroEncounterResult => ({ ...heroResult, healthLost: 0, maxHealth: 1 })),
    },
  }));
  return { ...save, reports };
}
