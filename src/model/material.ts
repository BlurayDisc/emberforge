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
  | 'essence'
  | 'catalyst';

export interface MaterialStack {
  materialId: string;
  quantity: number;
}
