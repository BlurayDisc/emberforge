import { heroNamesForClass } from '../../src/content/heroNames';
import { MONSTERS } from '../../src/content/monsters';
import { createRandom } from '../../src/kernel/random';
import type { BattleUnit } from '../../src/model/battle';
import type { ClassId } from '../../src/model/hero';
import type { RealtimeBattleReport } from '../../src/model/realtimeBattle';
import { simulateRealtimeBattle } from '../../src/systems/battle';
import { createMonsterUnit } from '../../src/systems/dungeons';
import { heroToBattleUnit } from '../../src/systems/stats';
import { equipBestGear, type GearRule } from '../balance-sim/scenarios/bestEquippableGear';
import { createSimulatedHero, learnSpellsFor } from '../balance-sim/simulatedHero';

export type GearState = 'none' | 'weapon' | 'common' | 'magic';

export interface DummyHeroSetup {
  classId: ClassId;
  level: number;
}

export interface BattleSetup {
  heroes: DummyHeroSetup[];
  gearState: GearState;
  creepId: string;
  creepLevel: number;
  creepCount: number;
  seed: number;
}

const ALL_GEAR_SLOTS = ['mainHand', 'offHand', 'helm', 'armour', 'gloves', 'legs', 'boots', 'belt', 'amulet', 'ring'] as const;
// The gear crafts roll from this fixed seed, so a new battle seed changes the fight and keeps the dummy heroes the same.
const GEAR_SEED = 1;

function gearRuleOf(gearState: GearState): GearRule | null {
  if (gearState === 'none') return null;
  if (gearState === 'weapon') return { slots: ['mainHand'], quality: 'common' };
  return { slots: ALL_GEAR_SLOTS, quality: gearState };
}

// Same rule as the balance tool: the best gear the class can wear at the level, and the best spells.
function dummyHeroUnit(setup: DummyHeroSetup, gearState: GearState, index: number): BattleUnit {
  const gearRule = gearRuleOf(gearState);
  const hero = { ...createSimulatedHero(setup.classId, setup.level, index), name: heroNamesForClass(setup.classId)[index] ?? setup.classId };
  const equipped = gearRule === null ? hero : equipBestGear(hero, createRandom(GEAR_SEED).fork(`gear-${index}`), null, gearRule);
  return { ...heroToBattleUnit(learnSpellsFor(equipped, true)), id: `hero-${index}` };
}

export function buildUnits(setup: BattleSetup): { heroUnits: BattleUnit[]; creepUnits: BattleUnit[] } {
  return {
    heroUnits: setup.heroes.map((hero, index) => dummyHeroUnit(hero, setup.gearState, index)),
    creepUnits: Array.from({ length: setup.creepCount }, (_, index) => createMonsterUnit(setup.creepId, setup.creepLevel, `monster-${index}-${setup.creepId}`)),
  };
}

export function simulate(heroUnits: readonly BattleUnit[], creepUnits: readonly BattleUnit[], seed: number): RealtimeBattleReport {
  return simulateRealtimeBattle([...heroUnits, ...creepUnits], createRandom(seed).fork('battle'));
}

export interface AverageResult {
  battles: number;
  winRatePercent: number;
  averageSeconds: number;
  averageHeroHpLostPercent: number;
}

const BATTLES_PER_SLICE = 10;

// The seeds run from the seed in the field upward. The slices keep the page responsive while the 20 battles run.
export async function runManyBattles(setup: BattleSetup, battleCount: number): Promise<AverageResult> {
  const { heroUnits, creepUnits } = buildUnits(setup);
  const heroMaxHp = heroUnits.reduce((sum, unit) => sum + unit.maxHp, 0);
  let wins = 0;
  let seconds = 0;
  let hpLostPercent = 0;
  for (let battle = 0; battle < battleCount; battle++) {
    const report = simulate(heroUnits, creepUnits, setup.seed + battle);
    if (report.winner === 'party') wins += 1;
    seconds += report.durationSeconds;
    const heroHpLeft = report.finalUnits.filter((unit) => unit.side === 'party').reduce((sum, unit) => sum + unit.hp, 0);
    hpLostPercent += ((heroMaxHp - heroHpLeft) / heroMaxHp) * 100;
    if (battle % BATTLES_PER_SLICE === BATTLES_PER_SLICE - 1) await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return { battles: battleCount, winRatePercent: (wins / battleCount) * 100, averageSeconds: seconds / battleCount, averageHeroHpLostPercent: hpLostPercent / battleCount };
}

export const CREEP_OPTIONS = MONSTERS.map((monster) => ({ id: monster.id, rank: monster.rank }));
