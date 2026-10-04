import { DEFAULT_LANGUAGE, LANGUAGES, type LanguageId } from '../content/translations';
import type { AudioPreferences } from '../model/audioPreferences';

const SETTINGS_KEY = 'emberforge.settings';

interface StoredSettings {
  language?: string;
  audio?: Partial<AudioPreferences>;
  staysOnDungeonScreen?: boolean;
  seenChangelogVersion?: string;
}

function readSettings(): StoredSettings {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as StoredSettings;
  } catch {
    return {};
  }
}

function isKnownLanguage(value: string | undefined): value is LanguageId {
  return LANGUAGES.some((language) => language.id === value);
}

export function loadLanguagePreference(): LanguageId {
  const saved = readSettings().language;
  if (isKnownLanguage(saved)) return saved;
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : DEFAULT_LANGUAGE;
}

export function saveLanguagePreference(language: LanguageId): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...readSettings(), language }));
  } catch {
    return;
  }
}

const DEFAULT_AUDIO: AudioPreferences = { musicVolume: 0.5, effectsVolume: 0.7, muted: false };

function clampVolume(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && value >= 0 && value <= 1 ? value : fallback;
}

export function loadAudioPreferences(): AudioPreferences {
  const saved = readSettings().audio ?? {};
  return {
    musicVolume: clampVolume(saved.musicVolume, DEFAULT_AUDIO.musicVolume),
    effectsVolume: clampVolume(saved.effectsVolume, DEFAULT_AUDIO.effectsVolume),
    muted: saved.muted === true,
  };
}

export function saveAudioPreferences(preferences: AudioPreferences): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...readSettings(), audio: preferences }));
  } catch {
    return;
  }
}

export function loadStaysOnDungeonScreen(): boolean {
  return readSettings().staysOnDungeonScreen === true;
}

export function saveStaysOnDungeonScreen(staysOnDungeonScreen: boolean): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...readSettings(), staysOnDungeonScreen }));
  } catch {
    return;
  }
}

export function loadSeenChangelogVersion(): string | null {
  return readSettings().seenChangelogVersion ?? null;
}

export function saveSeenChangelogVersion(seenChangelogVersion: string): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...readSettings(), seenChangelogVersion }));
  } catch {
    return;
  }
}
