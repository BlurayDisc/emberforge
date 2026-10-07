import { requireById } from '../../../content/lookup';
import { MATERIALS } from '../../../content/materials';
import { collectMillMaterialsCommand, describeMill } from '../../../game';
import { actionButton, element } from '../../dom';
import { materialName } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
import { createMaterialIcon } from '../../iconArt';
import { addLiveUpdate, formatDuration } from '../../liveUpdate';
import { createList, createListRow } from '../../listRow';
import type { PanelContext, PanelRenderer } from '../panelContext';

function createNextProductionLine(context: PanelContext): HTMLElement {
  const line = element('div', 'card-text small');
  addLiveUpdate(line, () => {
    const { isFull, nextProductionAtMs } = describeMill(context.store.getState());
    if (isFull) line.textContent = t('mill.full');
    else if (nextProductionAtMs === null) line.textContent = t('mill.starting');
    else line.textContent = t('mill.nextIn', { time: formatDuration((nextProductionAtMs - Date.now()) / 1000) });
  });
  return line;
}

// The buttons come before the list. The list grows while the Mill works, so it must be the last thing on the screen.
export const renderMillPanel: PanelRenderer = (context) => {
  const mill = describeMill(context.store.getState());
  const storedRows = mill.storedMaterials.map((stack) => {
    const material = requireById(MATERIALS, stack.materialId);
    return createListRow({
      art: createMaterialIcon(material.id, material.category, 3),
      title: stack.quantity === 1 ? materialName(material.id) : `${materialName(material.id)} x${stack.quantity}`,
    });
  });
  const collectButton = actionButton(t('mill.collect'), () => {
    const result = context.store.execute(collectMillMaterialsCommand());
    if (!result.accepted) context.notify(describeRejection(result.rejection));
  }, { disabled: mill.storedMaterials.length === 0, className: 'action-button primary footer-action' });
  return element(
    'div',
    'panel-body',
    element('p', 'hint', t('mill.hint')),
    element('div', 'card-text small', t('mill.usage', { stored: mill.storedCount, capacity: mill.capacity })),
    createNextProductionLine(context),
    storedRows.length > 0 ? createList(...storedRows) : element('p', 'hint', t('mill.empty')),
    element('div', 'panel-footer', actionButton(t('mill.leave'), context.closePanel), collectButton),
  );
};
