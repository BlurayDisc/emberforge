import { castleSpot } from '../content/castle';
import { castleFigureCanvas } from './artProviders';
import { actionButton, element } from './dom';
import { t } from './i18n';
import { openModal } from './modal';

// A person or a place in the castle tells its story. The tales are the keys castle.<id>.tale.1 to castle.<id>.tale.<n>.
export function openCastleStory(spotId: string): void {
  const spot = castleSpot(spotId);
  const portrait = spot.look === null ? null : castleFigureCanvas(spot.look);
  const tales = Array.from({ length: spot.tales }, (_, index) => element('p', 'card-text castle-tale', t(`castle.${spot.id}.tale.${index + 1}`)));
  const content = element('div', 'panel-body');
  const modal = openModal(t(`castle.${spot.id}.name`), content);
  content.append(
    element(
      'div',
      'castle-story',
      ...(portrait ? [element('div', 'castle-portrait', portrait)] : []),
      element('div', 'castle-story-text', element('div', 'section-title', t(`castle.${spot.id}.title`)), ...tales),
    ),
    actionButton(t('castle.farewell'), () => modal.close(), { className: 'action-button primary' }),
  );
}
