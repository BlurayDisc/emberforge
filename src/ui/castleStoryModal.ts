import { castleSpot, castleTaleKeys } from '../content/castle';
import { castleFigureCanvas } from './artProviders';
import { actionButton, element } from './dom';
import { t } from './i18n';
import { isCastleChapterOneCleared } from './castleVisit';
import { openModal } from './modal';

// A person or a place in the castle tells its story. The tales are the keys castle.<id>.tale.1 to castle.<id>.tale.<n>, and after chapter 1 also castle.<id>.tale.after1.<n>.
export function openCastleStory(spotId: string): void {
  const spot = castleSpot(spotId);
  const portrait = spot.look === null ? null : castleFigureCanvas(spot.look);
  const tales = castleTaleKeys(spot, isCastleChapterOneCleared()).map((key) => element('p', 'card-text castle-tale', t(key)));
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
