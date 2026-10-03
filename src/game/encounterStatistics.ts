import type { BattleReport, BattleUnit } from '../model/battle';

export interface HeroPerformance {
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  monstersDefeated: number;
}

export function summariseHeroPerformance(report: BattleReport, heroIds: readonly string[], monsterUnits: readonly BattleUnit[]): Map<string, HeroPerformance> {
  const performanceByHero = new Map<string, HeroPerformance>(
    heroIds.map((heroId) => [heroId, { damageDealt: 0, damageTaken: 0, healingDone: 0, monstersDefeated: 0 }]),
  );
  const monsterIds = new Set(monsterUnits.map((monster) => monster.id));

  for (const event of report.events) {
    const actorPerformance = performanceByHero.get(event.actorId);
    const targetPerformance = performanceByHero.get(event.targetId);
    if (event.kind === 'heal') {
      if (actorPerformance) actorPerformance.healingDone += event.amount;
      continue;
    }
    if (actorPerformance) actorPerformance.damageDealt += event.amount;
    if (targetPerformance) targetPerformance.damageTaken += event.amount;
    if (actorPerformance && monsterIds.has(event.targetId) && event.targetHpAfter === 0) actorPerformance.monstersDefeated += 1;
  }
  return performanceByHero;
}
