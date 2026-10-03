// Panels redraw only when the saved state changes, but timers and regenerating health change
// with the clock. An element that registers here gets its update function called twice a second.
// Elements that left the page are dropped, so closed panels leak nothing.
const UPDATE_INTERVAL_MILLISECONDS = 500;
const liveUpdates = new Map<HTMLElement, () => void>();
let timer: number | undefined;

function runUpdates(): void {
  for (const [target, update] of liveUpdates) {
    if (!target.isConnected) {
      liveUpdates.delete(target);
      continue;
    }
    update();
  }
}

export function addLiveUpdate(target: HTMLElement, update: () => void): void {
  update();
  liveUpdates.set(target, update);
  if (timer === undefined) timer = window.setInterval(runUpdates, UPDATE_INTERVAL_MILLISECONDS);
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}
