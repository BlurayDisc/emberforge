import type { HeroEncounterResult, RunReport } from '../../model/gameState';
import type { Hero } from '../../model/hero';

// An old report has no record of the hero after the fight. The hero's current level and experience stand in for it.
export function migrateExperienceBars(save: Record<string, unknown>): Record<string, unknown> {
  const company = (save.company ?? []) as Hero[];
  const reports = ((save.reports ?? []) as RunReport[]).map((report) => ({
    ...report,
    result: {
      ...report.result,
      heroes: (report.result.heroes ?? []).map((heroResult): HeroEncounterResult => {
        const hero = company.find((candidate) => candidate.id === heroResult.heroId);
        return { ...heroResult, levelAfter: hero?.level ?? heroResult.reachedLevel ?? 1, experienceAfter: hero?.experience ?? 0 };
      }),
    },
  }));
  return { ...save, reports };
}
