import type { Hero } from '../../model/hero';

// A save is never dropped because the game changed. Each migration upgrades a save by one version.
// To change the shape of GameState: raise CURRENT_SAVE_VERSION and add one migration here.
export interface SaveMigration {
  fromVersion: number;
  migrate(save: Record<string, unknown>): Record<string, unknown>;
}

export const SAVE_MIGRATIONS: readonly SaveMigration[] = [
  {
    // Version 7 added timed jobs and hero health timestamps.
    fromVersion: 6,
    migrate: (save) => ({
      ...save,
      company: (save.company as Hero[]).map((hero) => ({ ...hero, healthAsOfMs: hero.healthAsOfMs ?? 0, downedUntilMs: hero.downedUntilMs ?? null })),
      jobs: save.jobs ?? [],
      jobsStarted: save.jobsStarted ?? 0,
    }),
  },
];
