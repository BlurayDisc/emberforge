import castleData from '../../data/castle.json';
import { LOGICAL_WIDTH } from '../kernel/stageSize';

export interface CastleSpot {
  id: string;
  screen: number;
  kind: 'person' | 'landmark';
  // Key of the figure drawing. Landmarks are drawn into the screen backdrop, so they have none.
  look: string | null;
  // Pixel inside the screen. x is the centre. y is the feet of a person or the bottom of a landmark.
  x: number;
  y: number;
  width: number;
  height: number;
  tales: number;
}

export const CASTLE_SPOTS = castleData.spots as unknown as readonly CastleSpot[];

export function castleSpotsOnScreen(screen: number): readonly CastleSpot[] {
  return CASTLE_SPOTS.filter((spot) => spot.screen === screen);
}

export function castleSpot(spotId: string): CastleSpot {
  const spot = CASTLE_SPOTS.find((candidate) => candidate.id === spotId);
  if (!spot) throw new Error(`Unknown castle spot: ${spotId}`);
  return spot;
}

export function castleWorldX(spot: CastleSpot): number {
  return spot.screen * LOGICAL_WIDTH + spot.x;
}
