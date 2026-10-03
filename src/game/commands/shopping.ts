import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import { applyExperience, experienceToNextLevel } from '../../systems/progression';
import { materialBuyPrice, trainingCost, trainingExperience } from '../../systems/economy';
import { addMaterials } from '../../systems/inventory';
import { CommandRejected, type Command } from '../gameStore';
import { runOfHero } from '../runStatus';
import { highestUnlockedTier } from '../unlockedTier';

export function buyMaterialCommand(materialId: string, quantity: number): Command {
  return (state) => {
    const material = requireById(MATERIALS, materialId);
    if (material.tier > highestUnlockedTier(state) || material.category === 'catalyst') throw new CommandRejected('reject.notForSale');
    const price = materialBuyPrice(material.sellValueCopper) * quantity;
    if (state.copper < price) throw new CommandRejected('reject.notEnoughMoney');
    const backpack = addMaterials(state.backpack, [{ materialId, quantity }]);
    if (backpack.overflow.length > 0) throw new CommandRejected('reject.backpackFullForItem');
    return { ...state, copper: state.copper - price, backpack: backpack.entries };
  };
}

export function trainHeroCommand(heroId: string): Command {
  return (state) => {
    const hero = state.company.find((candidate) => candidate.id === heroId);
    if (!hero) throw new CommandRejected('reject.heroMissing');
    if (runOfHero(state, heroId)) throw new CommandRejected('reject.heroBusy');
    const experience = trainingExperience(experienceToNextLevel(hero.level));
    const cost = trainingCost(hero.level, experience);
    if (state.copper < cost) throw new CommandRejected('reject.notEnoughMoney');
    return {
      ...state,
      copper: state.copper - cost,
      company: state.company.map((candidate) => (candidate.id === heroId ? applyExperience(candidate, experience) : candidate)),
    };
  };
}
