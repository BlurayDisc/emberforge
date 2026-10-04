import { MAXIMUM_COMPANY_SIZE } from '../../../content/balance/economy';
import { hasBankUnlock, hireHeroCommand, listTavernOffers, type TavernOffer } from '../../../game';
import type { ClassId } from '../../../model/hero';
import { actionButton, element } from '../../dom';
import { createGrowthBars, type GrowthNumberVisibility } from '../../classGrowth';
import { className } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
import { createList, createListRow } from '../../listRow';
import { createMoneyDisplay } from '../../moneyDisplay';
import { createPortrait } from '../../portraitArt';
import type { PanelContext, PanelRenderer } from '../panelContext';

function hire(context: PanelContext, classId: ClassId): void {
  const result = context.store.execute(hireHeroCommand(classId));
  context.notify(result.accepted ? t('tavern.hired') : describeRejection(result.rejection));
}

function growthVisibility(context: PanelContext): GrowthNumberVisibility {
  const state = context.store.getState();
  return { attributes: hasBankUnlock(state, 'attributeGrowth'), mainStats: hasBankUnlock(state, 'mainStatGrowth') };
}

function renderOffer(context: PanelContext, offer: TavernOffer): HTMLElement {
  const isLocked = offer.lockedUntilDungeonId !== null;
  const roleLine = element('div', 'card-text', t(`class.${offer.classId}.role`));
  const growthLine = element('div', 'card-text small', t('tavern.growth'), createGrowthBars(offer.classId, growthVisibility(context)));
  const lockLine = offer.lockedUntilDungeonId === null ? null : element('div', 'card-text small', t('tavern.locked', { dungeon: t(`dungeon.${offer.lockedUntilDungeonId}`) }));
  const price = offer.cost === 0 ? element('span', 'money-free', t('tavern.free')) : createMoneyDisplay(offer.cost);
  return createListRow({
    art: createPortrait(offer.classId, className(offer.classId), 2),
    title: className(offer.classId),
    lines: lockLine ? [roleLine, growthLine, lockLine] : [roleLine, growthLine],
    actions: [price, actionButton(t('tavern.hire'), () => hire(context, offer.classId), { disabled: !offer.isAffordable || isLocked })],
  });
}

export const renderTavernPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const offers = listTavernOffers(state);
  const content = element('div', 'panel-body');
  if (state.company.length === 0) content.append(element('p', 'hint welcome', t('tavern.welcome')));
  content.append(element('p', 'hint', t('tavern.company', { count: state.company.length, max: MAXIMUM_COMPANY_SIZE })));
  const { attributes, mainStats } = growthVisibility(context);
  if (!attributes || !mainStats) content.append(element('p', 'hint', t('tavern.growthLocked')));
  if (offers.length === 0) content.append(element('p', 'hint', t('tavern.full')));
  content.append(createList(...offers.map((offer) => renderOffer(context, offer))));
  if (state.company.length > 0) content.append(actionButton(t('tavern.leave'), context.closePanel));
  return content;
};
