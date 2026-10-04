import { LEVEL_CAP } from '../../../content/balance/progression';
import { NORMAL_SPELL_SLOT_COUNT } from '../../../content/balance/spells';
import { CLASSES } from '../../../content/classes';
import { heroNamesForClass } from '../../../content/heroNames';
import { findSpell } from '../../../content/spells';
import type { Hero, HeroEquipment, HeroStatistics } from '../../../model/hero';
import type { EquipmentSlot, Item } from '../../../model/item';
import { readNumber, readRecord, readText, readTexts, readWholeNumber, type SalvageTally } from './lenientReaders';
import { salvageItem } from './salvageItem';

const EQUIPMENT_SLOTS: readonly EquipmentSlot[] = ['mainHand', 'offHand', 'helm', 'armour', 'gloves', 'boots', 'belt', 'amulet', 'ringOne', 'ringTwo'];
const STATISTIC_NAMES: readonly (keyof HeroStatistics)[] = ['monstersDefeated', 'damageDealt', 'damageTaken', 'healingDone', 'secondsFought', 'battlesWon', 'battlesLost'];

function fitsSlot(item: Item, slot: EquipmentSlot): boolean {
  return item.slot === 'ring' ? slot === 'ringOne' || slot === 'ringTwo' : item.slot === slot;
}

// A piece of gear that is broken, or sits in a slot it does not fit, is left out. The hero stays.
function salvageEquipment(value: unknown, tally: SalvageTally): HeroEquipment {
  const record = readRecord(value) ?? {};
  const equipment: HeroEquipment = {};
  for (const slot of EQUIPMENT_SLOTS) {
    if (record[slot] === undefined) continue;
    const item = salvageItem(record[slot], tally);
    if (item && fitsSlot(item, slot)) equipment[slot] = item;
    else tally.droppedCount += 1;
  }
  return equipment;
}

function salvageStatistics(value: unknown): HeroStatistics {
  const record = readRecord(value) ?? {};
  const read = (name: keyof HeroStatistics): number => readNumber(record[name], 0, Number.MAX_SAFE_INTEGER, 0);
  return Object.fromEntries(STATISTIC_NAMES.map((name) => [name, read(name)])) as unknown as HeroStatistics;
}

export function salvageHero(value: unknown, position: number, tally: SalvageTally): Hero | null {
  const record = readRecord(value);
  const definition = CLASSES.find((candidate) => candidate.id === record?.classId);
  if (!record || !definition) return null;
  const learnedSpellIds = readTexts(record.learnedSpellIds, (id) => findSpell(id)?.classId === definition.id, tally);
  const equippedSpellIds = Array.from({ length: NORMAL_SPELL_SLOT_COUNT }, (_, slot) => {
    const spellId = (Array.isArray(record.equippedSpellIds) ? record.equippedSpellIds[slot] : null) as unknown;
    return typeof spellId === 'string' && learnedSpellIds.includes(spellId) && findSpell(spellId)?.isUltimate === false ? spellId : null;
  });
  const ultimateId = record.equippedUltimateId;
  return {
    id: readText(record.id) ?? `hero-${position + 1}`,
    name: readText(record.name) ?? heroNamesForClass(definition.id)[0] ?? definition.displayName,
    classId: definition.id,
    level: readWholeNumber(record.level, 1, LEVEL_CAP, 1),
    experience: readNumber(record.experience, 0, Number.MAX_SAFE_INTEGER, 0),
    healthFraction: readNumber(record.healthFraction, 0, 1, 1),
    healthAsOfMs: readNumber(record.healthAsOfMs, 0, Number.MAX_SAFE_INTEGER, 0),
    downedUntilMs: record.downedUntilMs === null ? null : readNumber(record.downedUntilMs, 0, Number.MAX_SAFE_INTEGER, 0) || null,
    equipment: salvageEquipment(record.equipment, tally),
    learnedSpellIds,
    equippedSpellIds,
    equippedUltimateId: typeof ultimateId === 'string' && learnedSpellIds.includes(ultimateId) && findSpell(ultimateId)?.isUltimate === true ? ultimateId : null,
    statistics: salvageStatistics(record.statistics),
  };
}
