// Draw order on the battle stage, from back to front.
export const BATTLE_Z = {
  ground: 0,
  shadow: 10,
  unit: 20,
  particle: 30,
  projectile: 40,
  effect: 50,
  healthBar: 60,
} as const;
