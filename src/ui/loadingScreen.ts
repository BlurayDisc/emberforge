import { APP_VERSION } from '../kernel/buildInfo';
import { element, percentBar } from './dom';
import { t } from './i18n';

export interface LoadingScreen {
  element: HTMLElement;
  showProgress(fractionDone: number): void;
}

export function createLoadingScreen(): LoadingScreen {
  const bar = percentBar(0, 'bar-experience');
  const screen = element('div', 'loading-screen', element('div', 'loading-name', t('app.name')), element('div', 'loading-version', `v${APP_VERSION}`), element('div', 'loading-title', t('loading.title')), bar);
  return {
    element: screen,
    showProgress: (fractionDone) => {
      const fill = bar.firstElementChild;
      if (fill instanceof HTMLElement) fill.style.width = `${Math.round(fractionDone * 100)}%`;
    },
  };
}
