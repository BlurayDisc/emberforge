import { PROFESSION_IDS } from '../../../content/baseItems';
import type { TimedJob } from '../../../model/timedJob';
import { readNumber, readRecord, readWholeNumber, type SalvageTally } from './lenientReaders';
import { salvageItem } from './salvageItem';

const MAXIMUM_NUMBER = Number.MAX_SAFE_INTEGER;

// A craft job that holds a broken item is dropped with it.
export function salvageJob(value: unknown, tally: SalvageTally): TimedJob | null {
  const record = readRecord(value);
  if (!record) return null;
  const id = readWholeNumber(record.id, 0, MAXIMUM_NUMBER, -1);
  const startedAtMs = readNumber(record.startedAtMs, 0, MAXIMUM_NUMBER, -1);
  const finishesAtMs = readNumber(record.finishesAtMs, 0, MAXIMUM_NUMBER, -1);
  if (id < 0 || startedAtMs < 0 || finishesAtMs < 0) return null;
  if (record.kind === 'sell') {
    return { kind: 'sell', id, startedAtMs, finishesAtMs, copper: readWholeNumber(record.copper, 0, MAXIMUM_NUMBER, 0) };
  }
  const professionId = PROFESSION_IDS.find((candidate) => candidate === record.professionId);
  const item = record.kind === 'craft' ? salvageItem(record.item, tally) : null;
  if (!professionId || !item) return null;
  return {
    kind: 'craft',
    id,
    startedAtMs,
    finishesAtMs,
    professionId,
    item,
    crafterExperience: readNumber(record.crafterExperience, 0, MAXIMUM_NUMBER, 0),
    isWaitingForCollection: record.isWaitingForCollection === true,
  };
}
