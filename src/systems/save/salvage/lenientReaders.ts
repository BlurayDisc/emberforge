// A salvage reader never throws. It returns the value when it is valid, and a fallback or null when it is not.
export type UnknownRecord = Record<string, unknown>;

export interface SalvageTally {
  droppedCount: number;
}

export function readRecord(value: unknown): UnknownRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as UnknownRecord) : null;
}

export function readList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function readText(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function readNumber(value: unknown, minimum: number, maximum: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum ? value : fallback;
}

export function readWholeNumber(value: unknown, minimum: number, maximum: number, fallback: number): number {
  return Number.isInteger(value) ? readNumber(value, minimum, maximum, fallback) : fallback;
}

export function readTexts(value: unknown, isKnown: (text: string) => boolean, tally: SalvageTally): string[] {
  const kept = readList(value).filter((entry): entry is string => typeof entry === 'string' && isKnown(entry));
  tally.droppedCount += readList(value).length - kept.length;
  return kept;
}

export function readEach<Salvaged>(value: unknown, readOne: (entry: unknown) => Salvaged | null, tally: SalvageTally): Salvaged[] {
  const entries = readList(value);
  const kept = entries.flatMap((entry) => {
    const salvaged = readOne(entry);
    return salvaged === null ? [] : [salvaged];
  });
  tally.droppedCount += entries.length - kept.length;
  return kept;
}
