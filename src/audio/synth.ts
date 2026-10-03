import type { SoundLayer } from '../content/audio';

let noiseBuffer: AudioBuffer | null = null;

function noiseBufferFor(context: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === context.sampleRate) return noiseBuffer;
  const length = context.sampleRate;
  noiseBuffer = context.createBuffer(1, length, context.sampleRate);
  const samples = noiseBuffer.getChannelData(0);
  for (let index = 0; index < length; index++) samples[index] = Math.random() * 2 - 1;
  return noiseBuffer;
}

const ATTACK_SECONDS = 0.004;

// A short percussive envelope: a fast rise, then a straight fall to silence.
function applyEnvelope(gain: GainNode, startTime: number, durationSeconds: number, volume: number): void {
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + ATTACK_SECONDS);
  gain.gain.linearRampToValueAtTime(0.0001, startTime + durationSeconds);
}

export function playLayer(context: AudioContext, destination: AudioNode, layer: SoundLayer, startTime: number): void {
  const gain = context.createGain();
  applyEnvelope(gain, startTime, layer.durationSeconds, layer.volume);
  let lastNode: AudioNode = gain;

  if (layer.filter) {
    const filter = context.createBiquadFilter();
    filter.type = layer.filter.type;
    filter.frequency.value = layer.filter.frequency;
    gain.connect(filter);
    lastNode = filter;
  }
  lastNode.connect(destination);

  if (layer.wave === 'noise') {
    const source = context.createBufferSource();
    source.buffer = noiseBufferFor(context);
    source.connect(gain);
    source.start(startTime);
    source.stop(startTime + layer.durationSeconds);
    return;
  }
  const oscillator = context.createOscillator();
  oscillator.type = layer.wave;
  oscillator.frequency.setValueAtTime(layer.startFrequency ?? 440, startTime);
  if (layer.endFrequency !== undefined) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, layer.endFrequency), startTime + layer.durationSeconds);
  }
  oscillator.connect(gain);
  oscillator.start(startTime);
  oscillator.stop(startTime + layer.durationSeconds + 0.02);
}
