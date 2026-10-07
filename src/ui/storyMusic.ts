// The story scenes (the opening and the chapter beats) play their own music track over the town or battle music.
const listeners = new Set<() => void>();
let storyMusicActive = false;

export function isStoryMusicActive(): boolean {
  return storyMusicActive;
}

export function setStoryMusicActive(active: boolean): void {
  if (storyMusicActive === active) return;
  storyMusicActive = active;
  listeners.forEach((listener) => listener());
}

export function onStoryMusicChange(listener: () => void): void {
  listeners.add(listener);
}
