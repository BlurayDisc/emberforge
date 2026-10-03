// The numbers a player reads on the hero screen. Strength, skill and magic are the attributes (Str, Agi, Int).
export interface HeroSheet {
  health: number;
  resource: number;
  physicalDamage: number;
  magicalDamage: number;
  armour: number;
  resistance: number;
  speed: number;
  strength: number;
  skill: number;
  magic: number;
}
