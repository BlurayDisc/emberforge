import { actionButton, element } from '../dom';
import type { PanelRenderer } from './panelContext';

let isResetArmed = false;

export const renderMenuPanel: PanelRenderer = (context) => {
  const resetButton = isResetArmed
    ? actionButton('Press again to erase your save', () => {
        isResetArmed = false;
        context.store.startNewGame();
        context.notify('A new game started.');
      }, { className: 'action-button danger' })
    : actionButton('New game', () => {
        isResetArmed = true;
        context.requestRender();
      });
  return element(
    'div',
    'panel-body',
    element('p', 'hint', 'The game saves after every action in this browser.'),
    resetButton,
  );
};
