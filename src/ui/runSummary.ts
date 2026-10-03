import { DUNGEONS } from '../content/dungeons';
import { requireById } from '../content/lookup';
import { MATERIALS } from '../content/materials';
import type { DungeonRun, RunEndReason } from '../model/gameState';
import { actionButton, element } from './dom';
import { createMoneyDisplay } from './moneyDisplay';

const END_REASON_TEXT: Record<RunEndReason, string> = {
  stopped: 'You stopped the run.',
  'party-defeated': 'The party was defeated and retreated to town.',
  'party-weakened': 'The party was too weak to go on.',
  'backpack-full': 'The backpack is full.',
};

export function createRunSummaryCard(run: DungeonRun, actions: HTMLElement[] = []): HTMLElement {
  const dungeon = requireById(DUNGEONS, run.dungeonId);
  const status = run.status === 'active' ? 'In progress.' : END_REASON_TEXT[run.endReason ?? 'stopped'];
  const materialText = run.materialsGained
    .map((stack) => `${requireById(MATERIALS, stack.materialId).name} x${stack.quantity}`)
    .join(', ');
  return element(
    'div',
    'card',
    element('div', 'card-title', `${run.status === 'active' ? 'Current' : 'Last'} run: ${dungeon.name}`),
    element('div', 'card-text', `${status} Fights won: ${run.encountersWon}.`),
    element('div', 'card-row', 'Money found: ', createMoneyDisplay(run.copperGained)),
    element('div', 'card-text small', materialText === '' ? 'No materials found.' : `Materials: ${materialText}`),
    ...actions,
  );
}

export function createGoToHeroesButton(openPanel: (panelId: string) => void): HTMLElement {
  return actionButton('Equip gear (Heroes)', () => openPanel('heroes'), { className: 'action-button primary' });
}
