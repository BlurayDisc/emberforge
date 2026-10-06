import * as Tone from 'tone';
import { MUSIC_TRACKS, SOUND_EFFECTS } from '../content/audio';
import { buildTrack, trackLoopSeconds } from './trackBuilder';
import { playEffectLayer } from './synth';

const AUDIBLE_LEVEL = 0.001;
const PITCH_WINDOW_SECONDS = 0.05;
const TAIL_SECONDS = 0.3;

export interface SoundReport {
  id: string;
  kind: 'effect' | 'music';
  peak: number;
  rms: number;
  leadingSilenceSeconds: number;
  soundSeconds: number;
  renderedSeconds: number;
  // Counted from zero crossings in the first moments of the sound, so it is only a rough pitch.
  pitchHertz: number;
}

function measure(id: string, kind: SoundReport['kind'], buffer: Tone.ToneAudioBuffer): SoundReport {
  const samples = buffer.getChannelData(0);
  let peak = 0;
  let squareSum = 0;
  let firstAudible = -1;
  let lastAudible = -1;
  samples.forEach((sample, index) => {
    const level = Math.abs(sample);
    if (level > peak) peak = level;
    squareSum += sample * sample;
    if (level > AUDIBLE_LEVEL) {
      if (firstAudible < 0) firstAudible = index;
      lastAudible = index;
    }
  });
  const windowEnd = Math.min(samples.length, Math.max(0, firstAudible) + Math.round(PITCH_WINDOW_SECONDS * buffer.sampleRate));
  let crossings = 0;
  for (let index = Math.max(1, firstAudible + 1); index < windowEnd; index++) {
    if ((samples[index - 1] ?? 0) < 0 !== (samples[index] ?? 0) < 0) crossings++;
  }
  const round = (value: number): number => Math.round(value * 1000) / 1000;
  return {
    id,
    kind,
    peak: round(peak),
    rms: round(Math.sqrt(squareSum / samples.length)),
    leadingSilenceSeconds: firstAudible < 0 ? buffer.duration : round(firstAudible / buffer.sampleRate),
    soundSeconds: firstAudible < 0 ? 0 : round((lastAudible - firstAudible) / buffer.sampleRate),
    renderedSeconds: round(buffer.duration),
    pitchHertz: Math.round(crossings / 2 / PITCH_WINDOW_SECONDS),
  };
}

async function renderEffect(effectId: string): Promise<SoundReport> {
  const layers = SOUND_EFFECTS[effectId] ?? [];
  const lengthSeconds = Math.max(...layers.map((layer) => (layer.delaySeconds ?? 0) + layer.durationSeconds)) + TAIL_SECONDS;
  const buffer = await Tone.Offline(() => {
    layers.forEach((layer) => playEffectLayer(Tone.getDestination(), layer, layer.delaySeconds ?? 0));
  }, lengthSeconds);
  return measure(effectId, 'effect', buffer);
}

// One full loop of the track, from the Transport start.
async function renderTrack(trackId: string): Promise<SoundReport> {
  const buffer = await Tone.Offline(({ transport }) => {
    buildTrack(trackId, Tone.getDestination())?.start(0);
    transport.start(0);
  }, trackLoopSeconds(trackId) + TAIL_SECONDS);
  return measure(trackId, 'music', buffer);
}

// Used by tools/audio-report.ts inside a real browser, because Tone needs an OfflineAudioContext.
export async function reportAllAudio(): Promise<SoundReport[]> {
  const reports: SoundReport[] = [];
  for (const trackId of Object.keys(MUSIC_TRACKS)) reports.push(await renderTrack(trackId));
  for (const effectId of Object.keys(SOUND_EFFECTS)) reports.push(await renderEffect(effectId));
  return reports;
}
