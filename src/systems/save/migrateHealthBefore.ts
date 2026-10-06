import type { HeroEncounterResult, RunReport } from '../../model/gameState';

// An old report does not record the health that the heroes had at the start. It shows the loss from full health, as before.
export function migrateHealthBefore(save: Record<string, unknown>): Record<string, unknown> {
  const reports = ((save.reports ?? []) as RunReport[]).map((report) => ({
    ...report,
    result: {
      ...report.result,
      heroes: (report.result.heroes ?? []).map((heroResult): HeroEncounterResult => ({ ...heroResult, healthBefore: heroResult.maxHealth })),
    },
  }));
  return { ...save, reports };
}
