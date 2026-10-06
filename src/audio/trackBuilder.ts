import * as Tone from 'tone';
import { MUSIC_TRACKS } from '../content/audio';
import { parseVoice, type ParsedVoice } from './noteParser';
import { createMusicVoicePlayer, type MusicVoicePlayer } from './synth';

const NOTE_GAP_FACTOR = 0.92;
const MINIMUM_NOTE_SECONDS = 0.05;
const NOISE_HIT_MAXIMUM_SECONDS = 0.08;

export interface BuiltTrack {
  start(transportTime: Tone.Unit.Time): void;
  stop(): void;
  dispose(): void;
}

// Every voice is a looping Tone.Part on the Transport, so the Transport clock keeps all voices in time.
// The Transport tempo is global: it follows the track that was built last.
function createVoicePart(parsed: ParsedVoice, player: MusicVoicePlayer, stepTicks: number, loopTicks: number): Tone.Part {
  const events = parsed.notes.map((note) => ({ time: `${note.step * stepTicks}i`, note }));
  const part = new Tone.Part<(typeof events)[number]>((time, { note }) => {
    const heldSeconds = Math.max(MINIMUM_NOTE_SECONDS, Tone.Time(`${note.lengthSteps * stepTicks}i`).toSeconds() * NOTE_GAP_FACTOR);
    player.playNote(note.frequency, note.frequency === null ? Math.min(NOISE_HIT_MAXIMUM_SECONDS, heldSeconds) : heldSeconds, time);
  }, events);
  part.loop = true;
  part.loopEnd = `${loopTicks}i`;
  return part;
}

export function trackLoopSeconds(trackId: string): number {
  const definition = MUSIC_TRACKS[trackId];
  if (!definition) return 0;
  const totalSteps = Math.max(...definition.voices.map((voice) => parseVoice(voice).totalSteps));
  return (totalSteps * 60) / definition.tempoBpm / definition.stepsPerBeat;
}

export function buildTrack(trackId: string, destination: Tone.InputNode): BuiltTrack | null {
  const definition = MUSIC_TRACKS[trackId];
  if (!definition) return null;
  const transport = Tone.getTransport();
  transport.bpm.value = definition.tempoBpm;
  const voices = definition.voices.map(parseVoice);
  const stepTicks = transport.PPQ / definition.stepsPerBeat;
  const loopTicks = Math.max(...voices.map((voice) => voice.totalSteps)) * stepTicks;
  const players = voices.map((parsed) => createMusicVoicePlayer(parsed.voice, destination));
  const parts = voices.map((parsed, index) => createVoicePart(parsed, players[index] as MusicVoicePlayer, stepTicks, loopTicks));
  return {
    start: (transportTime) => parts.forEach((part) => part.start(transportTime)),
    stop: () => parts.forEach((part) => part.stop()),
    dispose: () => {
      parts.forEach((part) => part.dispose());
      players.forEach((player) => player.dispose());
    },
  };
}
