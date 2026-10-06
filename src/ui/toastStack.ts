import { element } from './dom';

const TOAST_MILLISECONDS = 3500;
const MAXIMUM_VISIBLE_TOASTS = 3;

export interface ToastStack {
  element: HTMLElement;
  show(message: string): void;
}

// Small notices at the top of the stage. The stack ignores the pointer, so a notice never blocks a button or a building under it.
// A second notice does not replace the first: both stay until their own time ends, and the oldest goes when there are too many.
export function createToastStack(): ToastStack {
  const stack = element('div', 'toast-stack');
  const show = (message: string): void => {
    const toasts = Array.from(stack.children);
    const repeatedToast = toasts.find((toast) => toast.textContent === message);
    repeatedToast?.remove();
    const toast = element('div', 'toast', message);
    stack.append(toast);
    while (stack.children.length > MAXIMUM_VISIBLE_TOASTS) stack.firstElementChild?.remove();
    window.setTimeout(() => toast.remove(), TOAST_MILLISECONDS);
  };
  return { element: stack, show };
}
