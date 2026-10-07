import { actionButton, element } from './dom';

export interface ModalHandle {
  close(): void;
}

const modalHost = element('div', 'modal-host');
const closeFunctionOfBackdrop = new WeakMap<Element, () => void>();

export function getModalHost(): HTMLElement {
  return modalHost;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

const NEAR_POINTER_MARGIN_PIXELS = 8;

// Modals stack: a menu can open a chooser on top of itself. Clicking outside the modal closes the top one.
// A short menu passes the point of the click. It opens as a narrow panel at that point, and the screen stays undimmed.
export function openModal(title: string, content: HTMLElement, onClose?: () => void, nearPoint?: ScreenPoint): ModalHandle {
  const backdrop = element('div', `modal-backdrop${nearPoint ? ' modal-backdrop-near' : ''}`);
  const close = (): void => {
    // A panel change can close the window before its own button does. The close action must run once.
    if (!closeFunctionOfBackdrop.has(backdrop)) return;
    closeFunctionOfBackdrop.delete(backdrop);
    backdrop.remove();
    onClose?.();
  };
  const header = element('div', 'panel-header', element('span', 'panel-title', title), actionButton('x', close, { className: 'action-button close-button' }));
  const modal = element('div', 'modal panel', header, element('div', 'modal-body', content));
  backdrop.append(modal);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close();
  });
  closeFunctionOfBackdrop.set(backdrop, close);
  modalHost.append(backdrop);
  if (nearPoint) placeNearPoint(modal, nearPoint);
  return { close };
}

// The point is in screen coordinates. The panel is moved to it, then kept inside the host.
function placeNearPoint(modal: HTMLElement, point: ScreenPoint): void {
  const hostBox = modalHost.getBoundingClientRect();
  const largestLeft = Math.max(NEAR_POINTER_MARGIN_PIXELS, hostBox.width - modal.offsetWidth - NEAR_POINTER_MARGIN_PIXELS);
  const largestTop = Math.max(NEAR_POINTER_MARGIN_PIXELS, hostBox.height - modal.offsetHeight - NEAR_POINTER_MARGIN_PIXELS);
  const left = Math.min(Math.max(point.x - hostBox.left + NEAR_POINTER_MARGIN_PIXELS, NEAR_POINTER_MARGIN_PIXELS), largestLeft);
  const top = Math.min(Math.max(point.y - hostBox.top, NEAR_POINTER_MARGIN_PIXELS), largestTop);
  modal.style.left = `${Math.round(left)}px`;
  modal.style.top = `${Math.round(top)}px`;
}

export function hasOpenModal(): boolean {
  return modalHost.childElementCount > 0;
}

export function closeAllModals(): void {
  modalHost.replaceChildren();
}

// Returns false when no modal is open. Used by the Escape key.
export function closeTopModal(): boolean {
  const topBackdrop = modalHost.lastElementChild;
  const close = topBackdrop ? closeFunctionOfBackdrop.get(topBackdrop) : undefined;
  if (!close) return false;
  close();
  return true;
}

// Runs the close action of every open modal, top first, so a report is marked as read.
export function closeEveryModalWithItsCloseAction(): void {
  while (closeTopModal());
}
