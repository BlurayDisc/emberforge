import { requireById } from '../content/lookup';
import { DUNGEONS } from '../content/dungeons';
import type { DungeonRun } from '../model/gameState';
import { actionButton, element } from './dom';
import { listOf, materialName } from './displayNames';
import { t } from './i18n';
import { createMoneyDisplay } from './moneyDisplay';

export function createRunSummaryCard(run: DungeonRun, actions: HTMLElement[] = []): HTMLElement {
  const dungeon = requireById(DUNGEONS, run.dungeonId);
  const status = run.status === 'active' ? t('run.inProgress') : t(`endreason.${run.endReason ?? 'stopped'}`);
  const materialList = listOf(run.materialsGained.map((stack) => `${materialName(stack.materialId)} x${stack.quantity}`));
  const titleKey = run.status === 'active' ? 'run.current' : 'run.last';
  return element(
    'div',
    'card',
    element('div', 'card-title', t(titleKey, { name: t(`dungeon.${dungeon.id}`) })),
    element('div', 'card-text', `${status} ${t('run.fightsWon', { count: run.encountersWon })}`),
    element('div', 'card-row', t('run.moneyFound'), createMoneyDisplay(run.copperGained)),
    element('div', 'card-text small', materialList === '' ? t('run.noMaterials') : t('run.materials', { list: materialList })),
    ...actions,
  );
}

export function createGoToHeroesButton(openPanel: (panelId: string) => void): HTMLElement {
  return actionButton(t('run.equipGear'), () => openPanel('heroes'), { className: 'action-button primary' });
}
