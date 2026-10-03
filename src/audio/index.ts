import type { AudioPreferences } from '../model/audioPreferences';
import { currentPreferences, setPreferences, unlockAudioOnFirstGesture } from './audioEngine';

export { playMusic } from './musicPlayer';
export { playSound } from './soundEffects';
export { currentPreferences, setPreferences, unlockAudioOnFirstGesture };

export function configureAudio(preferences: AudioPreferences): void {
  setPreferences(preferences);
  unlockAudioOnFirstGesture();
}
