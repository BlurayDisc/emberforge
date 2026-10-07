// The numbers a player reads on the hero screen. Strength, agility and intelligence are the attributes (Str, Agi, Int).
export interface HeroSheet {
  health: number;
  resource: number;
  // The damage of one basic attack. It is physical or magical by the attack kind of the class.
  damage: number;
  armour: number;
  resistance: number;
  // Seconds for one basic attack.
  attackSeconds: number;
  strength: number;
  agility: number;
  intelligence: number;
  // Percent points.
  criticalChance: number;
  criticalDamage: number;
  lifeSteal: number;
  movementSpeed: number;
}
