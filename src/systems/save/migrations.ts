import type { Hero } from '../../model/hero';
import { migrateMill } from './migrateMill';
import { migrateMillUpgrades } from './migrateMillUpgrades';
import { migrateLevelBefore } from './migrateLevelBefore';
import { migrateExperienceBars } from './migrateExperienceBars';
import { migrateBackpackGrid } from './migrateBackpackGrid';
import { migrateWaitingLoot } from './migrateWaitingLoot';
import { migrateRenamedBases } from './migrateRenamedBases';
import { migrateSpells } from './migrateSpells';
import { migrateDroppedItems } from './migrateDroppedItems';
import { migrateHealthLoss } from './migrateHealthLoss';
import { migrateSalesInPlace } from './migrateSalesInPlace';
import { migrateHealthBefore } from './migrateHealthBefore';
import { migrateUpgradeLevels } from './migrateUpgradeLevels';
import { migrateUnstackedMaterials } from './migrateUnstackedMaterials';
import { migrateWeaponDamageAndSmiths } from './migrateWeaponDamageAndSmiths';

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
  {
    fromVersion: 7,
    migrate: migrateWeaponDamageAndSmiths,
  },
  {
    // Version 9: materials no longer stack, and the Bank sells backpack rows and merchant sale slots.
    fromVersion: 8,
    migrate: migrateUnstackedMaterials,
  },
  {
    // Version 10: monsters no longer drop money, so a report holds no copperGained.
    fromVersion: 9,
    migrate: (save) => ({
      ...save,
      reports: ((save.reports ?? []) as { result: Record<string, unknown> }[]).map((report) => {
        const { copperGained: _removedMoney, ...resultWithoutMoney } = report.result;
        return { ...report, result: resultWithoutMoney };
      }),
    }),
  },
  {
    fromVersion: 10,
    migrate: migrateUpgradeLevels,
  },
  {
    fromVersion: 11,
    migrate: migrateSpells,
  },
  {
    fromVersion: 12,
    migrate: migrateBackpackGrid,
  },
  {
    fromVersion: 13,
    migrate: migrateWaitingLoot,
  },
  {
    // Version 15: a hero result holds the level and experience after the fight.
    fromVersion: 14,
    migrate: migrateExperienceBars,
  },
  {
    fromVersion: 15,
    migrate: migrateRenamedBases,
  },
  {
    // Version 17: the Bank sells features (sorting, monster statistics, drop rates). A saved game owns none.
    fromVersion: 16,
    migrate: (save) => ({ ...save, bankUnlockIds: [] }),
  },
  {
    fromVersion: 17,
    migrate: migrateMill,
  },
  {
    // Version 19: the Mill holds 1 material at first, and the Bank sells Mill upgrades.
    fromVersion: 18,
    migrate: migrateMillUpgrades,
  },
  {
    // Version 20: monsters can drop items.
    fromVersion: 19,
    migrate: migrateDroppedItems,
  },
  {
    // Version 21: a hero result holds the health lost in the fight.
    fromVersion: 20,
    migrate: migrateHealthLoss,
  },
  {
    // Version 22: goods on sale stay in their backpack cell.
    fromVersion: 21,
    migrate: migrateSalesInPlace,
  },
  {
    // Version 23: a hero result holds the health the hero had when the fight began.
    fromVersion: 22,
    migrate: migrateHealthBefore,
  },
  {
    // Version 24: a hero result holds the level before the fight.
    fromVersion: 23,
    migrate: migrateLevelBefore,
  },
];
