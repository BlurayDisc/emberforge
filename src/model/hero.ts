import type { EquipmentSlot, Item } from './item';

export type ClassId = 'warrior' | 'archer' | 'mage' | 'priest' | 'thief';

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
  healthFraction: number;
  equipment: HeroEquipment;
  statistics: HeroStatistics;
}
