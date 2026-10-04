import { loadSeenChangelogVersion, saveSeenChangelogVersion } from '../game';
import { APP_VERSION, BUILD_LABEL } from '../kernel/buildInfo';
import { actionButton, element } from './dom';
import { onLanguageChange, t } from './i18n';
import { CHANGELOG_URL } from './wikiLinks';

// The version label sits in the corner. A new version also shows a notice button that opens the wiki changelog.
// One click is enough: the seen version is saved apart from the game save, so the notice stays silent until the next version.
export function createBuildBadge(): HTMLElement {
  const badge = element('div', 'build-badge');
  const versionLabel = element('span', 'build-version', BUILD_LABEL);
  const noticeButton = actionButton('', () => {
    saveSeenChangelogVersion(APP_VERSION);
    noticeButton.remove();
    window.open(CHANGELOG_URL, '_blank', 'noopener');
  }, { className: 'action-button small-button changelog-notice' });
  const isNoticeNeeded = loadSeenChangelogVersion() !== APP_VERSION;
  badge.append(...(isNoticeNeeded ? [noticeButton] : []), versionLabel);

  const refreshText = (): void => {
    noticeButton.textContent = t('changelog.notice', { version: APP_VERSION });
  };
  onLanguageChange(refreshText);
  refreshText();
  return badge;
}
