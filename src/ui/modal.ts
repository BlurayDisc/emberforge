import { actionButton, element } from './dom';

export interface ModalHandle {
  close(): void;
}

const modalHost = element('div', 'modal-host');

export function getModalHost(): HTMLElement {
  return modalHost;
}

// Modals stack: a menu can open a chooser on top of itself. Clicking the dark backdrop closes the top one.
export function openModal(title: string, content: HTMLElement, onClose?: () => void): ModalHandle {
  const backdrop = element('div', 'modal-backdrop');
  const close = (): void => {
    backdrop.remove();
    onClose?.();
  };
  const header = element('div', 'panel-header', element('span', 'panel-title', title), actionButton('x', close, { className: 'action-button close-button' }));
  const modal = element('div', 'modal panel', header, element('div', 'modal-body', content));
  backdrop.append(modal);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close();
  });
  modalHost.append(backdrop);
  return { close };
}

export function closeAllModals(): void {
  modalHost.replaceChildren();
}
