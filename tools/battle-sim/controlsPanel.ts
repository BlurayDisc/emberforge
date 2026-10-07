import { CLASSES } from '../../src/content/classes';
import { element } from '../../src/ui/dom';
import { t } from '../../src/ui/i18n';
import type { ClassId } from '../../src/model/hero';
import { CREEP_OPTIONS, type BattleSetup, type GearState } from './battleSetup';
import { say, type SimTextKey } from './battleSimTexts';

export interface FormState {
  heroClass: ClassId;
  heroLevel: number;
  gearState: GearState;
  hasSecondHero: boolean;
  secondClass: ClassId;
  secondLevel: number;
  creepId: string;
  creepLevel: number;
  creepLevelIsCustom: boolean;
  creepCount: number;
  seed: number;
}

export const LEVELS = Array.from({ length: 10 }, (_, index) => index + 1);
const GEAR_STATES: readonly GearState[] = ['none', 'weapon', 'common', 'magic'];
const CREEP_RANKS = ['normal', 'rare', 'boss'] as const;

export function setupOf(form: FormState): BattleSetup {
  const heroes = [{ classId: form.heroClass, level: form.heroLevel }];
  if (form.hasSecondHero) heroes.push({ classId: form.secondClass, level: form.secondLevel });
  return { heroes, gearState: form.gearState, creepId: form.creepId, creepLevel: form.creepLevel, creepCount: form.creepCount, seed: form.seed };
}

function labelled(text: string, control: HTMLElement): HTMLElement {
  return element('label', 'sim-field', element('span', 'sim-label', text), control);
}

function selectOf(id: string, options: readonly { value: string; label: string; group?: string }[], value: string, onChange: (value: string) => void): HTMLSelectElement {
  const select = element('select', 'sim-input');
  select.id = id;
  const groups = new Map<string, HTMLElement>();
  for (const option of options) {
    const optionElement = element('option', '', option.label);
    optionElement.value = option.value;
    if (option.group === undefined) {
      select.append(optionElement);
      continue;
    }
    let group = groups.get(option.group);
    if (!group) {
      group = element('optgroup', '');
      (group as HTMLOptGroupElement).label = option.group;
      groups.set(option.group, group);
      select.append(group);
    }
    group.append(optionElement);
  }
  select.value = value;
  select.addEventListener('change', () => onChange(select.value));
  return select;
}

function numberInput(id: string, value: number, onChange: (value: number) => void): HTMLInputElement {
  const input = element('input', 'sim-input');
  input.id = id;
  input.type = 'number';
  input.value = String(value);
  input.addEventListener('change', () => onChange(Number(input.value)));
  return input;
}

export function button(id: string, label: string, onClick: () => void): HTMLButtonElement {
  const created = element('button', 'sim-button', label);
  created.id = id;
  created.type = 'button';
  created.addEventListener('click', onClick);
  return created;
}

const classOptions = (): { value: string; label: string }[] => CLASSES.map((definition) => ({ value: definition.id, label: t(`class.${definition.id}.name`) }));
const levelOptions = (): { value: string; label: string }[] => LEVELS.map((level) => ({ value: String(level), label: String(level) }));

// Builds the setup form. A change updates the form state and calls onChange. The form is built again when the language changes.
export function renderSetupForm(host: HTMLElement, form: FormState, onChange: () => void): void {
  const update = (apply: () => void) => (): void => {
    apply();
    onChange();
  };
  const secondHeroBox = element('input', '');
  secondHeroBox.id = 'sim-second-hero';
  secondHeroBox.type = 'checkbox';
  secondHeroBox.checked = form.hasSecondHero;
  secondHeroBox.addEventListener('change', () => {
    form.hasSecondHero = secondHeroBox.checked;
    renderSetupForm(host, form, onChange);
    onChange();
  });
  const creepOptions = CREEP_RANKS.flatMap((rank) => CREEP_OPTIONS.filter((option) => option.rank === rank).map((option) => ({ value: option.id, label: t(`monster.${option.id}`), group: say(`rank.${rank}` as SimTextKey) })));
  const children: HTMLElement[] = [
    element('h3', 'sim-heading', say('heroes')),
    labelled(say('heroClass'), selectOf('sim-class', classOptions(), form.heroClass, (value) => update(() => { form.heroClass = value as ClassId; })())),
    labelled(say('heroLevel'), selectOf('sim-level', levelOptions(), String(form.heroLevel), (value) => update(() => {
      form.heroLevel = Number(value);
      if (!form.creepLevelIsCustom) form.creepLevel = form.heroLevel;
      const creepLevelInput = document.getElementById('sim-creep-level') as HTMLInputElement | null;
      if (creepLevelInput) creepLevelInput.value = String(form.creepLevel);
    })())),
    labelled(say('gear'), selectOf('sim-gear', GEAR_STATES.map((state) => ({ value: state, label: say(`gear.${state}` as SimTextKey) })), form.gearState, (value) => update(() => { form.gearState = value as GearState; })())),
    element('label', 'sim-field sim-check', secondHeroBox, element('span', 'sim-label', say('secondHero'))),
  ];
  if (form.hasSecondHero) {
    children.push(
      labelled(say('secondClass'), selectOf('sim-second-class', classOptions(), form.secondClass, (value) => update(() => { form.secondClass = value as ClassId; })())),
      labelled(say('secondLevel'), selectOf('sim-second-level', levelOptions(), String(form.secondLevel), (value) => update(() => { form.secondLevel = Number(value); })())),
    );
  }
  children.push(
    element('h3', 'sim-heading', say('creeps')),
    labelled(say('creep'), selectOf('sim-creep', creepOptions, form.creepId, (value) => update(() => { form.creepId = value; })())),
    labelled(say('creepLevel'), numberInput('sim-creep-level', form.creepLevel, (value) => update(() => { form.creepLevel = Math.max(1, Math.round(value)); form.creepLevelIsCustom = true; })())),
    labelled(say('creepCount'), selectOf('sim-creep-count', [1, 2, 3].map((count) => ({ value: String(count), label: String(count) })), String(form.creepCount), (value) => update(() => { form.creepCount = Number(value); })())),
  );
  host.replaceChildren(...children);
}
