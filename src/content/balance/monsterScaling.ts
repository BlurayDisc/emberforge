interface LinearScaling {
  base: number;
  perLevel: number;
}

export const MONSTER_HP: LinearScaling = { base: 40, perLevel: 28 };
export const MONSTER_ATTACK: LinearScaling = { base: 2, perLevel: 1.2 };
export const MONSTER_DEFENCE: LinearScaling = { base: 2, perLevel: 1.2 };
export const MONSTER_RESISTANCE: LinearScaling = { base: 1, perLevel: 0.8 };
export const MONSTER_CRITICAL_CHANCE = 0.05;
