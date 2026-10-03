import {
  SALE_SECONDS_MAXIMUM,
  SALE_SECONDS_MINIMUM,
  SALE_SECONDS_PER_COPPER,
} from '../../content/balance/economy';

// Selling takes time. A cheap item sells in seconds and the best items take up to ten minutes.
// That time, and the few merchant slots, make the player manage the backpack.
export function saleSeconds(valueCopper: number): number {
  return Math.min(SALE_SECONDS_MAXIMUM, Math.round(SALE_SECONDS_MINIMUM + valueCopper * SALE_SECONDS_PER_COPPER));
}
