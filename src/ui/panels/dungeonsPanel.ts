import { DUNGEONS, type DungeonDefinition } from '../../content/dungeons';
import { requireById } from '../../content/lookup';
import { MONSTERS } from '../../content/monsters';
import { activeRunOf, startDungeonRunCommand, stopDungeonRunCommand } from '../../game';
import { actionButton, element } from '../dom';
import { createRunSummaryCard } from '../runSummary';
import type { PanelContext, PanelRenderer } from './panelContext';

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
    element('div', 'card-title', `${dungeon.name}${bossTag} - Lv ${dungeon.level}`),
    element('div', 'card-text', monsterNamesOf(dungeon)),
    actionButton('Start run', () => start(context, dungeon.id), { disabled: !canStart }),
  );
}

export const renderDungeonsPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const isRunActive = activeRunOf(state) !== null;
  const canStart = !isRunActive && state.partyHeroIds.length > 0;
  const body = element('div', 'panel-body');
  if (state.partyHeroIds.length === 0) {
    body.append(element('p', 'hint', 'Your party is empty. Hire a hero in the Tavern (Town menu).'));
  }
  if (state.dungeonRun) {
    const stopButton = actionButton('Stop run', () => context.store.execute(stopDungeonRunCommand()));
    body.append(createRunSummaryCard(state.dungeonRun, state.dungeonRun.status === 'active' ? [stopButton] : []));
  }
  const dungeons = DUNGEONS.filter((dungeon) => dungeon.townId === state.townId);
  body.append(element('div', 'card-grid', ...dungeons.map((dungeon) => renderDungeon(context, dungeon, canStart))));
  return body;
};
