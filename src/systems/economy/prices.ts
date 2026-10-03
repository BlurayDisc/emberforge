import {
  MATERIAL_BUY_PRICE_MULTIPLIER,
  TRAINING_COST_PER_EXPERIENCE_BASE,
  TRAINING_COST_PER_EXPERIENCE_GROWTH,
  TRAINING_EXPERIENCE_FRACTION,
} from '../../content/balance/economy';

// The merchant buys low and sells high. That gap keeps buying from beating fighting.
export function materialBuyPrice(sellValueCopper: number): number {
  return Math.round(sellValueCopper * MATERIAL_BUY_PRICE_MULTIPLIER);
}

export function trainingExperience(experienceToNextLevel: number): number {
  return Math.max(1, Math.round(experienceToNextLevel * TRAINING_EXPERIENCE_FRACTION));
}

// Training costs grow with the hero level, so gold keeps its use at every stage.
export function trainingCost(heroLevel: number, experienceGained: number): number {
  return Math.round(experienceGained * (TRAINING_COST_PER_EXPERIENCE_BASE + TRAINING_COST_PER_EXPERIENCE_GROWTH * heroLevel));
}
