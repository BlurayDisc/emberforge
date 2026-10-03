import { COPPER_PER_SILVER, SILVER_PER_GOLD } from '../../content/balance/economy';
import type { MoneyBreakdown } from '../../model/money';

export function splitCopper(totalCopper: number): MoneyBreakdown {
  const copperPerGold = COPPER_PER_SILVER * SILVER_PER_GOLD;
  const gold = Math.floor(totalCopper / copperPerGold);
  const silver = Math.floor((totalCopper % copperPerGold) / COPPER_PER_SILVER);
  const copper = totalCopper % COPPER_PER_SILVER;
  return { gold, silver, copper };
}
