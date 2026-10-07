import { createGameStore, startDungeonRunCommand } from '../src/game';
import { createRandom } from '../src/kernel/random';
import { DUNGEONS } from '../src/content/dungeons';
import type { ClassId, Hero } from '../src/model/hero';
import { equipBestGear } from './balance-sim/scenarios/bestEquippableGear';
import { createSimulatedHero, learnSpellsFor } from './balance-sim/simulatedHero';

// Prints a save for the real game. Use it with `npm run shot`: set localStorage 'emberforge.save' to the text, reload, then drive the game.
// Usage: tsx tools/shot-save-fixture.ts <dungeonId> <classId:level> [<classId:level>] [--run]
// --run starts the dungeon run in the save. Every dungeon before the chosen one counts as cleared. Heroes wear the best Common gear and the best spells.
const [dungeonId, ...heroArguments] = process.argv.slice(2).filter((argument) => !argument.startsWith('--'));
const startsRun = process.argv.includes('--run');
if (!dungeonId || heroArguments.length === 0) throw new Error('Usage: tsx tools/shot-save-fixture.ts <dungeonId> <classId:level> [<classId:level>] [--run]');

const NOW_MS = Date.now();
const memory = { saved: null as string | null };
const store = createGameStore({ read: () => memory.saved, write: (text) => { memory.saved = text; }, clear: () => { memory.saved = null; } });
store.startNewGame();
const heroes: Hero[] = heroArguments.map((argument, index) => {
  const [classId, level] = argument.split(':');
  const hero = createSimulatedHero(classId as ClassId, Number(level), index);
  return learnSpellsFor(equipBestGear(hero, createRandom(index + 1)), true);
});
const dungeonIndex = DUNGEONS.findIndex((dungeon) => dungeon.id === dungeonId);
if (dungeonIndex < 0) throw new Error(`Unknown dungeon ${dungeonId}`);
store.execute((state) => ({ ...state, company: heroes, heroesHired: heroes.length, clearedDungeonIds: DUNGEONS.slice(0, dungeonIndex).map((dungeon) => dungeon.id) }));
if (startsRun) store.execute(startDungeonRunCommand(dungeonId, heroes.map((hero) => hero.id), NOW_MS));
console.log(memory.saved);
