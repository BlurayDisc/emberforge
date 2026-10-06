import * as Tone from 'tone';
import type { MusicVoice, SoundLayer } from '../content/audio';

const ATTACK_SECONDS = 0.004;
const PLUCK_RELEASE_SECONDS = 0.02;
const HELD_ATTACK_SECONDS = 0.02;
const HELD_DECAY_SECONDS = 0.12;
const HELD_RELEASE_SECONDS = 0.12;
const NOISE_HIGHPASS_HERTZ = 5000;
const DISPOSE_MARGIN_SECONDS = 0.5;

type Envelope = Pick<Tone.EnvelopeOptions, 'attack' | 'decay' | 'sustain' | 'release' | 'attackCurve' | 'decayCurve'>;

// A pluck: a fast rise, then a straight fall to silence over the whole note.
function pluckEnvelope(durationSeconds: number): Envelope {
  return { attack: ATTACK_SECONDS, decay: durationSeconds, sustain: 0, release: PLUCK_RELEASE_SECONDS, attackCurve: 'linear', decayCurve: 'linear' };
}

function heldEnvelope(sustain: number): Envelope {
  return { attack: HELD_ATTACK_SECONDS, decay: HELD_DECAY_SECONDS, sustain, release: HELD_RELEASE_SECONDS, attackCurve: 'linear', decayCurve: 'exponential' };
}

// Tone nodes are not freed by the browser, so a one-shot sound disposes its nodes after it ends.
function disposeAfter(endTime: number, nodes: Array<Tone.ToneAudioNode | null>): void {
  const delayMilliseconds = (endTime - Tone.now() + DISPOSE_MARGIN_SECONDS) * 1000;
  window.setTimeout(() => nodes.forEach((node) => node?.dispose()), Math.max(0, delayMilliseconds));
}

// One layer of a sound effect, made from a new Tone synth that lives as long as the sound.
export function playEffectLayer(destination: Tone.InputNode, layer: SoundLayer, startTime: number): void {
  const filter = layer.filter ? new Tone.Filter(layer.filter.frequency, layer.filter.type).connect(destination) : null;
  const output = filter ?? destination;
  const envelope = pluckEnvelope(layer.durationSeconds);
  if (layer.wave === 'noise') {
    const noise = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope }).connect(output);
    noise.triggerAttackRelease(layer.durationSeconds, startTime, layer.volume);
    disposeAfter(startTime + layer.durationSeconds, [noise, filter]);
    return;
  }
  const tone = new Tone.Synth({ oscillator: { type: layer.wave }, envelope }).connect(output);
  tone.triggerAttackRelease(layer.startFrequency ?? 440, layer.durationSeconds, startTime, layer.volume);
  if (layer.endFrequency !== undefined) tone.frequency.exponentialRampToValueAtTime(Math.max(20, layer.endFrequency), startTime + layer.durationSeconds);
  disposeAfter(startTime + layer.durationSeconds, [tone, filter]);
}

export interface MusicVoicePlayer {
  // A null frequency is a noise hit.
  playNote(frequency: number | null, durationSeconds: number, time: number): void;
  dispose(): void;
}

// One voice of a music track. Its synth lives as long as the track, and every note goes through it.
export function createMusicVoicePlayer(voice: MusicVoice, destination: Tone.InputNode): MusicVoicePlayer {
  const sustain = voice.sustain ?? 0;
  const envelopeFor = (durationSeconds: number): Envelope => (sustain > 0 ? heldEnvelope(sustain) : pluckEnvelope(durationSeconds));
  if (voice.wave === 'noise') {
    const filter = new Tone.Filter(NOISE_HIGHPASS_HERTZ, 'highpass').connect(destination);
    const noise = new Tone.NoiseSynth({ noise: { type: 'white' } }).connect(filter);
    return {
      playNote: (_frequency, durationSeconds, time) => {
        noise.envelope.set(envelopeFor(durationSeconds));
        noise.triggerAttackRelease(durationSeconds, time, voice.volume);
      },
      dispose: () => {
        noise.dispose();
        filter.dispose();
      },
    };
  }
  const tone = new Tone.Synth({ oscillator: { type: voice.wave } }).connect(destination);
  return {
    playNote: (frequency, durationSeconds, time) => {
      tone.envelope.set(envelopeFor(durationSeconds));
      tone.triggerAttackRelease(frequency ?? 440, durationSeconds, time, voice.volume);
    },
    dispose: () => tone.dispose(),
  };
}
