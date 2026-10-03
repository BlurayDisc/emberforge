import type { EquipmentSlot, Item } from './item';

export type ClassId = 'warrior' | 'archer' | 'mage' | 'priest' | 'thief';

export type HeroEquipment = Partial<Record<EquipmentSlot, Item>>;

export interface Hero {
  id: string;
  name: string;
  classId: ClassId;
  level: number;
  experience: number;
  healthFraction: number;
  equipment: HeroEquipment;
}
