import { MUSIC_TRACKS, type MusicTrack } from '../content/audio';
import { onAudioReady, type AudioBuses } from './audioEngine';
import { playLayer } from './synth';

const LOOKAHEAD_SECONDS = 0.25;
const SCHEDULER_INTERVAL_MILLISECONDS = 60;
const FADE_SECONDS = 0.7;
const NOTE_OFFSETS: Readonly<Record<string, number>> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

interface ScheduledNote {
  step: number;
  lengthSteps: number;
  frequency: number | null;
}

interface ParsedVoice {
  wave: MusicTrack['voices'][number]['wave'];
  volume: number;
  notes: ScheduledNote[];
  totalSteps: number;
}

interface PlayingTrack {
  voices: ParsedVoice[];
  stepSeconds: number;
  totalSteps: number;
  nextStep: number;
  nextStepTime: number;
  gain: GainNode;
  timer: number;
}

function frequencyOf(noteName: string): number | null {
  const match = /^([A-G])([#b]?)(\d)$/.exec(noteName);
  if (!match) return null;
  const accidental = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  const midi = 12 * (Number(match[3]) + 1) + (NOTE_OFFSETS[match[1] as string] ?? 0) + accidental;
  return 440 * 2 ** ((midi - 69) / 12);
}

// A note string is "NAME:LENGTH" tokens, for example "D5:2 -:1 x:1". NAME is a pitch,
// "-" for a rest, or "x" for a noise hit. LENGTH counts steps.
function parseVoice(voice: MusicTrack['voices'][number]): ParsedVoice {
  let step = 0;
  const notes: ScheduledNote[] = [];
  for (const token of voice.notes.split(/\s+/)) {
    const [name = '-', lengthText = '1'] = token.split(':');
    const lengthSteps = Number(lengthText);
    if (name !== '-') notes.push({ step, lengthSteps, frequency: name === 'x' ? null : frequencyOf(name) });
    step += lengthSteps;
  }
  return { wave: voice.wave, volume: voice.volume, notes, totalSteps: step };
}

let buses: AudioBuses | null = null;
let wantedTrackId: string | null = null;
let currentPlayingId: string | null = null;
let playing: PlayingTrack | null = null;

function stopPlaying(track: PlayingTrack): void {
  window.clearInterval(track.timer);
  const stopTime = track.gain.context.currentTime + FADE_SECONDS;
  track.gain.gain.cancelScheduledValues(track.gain.context.currentTime);
  track.gain.gain.setValueAtTime(track.gain.gain.value, track.gain.context.currentTime);
  track.gain.gain.linearRampToValueAtTime(0.0001, stopTime);
  window.setTimeout(() => track.gain.disconnect(), FADE_SECONDS * 1000 + 200);
}

function scheduleDueSteps(track: PlayingTrack, context: AudioContext): void {
  while (track.nextStepTime < context.currentTime + LOOKAHEAD_SECONDS) {
    const stepInLoop = track.nextStep % track.totalSteps;
    for (const voice of track.voices) {
      for (const note of voice.notes) {
        if (note.step !== stepInLoop) continue;
        const durationSeconds = Math.max(0.05, note.lengthSteps * track.stepSeconds * 0.92);
        playLayer(
          context,
          track.gain,
          voice.wave === 'noise'
            ? { wave: 'noise', durationSeconds: Math.min(0.08, durationSeconds), volume: voice.volume, filter: { type: 'highpass', frequency: 5000 } }
            : { wave: voice.wave, startFrequency: note.frequency ?? 440, durationSeconds, volume: voice.volume },
          track.nextStepTime,
        );
      }
    }
    track.nextStep += 1;
    track.nextStepTime += track.stepSeconds;
  }
}

function startTrack(trackId: string, readyBuses: AudioBuses): void {
  const definition = MUSIC_TRACKS[trackId];
  if (!definition) return;
  const { context, music } = readyBuses;
  const voices = definition.voices.map(parseVoice);
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.linearRampToValueAtTime(1, context.currentTime + FADE_SECONDS);
  gain.connect(music);
  const track: PlayingTrack = {
    voices,
    stepSeconds: 60 / definition.tempoBpm / definition.stepsPerBeat,
    totalSteps: Math.max(...voices.map((voice) => voice.totalSteps)),
    nextStep: 0,
    nextStepTime: context.currentTime + 0.05,
    gain,
    timer: window.setInterval(() => scheduleDueSteps(track, context), SCHEDULER_INTERVAL_MILLISECONDS),
  };
  playing = track;
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
  if (playing) stopPlaying(playing);
  playing = null;
  currentPlayingId = trackId;
  if (trackId !== null) startTrack(trackId, buses);
}

