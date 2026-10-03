import { DUNGEONS, type DungeonDefinition } from '../../content/dungeons';
import { activeRunOf, startDungeonRunCommand, stopDungeonRunCommand } from '../../game';
import { actionButton, element } from '../dom';
import { listOf } from '../displayNames';
import { describeRejection, t } from '../i18n';
import { createRunSummaryCard } from '../runSummary';
import type { PanelContext, PanelRenderer } from './panelContext';

function monsterNamesOf(dungeon: DungeonDefinition): string {
  const ids = [...dungeon.monsterIds, ...(dungeon.bossMonsterId ? [dungeon.bossMonsterId] : [])];
  return listOf(ids.map((id) => t(`monster.${id}`)));
}

function start(context: PanelContext, dungeonId: string): void {
  const result = context.store.execute(startDungeonRunCommand(dungeonId));
  if (result.accepted) context.closePanel();
  else context.notify(describeRejection(result.rejection));
}

function renderDungeon(context: PanelContext, dungeon: DungeonDefinition, canStart: boolean): HTMLElement {
  const title = t('dungeons.title', {
    name: t(`dungeon.${dungeon.id}`),
    boss: dungeon.bossMonsterId ? t('dungeons.bossTag') : '',
    level: dungeon.level,
  });
  return element(
    'div',
    'card',
    element('div', 'card-title', title),
    element('div', 'card-text', monsterNamesOf(dungeon)),
    actionButton(t('dungeons.start'), () => start(context, dungeon.id), { disabled: !canStart }),
  );
}

export const renderDungeonsPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const canStart = activeRunOf(state) === null && state.partyHeroIds.length > 0;
  const body = element('div', 'panel-body');
  if (state.partyHeroIds.length === 0) body.append(element('p', 'hint', t('dungeons.partyEmpty')));
  if (state.dungeonRun) {
    const stopButton = actionButton(t('dungeons.stop'), () => context.store.execute(stopDungeonRunCommand()));
    body.append(createRunSummaryCard(state.dungeonRun, state.dungeonRun.status === 'active' ? [stopButton] : []));
  }
  const dungeons = DUNGEONS.filter((dungeon) => dungeon.townId === state.townId);
  body.append(element('div', 'card-grid', ...dungeons.map((dungeon) => renderDungeon(context, dungeon, canStart))));
  return body;
};
