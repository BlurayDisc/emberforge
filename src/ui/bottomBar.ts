import { dungeonActivityOf, isBackpackFull, workshopActivityOf, type ActivityBadge, type GameStore } from '../game';
import { actionButton, element } from './dom';
import { onLanguageChange, t } from './i18n';
import { closeEveryModalWithItsCloseAction } from './modal';
import { PANEL_CATALOG, panelTitleKey } from './panelCatalog';
import type { PanelHost } from './panelHost';
import { createPixelIcon } from './pixelIcons';

const BADGE_PANEL_IDS: readonly string[] = ['dungeons', 'workshop', 'inventory'];

type BadgeKind = 'activity' | 'alert';

// One badge style for the whole menu. Yellow with a number: fights or crafts that run or wait for the player.
// Red with a mark and no number: the backpack is full. The badge sits in the corner, so it moves nothing when it comes and goes.
function showBadge(badge: HTMLElement, kind: BadgeKind, text: string, title: string): void {
  badge.textContent = text;
  badge.title = title;
  badge.style.display = text === '' ? 'none' : 'inline-block';
  badge.classList.toggle('alert', kind === 'alert');
}

function describeActivity(activity: ActivityBadge): { text: string; title: string } {
  const parts = [
    ...(activity.inProgress > 0 ? [t('menu.badge.inProgress', { count: activity.inProgress })] : []),
    ...(activity.ready > 0 ? [t('menu.badge.ready', { count: activity.ready })] : []),
  ];
  const total = activity.inProgress + activity.ready;
  return { text: total > 0 ? String(total) : '', title: parts.join(', ') };
}

export function createBottomBar(store: GameStore, panelHost: PanelHost): HTMLElement {
  const bar = element('nav', 'bottom-bar');
  const buttons = PANEL_CATALOG.flatMap((panel) => {
    if (panel.barIcon === null) return [];
    const label = element('span', 'bar-label');
    const button = actionButton('', () => {
      closeEveryModalWithItsCloseAction();
      panelHost.toggle(panel.id);
    }, { className: 'bar-button' });
    button.append(createPixelIcon(panel.barIcon, 2), label);
    const badge = element('span', 'bar-badge');
    if (BADGE_PANEL_IDS.includes(panel.id)) button.append(badge);
    return [{ id: panel.id, button, label, badge }];
  });
  bar.append(element('div', 'bar-buttons', ...buttons.map((entry) => entry.button)));
  const badgeOf = (panelId: string): HTMLElement | undefined => buttons.find(({ id }) => id === panelId)?.badge;

  const refreshButtons = (): void => {
    buttons.forEach(({ id, button }) => button.classList.toggle('active', panelHost.activePanelId() === id));
  };
  const refreshLabels = (): void => {
    buttons.forEach(({ id, label }) => {
      label.textContent = t(panelTitleKey(id));
    });
  };
  const refreshBadges = (): void => {
    const state = store.getState();
    const dungeons = describeActivity(dungeonActivityOf(state));
    const workshop = describeActivity(workshopActivityOf(state));
    const dungeonBadge = badgeOf('dungeons');
    const workshopBadge = badgeOf('workshop');
    const inventoryBadge = badgeOf('inventory');
    if (dungeonBadge) showBadge(dungeonBadge, 'activity', dungeons.text, dungeons.title);
    if (workshopBadge) showBadge(workshopBadge, 'activity', workshop.text, workshop.title);
    if (inventoryBadge) showBadge(inventoryBadge, 'alert', isBackpackFull(state) ? '!' : '', t('storage.full'));
  };

  panelHost.onChange(refreshButtons);
  store.subscribe(refreshBadges);
  onLanguageChange(refreshBadges);
  onLanguageChange(refreshLabels);
  refreshButtons();
  refreshLabels();
  refreshBadges();
  return bar;
}
