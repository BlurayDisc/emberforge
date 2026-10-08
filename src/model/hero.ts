import type { EquipmentSlot, Item } from './item';

export type ClassId = 'warrior' | 'archer' | 'mage' | 'priest' | 'thief' | 'barbarian' | 'fighter';

export type HeroEquipment = Partial<Record<EquipmentSlot, Item>>;

export interface HeroStatistics {
  monstersDefeated: number;
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  secondsFought: number;
  battlesWon: number;
  battlesLost: number;
}

export interface Hero {
  id: string;
  name: string;
  classId: ClassId;
  level: number;
  experience: number;
  // Health as it was at healthAsOfMs. The game adds the regeneration since then (see systems/recovery).
  healthFraction: number;
  healthAsOfMs: number;
  // Set while the hero is down. The hero returns at this time.
  downedUntilMs: number | null;
  equipment: HeroEquipment;
  learnedSpellIds: string[];
  // One entry for each normal slot, in cast order (slot 1 first). An empty slot is null. Ultimate spells go in equippedUltimateId only.
  equippedSpellIds: Array<string | null>;
  equippedUltimateId: string | null;
  statistics: HeroStatistics;
}
