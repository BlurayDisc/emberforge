import { castleSpot } from '../content/castle';

// Whether the player stands inside the castle, and which people and places the player has already talked to.
// Nothing here is saved: the castle is a place to visit, not a game rule.
let isInside = false;
const heardSpotIds = new Set<string>();
let chapterOneCleared = false;
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

export function isCastleChapterOneCleared(): boolean {
  return chapterOneCleared;
}

// The castle people tell more after chapter 1. A person with new tales shows the gold mark again until the player hears them.
export function setCastleChapterOneCleared(isCleared: boolean): void {
  if (chapterOneCleared === isCleared) return;
  chapterOneCleared = isCleared;
  visitListeners.forEach((listener) => listener());
}

function heardKey(spotId: string): string {
  const hasLaterTales = (castleSpot(spotId).talesAfterChapter1 ?? 0) > 0;
  return hasLaterTales && chapterOneCleared ? `${spotId}:after1` : spotId;
}

export function hasHeardCastleSpot(spotId: string): boolean {
  return heardSpotIds.has(heardKey(spotId));
}

export function markCastleSpotHeard(spotId: string): void {
  if (hasHeardCastleSpot(spotId)) return;
  heardSpotIds.add(heardKey(spotId));
  visitListeners.forEach((listener) => listener());
}
