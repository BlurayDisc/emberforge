import { CLASSES } from '../../src/content/classes';
import { MONSTERS } from '../../src/content/monsters';
import type { ClassId } from '../../src/model/hero';
import type { GearState } from './battleSetup';
import type { FormState } from './controlsPanel';

export interface PageQuery {
  autostart: boolean;
  speed: number | null;
  // Start the battle and show it paused at this battle time.
  startAtSeconds: number | null;
}

const numberOf = (value: string | null): number | null => (value === null || Number.isNaN(Number(value)) ? null : Number(value));

// The page can be set from the address, so a screenshot run needs no clicks:
// ?class=archer&level=5&gear=magic&second=priest&secondLevel=4&creep=wolf&creepLevel=5&count=2&seed=7&speed=2&start=1&at=2.4
export function applyQueryToForm(form: FormState, query: URLSearchParams): PageQuery {
  const classId = query.get('class');
  if (CLASSES.some((definition) => definition.id === classId)) form.heroClass = classId as ClassId;
  const level = numberOf(query.get('level'));
  if (level !== null) {
    form.heroLevel = level;
    if (!form.creepLevelIsCustom) form.creepLevel = level;
  }
  const gear = query.get('gear');
  if (gear === 'none' || gear === 'weapon' || gear === 'common' || gear === 'magic') form.gearState = gear as GearState;
  const second = query.get('second');
  if (CLASSES.some((definition) => definition.id === second)) {
    form.hasSecondHero = true;
    form.secondClass = second as ClassId;
    form.secondLevel = numberOf(query.get('secondLevel')) ?? form.heroLevel;
  }
  const creep = query.get('creep');
  if (MONSTERS.some((monster) => monster.id === creep)) form.creepId = creep as string;
  const creepLevel = numberOf(query.get('creepLevel'));
  if (creepLevel !== null) {
    form.creepLevel = creepLevel;
    form.creepLevelIsCustom = true;
  }
  form.creepCount = Math.min(3, Math.max(1, numberOf(query.get('count')) ?? form.creepCount));
  form.seed = numberOf(query.get('seed')) ?? form.seed;
  return { autostart: query.get('start') === '1', speed: numberOf(query.get('speed')), startAtSeconds: numberOf(query.get('at')) };
}
