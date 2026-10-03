import { DUNGEONS } from '../../src/content/dungeons';
import { MATERIALS } from '../../src/content/materials';
import { requireById } from '../../src/content/lookup';
import { createRandom } from '../../src/kernel/random';
import { createEncounter } from '../../src/systems/dungeons';
import { hireCostForCompanySize } from '../../src/systems/economy';
import { rollMonsterLoot } from '../../src/systems/loot';
import { experienceForKill, experienceToNextLevel } from '../../src/systems/progression';

const LAST_LEVEL = 10;
const RUNS_FOR_AVERAGE = 200;

interface LevelMilestone {
  fights: number;
  copperFromDrops: number;
  copperIfMaterialsSold: number;
}

function dungeonForLevel(heroLevel: number) {
  const fightable = DUNGEONS.filter((dungeon) => dungeon.level <= heroLevel && dungeon.bossMonsterId === null);
  return fightable[fightable.length - 1] ?? DUNGEONS[0]!;
}

// A solo hero wins every fight in the dungeon that fits its level. The table shows how much copper it holds when it reaches each level.
function playUntilLevels(seed: number): Map<number, LevelMilestone> {
  const random = createRandom(seed);
  const milestones = new Map<number, LevelMilestone>();
  let level = 1;
  let experience = 0;
  let fights = 0;
  let copperFromDrops = 0;
  let copperIfMaterialsSold = 0;
  while (level < LAST_LEVEL) {
    const dungeon = dungeonForLevel(level);
    const monsters = createEncounter(dungeon, 1, random.fork(`encounter-${fights}`));
    fights += 1;
    for (const monster of monsters) {
      const loot = rollMonsterLoot(monster.definitionId, monster.level, random.fork(`loot-${fights}-${monster.id}`));
      copperFromDrops += loot.copper;
      copperIfMaterialsSold += loot.copper + loot.materials.reduce((sum, stack) => sum + stack.quantity * requireById(MATERIALS, stack.materialId).sellValueCopper, 0);
      experience += experienceForKill(monster.level, level, monster.rank);
    }
    while (experience >= experienceToNextLevel(level) && level < LAST_LEVEL) {
      experience -= experienceToNextLevel(level);
      level += 1;
      milestones.set(level, { fights, copperFromDrops, copperIfMaterialsSold });
    }
  }
  return milestones;
}

export function printEconomy(): void {
  const secondHeroCost = hireCostForCompanySize(1) ?? 0;
  const runs = Array.from({ length: RUNS_FOR_AVERAGE }, (_, index) => playUntilLevels(index + 1));
  console.log(`\nEconomy: a solo hero wins every fight (average of ${RUNS_FOR_AVERAGE} games). The second hero costs ${secondHeroCost} copper.`);
  for (let level = 2; level <= LAST_LEVEL; level++) {
    const average = (pick: (milestone: LevelMilestone) => number): number => Math.round(runs.reduce((sum, run) => sum + pick(run.get(level)!), 0) / runs.length);
    console.log(`  reaches level ${String(level).padStart(2)}: ${String(average((m) => m.fights)).padStart(4)} fights, ${String(average((m) => m.copperFromDrops)).padStart(5)} copper from drops, ${String(average((m) => m.copperIfMaterialsSold)).padStart(5)} with materials sold`);
  }
}
