import type { AudioPreferences } from '../model/audioPreferences';

export interface AudioBuses {
  context: AudioContext;
  music: GainNode;
  effects: GainNode;
}

let preferences: AudioPreferences = { musicVolume: 0.5, effectsVolume: 0.7, muted: false };
let buses: AudioBuses | null = null;
const unlockListeners = new Set<(buses: AudioBuses) => void>();

function applyVolumes(): void {
  if (!buses) return;
  const level = preferences.muted ? 0 : 1;
  buses.music.gain.value = preferences.musicVolume * level;
  buses.effects.gain.value = preferences.effectsVolume * level;
}

export function setPreferences(newPreferences: AudioPreferences): void {
  preferences = { ...newPreferences };
  applyVolumes();
}

export function currentPreferences(): AudioPreferences {
  return { ...preferences };
}

export function audioBuses(): AudioBuses | null {
  return buses;
}

export function onAudioReady(listener: (readyBuses: AudioBuses) => void): void {
  if (buses) listener(buses);
  else unlockListeners.add(listener);
}

// Browsers block audio until the player clicks, taps or presses a key.
// The context is therefore created on the first gesture, not at start-up.
function unlock(): void {
  if (buses) return;
  const context = new AudioContext();
  const music = context.createGain();
  const effects = context.createGain();
  music.connect(context.destination);
  effects.connect(context.destination);
  buses = { context, music, effects };
  applyVolumes();
  void context.resume();
  unlockListeners.forEach((listener) => listener(buses as AudioBuses));
  unlockListeners.clear();
}

export function unlockAudioOnFirstGesture(): void {
  const gestures = ['pointerdown', 'keydown', 'touchstart'] as const;
  const handler = (): void => {
    unlock();
    gestures.forEach((gesture) => window.removeEventListener(gesture, handler));
  };
  gestures.forEach((gesture) => window.addEventListener(gesture, handler));
}
