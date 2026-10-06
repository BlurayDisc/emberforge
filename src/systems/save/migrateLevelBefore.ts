import type { HeroEncounterResult, RunReport } from '../../model/gameState';

// An old report does not record the level before the fight. It shows no level-up growth.
export function migrateLevelBefore(save: Record<string, unknown>): Record<string, unknown> {
  const reports = ((save.reports ?? []) as RunReport[]).map((report) => ({
    ...report,
    result: {
      ...report.result,
      heroes: (report.result.heroes ?? []).map((heroResult): HeroEncounterResult => ({ ...heroResult, levelBefore: heroResult.levelAfter })),
    },
  }));
  return { ...save, reports };
}
