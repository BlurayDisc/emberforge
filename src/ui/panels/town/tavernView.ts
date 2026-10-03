import { MAXIMUM_COMPANY_SIZE } from '../../../content/balance/economy';
import { hireHeroCommand, listTavernOffers, listTrainingOffers, trainHeroCommand, type TavernOffer, type TrainingOffer } from '../../../game';
import type { ClassId } from '../../../model/hero';
import { actionButton, element } from '../../dom';
import { className, heroDisplayName } from '../../displayNames';
import { describeRejection, t } from '../../i18n';
import { createList, createListRow } from '../../listRow';
import { createMoneyDisplay } from '../../moneyDisplay';
import { createPortrait } from '../../portraitArt';
import type { PanelContext, PanelRenderer } from '../panelContext';

function hire(context: PanelContext, classId: ClassId): void {
  const result = context.store.execute(hireHeroCommand(classId));
  context.notify(result.accepted ? t('tavern.hired') : describeRejection(result.rejection));
}

function train(context: PanelContext, offer: TrainingOffer, heroName: string): void {
  const result = context.store.execute(trainHeroCommand(offer.heroId));
  context.notify(result.accepted ? t('tavern.trained', { hero: heroName, xp: offer.experience }) : describeRejection(result.rejection));
}

function renderTraining(context: PanelContext): HTMLElement[] {
  const state = context.store.getState();
  if (state.company.length === 0) return [];
  const rows = listTrainingOffers(state).flatMap((offer) => {
    const hero = state.company.find((candidate) => candidate.id === offer.heroId);
    if (!hero) return [];
    const name = heroDisplayName(hero.name);
    return [
      createListRow({
        art: createPortrait(hero.classId, hero.name, 1),
        title: name,
        lines: [element('div', 'card-text small', `${t('heroes.levelShort', { className: className(hero.classId), level: hero.level })} | ${t('tavern.trainOffer', { xp: offer.experience })}`)],
        actions: [createMoneyDisplay(offer.cost), actionButton(t('tavern.train'), () => train(context, offer, name), { disabled: !offer.isAffordable || offer.isAway, className: 'action-button small-button' })],
      }),
    ];
  });
  return [element('div', 'section-title', t('tavern.trainTitle')), element('p', 'hint', t('tavern.trainHint')), createList(...rows)];
}

function renderOffer(context: PanelContext, offer: TavernOffer): HTMLElement {
  const price = offer.cost === 0 ? element('span', 'money-free', t('tavern.free')) : createMoneyDisplay(offer.cost);
  return createListRow({
    art: createPortrait(offer.classId, className(offer.classId), 2),
    title: className(offer.classId),
    lines: [element('div', 'card-text', t(`class.${offer.classId}.role`))],
    actions: [price, actionButton(t('tavern.hire'), () => hire(context, offer.classId), { disabled: !offer.isAffordable })],
  });
}

export const renderTavernPanel: PanelRenderer = (context) => {
  const state = context.store.getState();
  const offers = listTavernOffers(state);
  const content = element('div', 'panel-body');
  if (state.company.length === 0) content.append(element('p', 'hint welcome', t('tavern.welcome')));
  content.append(element('p', 'hint', t('tavern.company', { count: state.company.length, max: MAXIMUM_COMPANY_SIZE })));
  if (offers.length === 0) content.append(element('p', 'hint', t('tavern.full')));
  content.append(createList(...offers.map((offer) => renderOffer(context, offer))));
  content.append(...renderTraining(context));
  content.append(actionButton(t('tavern.leave'), context.closePanel));
  return content;
};
