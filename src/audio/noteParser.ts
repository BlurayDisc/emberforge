import type { MusicVoice } from '../content/audio';

const NOTE_OFFSETS: Readonly<Record<string, number>> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export interface ParsedNote {
  step: number;
  lengthSteps: number;
  // Null is a noise hit.
  frequency: number | null;
}

export interface ParsedVoice {
  voice: MusicVoice;
  notes: ParsedNote[];
  totalSteps: number;
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
export function parseVoice(voice: MusicVoice): ParsedVoice {
  let step = 0;
  const notes: ParsedNote[] = [];
  for (const token of voice.notes.split(/\s+/)) {
    const [name = '-', lengthText = '1'] = token.split(':');
    const lengthSteps = Number(lengthText);
    if (name !== '-') notes.push({ step, lengthSteps, frequency: name === 'x' ? null : frequencyOf(name) });
    step += lengthSteps;
  }
  return { voice, notes, totalSteps: step };
}
