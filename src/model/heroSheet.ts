// The numbers a player reads on the hero screen. Strength, agility and intelligence are the attributes (Str, Agi, Int).
export interface HeroSheet {
  health: number;
  resource: number;
  physicalDamage: number;
  magicalDamage: number;
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
}
