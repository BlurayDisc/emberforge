export type ClassId = 'warrior' | 'archer' | 'mage' | 'priest' | 'thief';

export interface Hero {
  id: string;
  name: string;
  classId: ClassId;
  level: number;
  experience: number;
  healthFraction: number;
}
