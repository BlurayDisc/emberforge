export type MaterialCategory =
  | 'ore'
  | 'wood'
  | 'hide'
  | 'cloth'
  | 'gem'
  | 'fang'
  | 'scale'
  | 'bone'
  | 'sinew'
  | 'skin'
  | 'silk'
  | 'essence'
  | 'catalyst';

export interface MaterialStack {
  materialId: string;
  quantity: number;
}
