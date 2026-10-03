import { DUNGEONS, type DungeonDefinition } from '../../content/dungeons';
import { requireById } from '../../content/lookup';
import { MATERIALS } from '../../content/materials';
import { MONSTERS } from '../../content/monsters';
import { activeRunOf, startDungeonRunCommand, stopDungeonRunCommand } from '../../game';
import type { DungeonRun, RunEndReason } from '../../model/gameState';
import { actionButton, element } from '../dom';
import { createMoneyDisplay } from '../moneyDisplay';
import type { PanelContext, PanelRenderer } from './panelContext';

const END_REASON_TEXT: Record<RunEndReason, string> = {
  stopped: 'You stopped the run.',
  'party-defeated': 'The party was defeated.',
  'party-weakened': 'The party was too weak to go on.',
  'backpack-full': 'The backpack is full.',
};

function monsterNamesOf(dungeon: DungeonDefinition): string {
  const ids = [...dungeon.monsterIds, ...(dungeon.bossMonsterId ? [dungeon.bossMonsterId] : [])];
  return ids.map((id) => requireById(MONSTERS, id).name).join(', ');
}

function start(context: PanelContext, dungeonId: string): void {
  const result = context.store.execute(startDungeonRunCommand(dungeonId));
  if (result.accepted) context.closePanel();
  else context.notify(result.rejectionReason ?? 'The run did not start.');
}

function renderDungeon(context: PanelContext, dungeon: DungeonDefinition, canStart: boolean): HTMLElement {
  const bossTag = dungeon.bossMonsterId ? ' (boss)' : '';
  return element(
    'div',
    'card',
    element('div', 'card-title', `${dungeon.name}${bossTag} — Lv ${dungeon.level}`),
    element('div', 'card-text', monsterNamesOf(dungeon)),
    actionButton('Start run', () => start(context, dungeon.id), { disabled: !canStart }),
  );
}

function renderRunSummary(context: PanelContext, run: DungeonRun): HTMLElement {
  const dungeon = requireById(DUNGEONS, run.dungeonId);
  const status = run.status === 'active' ? 'In progress' : END_REASON_TEXT[run.endReason ?? 'stopped'];
  const materialText = run.materialsGained
    .map((stack) => `${requireById(MATERIALS, stack.materialId).name} ×${stack.quantity}`)
    .join(', ');
  const summary = element(
    'div',
    'card run-summary',
    element('div', 'card-title', `${run.status === 'active' ? 'Current' : 'Last'} run: ${dungeon.name}`),
    element('div', 'card-text', `${status} Fights won: ${run.encountersWon}.`),
    element('div', 'card-row', 'Gold found: ', createMoneyDisplay(run.copperGained)),
    element('div', 'card-text small', materialText === '' ? 'No materials yet.' : `Materials: ${materialText}`),
  );
  if (run.status === 'active') {
    summary.append(actionButton('Stop run', () => context.store.execute(stopDungeonRunCommand())));
  }
  return summary;
}

export const renderDungeonsPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const isRunActive = activeRunOf(state) !== null;
  const canStart = !isRunActive && state.partyHeroIds.length > 0;
  const body = element('div', 'panel-body');
  if (state.partyHeroIds.length === 0) {
    body.append(element('p', 'hint', 'Your party is empty. Hire a hero in the Tavern (Town menu).'));
  }
  if (state.dungeonRun) body.append(renderRunSummary(context, state.dungeonRun));
  const dungeons = DUNGEONS.filter((dungeon) => dungeon.townId === state.townId);
  body.append(element('div', 'card-grid', ...dungeons.map((dungeon) => renderDungeon(context, dungeon, canStart))));
  return body;
};
