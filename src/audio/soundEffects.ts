import { SOUND_EFFECTS } from '../content/audio';
import { audioBuses } from './audioEngine';
import { playLayer } from './synth';

const MINIMUM_SECONDS_BETWEEN_SAME_EFFECT = 0.03;
const lastPlayedAtById = new Map<string, number>();

export function playSound(effectId: string, delaySeconds = 0): void {
  const buses = audioBuses();
  const layers = SOUND_EFFECTS[effectId];
  if (!buses || !layers) return;
  const { context, effects } = buses;
  // At 4x speed the same effect can fire many times in one frame. Skipping near-duplicates
  // keeps the mix clean and protects the browser from too many audio nodes.
  const now = context.currentTime;
  if (now - (lastPlayedAtById.get(effectId) ?? -1) < MINIMUM_SECONDS_BETWEEN_SAME_EFFECT) return;
  lastPlayedAtById.set(effectId, now);
  for (const layer of layers) playLayer(context, effects, layer, now + delaySeconds + (layer.delaySeconds ?? 0));
}
