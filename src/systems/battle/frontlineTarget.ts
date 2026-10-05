import type { BattleUnit } from '../../model/battle';

// Most Defence first. When Defence is equal, the opponent with less health goes first.
export function frontlineOpponent(opponents: readonly BattleUnit[]): BattleUnit {
  return [...opponents].sort((first, second) => second.defence - first.defence || first.hp - second.hp)[0] as BattleUnit;
}
