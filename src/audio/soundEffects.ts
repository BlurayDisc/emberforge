import * as Tone from 'tone';
import { SOUND_EFFECTS } from '../content/audio';
import { audioBuses } from './audioEngine';
import { playEffectLayer } from './synth';

const MINIMUM_SECONDS_BETWEEN_SAME_EFFECT = 0.03;
const lastStartedAtById = new Map<string, number>();

export function playSound(effectId: string, delaySeconds = 0): void {
  const buses = audioBuses();
  const layers = SOUND_EFFECTS[effectId];
  if (!buses || !layers) return;
  const { effects } = buses;
  // At 4x speed the same effect can fire many times in one frame. Skipping near-duplicates
  // keeps the mix clean and protects the browser from too many audio nodes.
  // The check uses the start time, so the hits of one spell can queue the same sound at different delays.
  const now = Tone.now();
  const startTime = now + delaySeconds;
  if (Math.abs(startTime - (lastStartedAtById.get(effectId) ?? -1)) < MINIMUM_SECONDS_BETWEEN_SAME_EFFECT) return;
  lastStartedAtById.set(effectId, startTime);
  for (const layer of layers) playEffectLayer(effects, layer, startTime + (layer.delaySeconds ?? 0));
}
