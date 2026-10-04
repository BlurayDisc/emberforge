import musicData from '../../data/audio/music.json';
import soundEffectsData from '../../data/audio/sound-effects.json';
import type { ClassId } from '../model/hero';
import type { ArmourWeight } from '../model/item';

export type OscillatorWave = 'square' | 'triangle' | 'sawtooth';

export interface MusicVoice {
  wave: OscillatorWave | 'noise';
  volume: number;
  notes: string;
}

export interface MusicTrack {
  tempoBpm: number;
  stepsPerBeat: number;
  voices: readonly MusicVoice[];
}

export interface SoundLayer {
  wave: OscillatorWave | 'noise';
  startFrequency?: number;
  endFrequency?: number;
  durationSeconds: number;
  volume: number;
  delaySeconds?: number;
  filter?: { type: BiquadFilterType; frequency: number };
}

// The sounds of one spell. Each phase is the id of an effect in sound-effects.json.
export interface SpellSoundSet {
  cast?: string;
  projectile?: string;
  impact?: string;
  buff?: string;
  debuff?: string;
}

export const MUSIC_TRACKS = musicData.tracks as unknown as Readonly<Record<string, MusicTrack>>;
export const SOUND_EFFECTS = soundEffectsData.effects as unknown as Readonly<Record<string, readonly SoundLayer[]>>;
export const CLASS_ATTACK_SOUNDS = soundEffectsData.classAttack as Readonly<Record<ClassId, string>>;
export const MONSTER_ATTACK_SOUNDS = soundEffectsData.monsterAttack as Readonly<Record<string, string>>;
export const MONSTER_HURT_SOUNDS = soundEffectsData.monsterHurt as Readonly<Record<string, string>>;
export const ARMOUR_HIT_SOUNDS = soundEffectsData.armourHit as Readonly<Record<ArmourWeight, string>>;
export const SPELL_SOUNDS = soundEffectsData.spellSounds as unknown as Readonly<Record<string, SpellSoundSet>>;
