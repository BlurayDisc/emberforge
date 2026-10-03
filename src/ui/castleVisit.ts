// Whether the player stands inside the castle, and which people and places the player has already talked to.
// Nothing here is saved: the castle is a place to visit, not a game rule.
let isInside = false;
const heardSpotIds = new Set<string>();
const visitListeners = new Set<() => void>();

export function isInCastle(): boolean {
  return isInside;
}

export function setInCastle(isEntering: boolean): void {
  if (isInside === isEntering) return;
  isInside = isEntering;
  visitListeners.forEach((listener) => listener());
}

export function onCastleVisitChange(listener: () => void): void {
  visitListeners.add(listener);
}

export function hasHeardCastleSpot(spotId: string): boolean {
  return heardSpotIds.has(spotId);
}

export function markCastleSpotHeard(spotId: string): void {
  if (heardSpotIds.has(spotId)) return;
  heardSpotIds.add(spotId);
  visitListeners.forEach((listener) => listener());
}
