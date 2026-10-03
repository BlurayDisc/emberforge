import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import type { GameState } from '../../model/gameState';
import { materialBuyPrice, trainingCost, trainingExperience } from '../../systems/economy';
import { experienceToNextLevel } from '../../systems/progression';
import { runOfHero } from '../runStatus';
import { highestUnlockedTier } from '../unlockedTier';

export interface MaterialOffer {
  materialId: string;
  unitPrice: number;
}

export interface TrainingOffer {
  heroId: string;
  cost: number;
  experience: number;
  isAffordable: boolean;
  isAway: boolean;
}

export function listMaterialOffers(state: GameState): MaterialOffer[] {
  return MATERIALS.filter((material) => material.tier <= highestUnlockedTier(state) && material.category !== 'catalyst').map((material) => ({
    materialId: requireById(MATERIALS, material.id).id,
    unitPrice: materialBuyPrice(material.sellValueCopper),
  }));
}

export function listTrainingOffers(state: GameState): TrainingOffer[] {
  return state.company.map((hero) => {
    const experience = trainingExperience(experienceToNextLevel(hero.level));
    const cost = trainingCost(hero.level, experience);
    return { heroId: hero.id, cost, experience, isAffordable: state.copper >= cost, isAway: runOfHero(state, hero.id) !== undefined };
  });
}
