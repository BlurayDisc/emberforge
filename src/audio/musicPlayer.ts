import * as Tone from 'tone';
import { onAudioReady, type AudioBuses } from './audioEngine';
import { buildTrack, type BuiltTrack } from './trackBuilder';

const FADE_IN_SECONDS = 0.25;
const FADE_OUT_SECONDS = 0.7;
const START_DELAY_SECONDS = 0.05;

interface PlayingTrack {
  track: BuiltTrack;
  gain: Tone.Gain;
}

let buses: AudioBuses | null = null;
let wantedTrackId: string | null = null;
let currentPlayingId: string | null = null;
let playing: PlayingTrack | null = null;

function fadeOutAndDispose({ track, gain }: PlayingTrack): void {
  track.stop();
  gain.gain.rampTo(0, FADE_OUT_SECONDS);
  window.setTimeout(() => {
    track.dispose();
    gain.dispose();
  }, FADE_OUT_SECONDS * 1000 + 200);
}

function startTrack(trackId: string, readyBuses: AudioBuses): void {
  const gain = new Tone.Gain(0).connect(readyBuses.music);
  const track = buildTrack(trackId, gain);
  if (!track) {
    gain.dispose();
    return;
  }
  gain.gain.rampTo(1, FADE_IN_SECONDS);
  const transport = Tone.getTransport();
  // A relative time such as "+0.05" counts from the audio clock, not from the Transport, so it would start the track late by the time the Transport has run.
  track.start(`${Math.round(transport.ticks + transport.toTicks(START_DELAY_SECONDS))}i`);
  if (transport.state !== 'started') transport.start();
  playing = { track, gain };
}

export function playMusic(trackId: string | null): void {
  wantedTrackId = trackId;
  if (!buses) {
    onAudioReady((readyBuses) => {
      buses = readyBuses;
      playMusic(wantedTrackId);
    });
    return;
  }
  if (playing && trackId === currentPlayingId) return;
  if (playing) fadeOutAndDispose(playing);
  playing = null;
  currentPlayingId = trackId;
  if (trackId !== null) startTrack(trackId, buses);
}
