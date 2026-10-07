import { createRandom } from '../../src/kernel/random';
import type { ClassId } from '../../src/model/hero';
import { simulateRealtimeBattle } from '../../src/systems/battle';
import { commonGearHeroUnit, normalMonsterUnit } from './realtimeFixtures';

// Usage: npm run timeline:realtime -- [classId] [level] [seed] [monsterCount] [stepSeconds]
const [classArgument = 'warrior', levelArgument = '5', seedArgument = '1', monsterCountArgument = '1', stepArgument = '1'] = process.argv.slice(2);
const stepSeconds = Number(stepArgument);
const random = createRandom(Number(seedArgument));
const hero = commonGearHeroUnit(classArgument as ClassId, Number(levelArgument), random);
const monsters = Array.from({ length: Number(monsterCountArgument) }, (_, index) => normalMonsterUnit(Number(levelArgument), `monster-${index}`, index));
const report = simulateRealtimeBattle([hero, ...monsters], random.fork('battle'));

console.log(`${hero.name} (${classArgument} L${levelArgument}, HP ${hero.maxHp}) vs ${monsters.map((monster) => `${monster.name} (HP ${monster.maxHp})`).join(', ')}. Field ${report.field.length} x ${report.field.depth}, tick ${report.tickSeconds}s.`);
const ticksPerStep = Math.max(1, Math.round(stepSeconds / report.tickSeconds));
const lastTick = report.tracks[0]!.x.length - 1;
for (let startTick = 0; startTick <= lastTick; startTick += ticksPerStep) {
  const endSeconds = Math.min(lastTick, startTick + ticksPerStep) * report.tickSeconds;
  const startSeconds = startTick * report.tickSeconds;
  const positions = report.tracks.map((track) => `${track.unitId}@(${track.x[startTick]!.toFixed(1)},${track.y[startTick]!.toFixed(1)}) ${track.state[startTick]}`).join('  ');
  console.log(`\nt=${startSeconds.toFixed(2)}s  ${positions}`);
  const inWindow = (time: number): boolean => time > startSeconds + 1e-6 && time <= endSeconds + 1e-6 || (startTick === 0 && time <= endSeconds + 1e-6);
  for (const action of report.actionEvents.filter((event) => inWindow(event.timeSeconds))) {
    if (action.kind === 'attackStart') console.log(`  ${action.timeSeconds.toFixed(2)} ${action.actorId} ${action.isHeal ? 'heals' : 'swings at'} ${action.targetId}${action.projectile ? ' (ranged)' : ''}, hit at ${action.hitAtSeconds.toFixed(2)}`);
    if (action.kind === 'castStart') console.log(`  ${action.timeSeconds.toFixed(2)} ${action.actorId} casts ${action.spellId}, lands at ${action.effectAtSeconds.toFixed(2)}`);
    if (action.kind === 'death') console.log(`  ${action.timeSeconds.toFixed(2)} ${action.unitId} dies`);
  }
  for (const event of report.events.filter((candidate) => inWindow(candidate.timeSeconds))) {
    console.log(`  ${event.timeSeconds.toFixed(2)} ${event.kind} ${event.actorId} -> ${event.targetId}: ${event.isDodge ? 'dodged' : event.amount}${event.isCritical ? ' crit' : ''}${event.spellId ? ` [${event.spellId}]` : ''}  (target HP ${event.targetHpAfter})`);
  }
}
console.log(`\n${report.winner} wins after ${report.durationSeconds}s.`);
