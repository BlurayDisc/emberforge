import { element } from './dom';

export interface DropdownOption {
  value: string;
  text: string;
}

// A native select opens an operating system list that CSS cannot theme, so the list is drawn here.
export function createThemedDropdown(label: string, options: readonly DropdownOption[], selectedValue: string, onChange: (value: string) => void): HTMLElement {
  const selectedText = options.find((option) => option.value === selectedValue)?.text ?? '';
  const trigger = element('button', 'dropdown-trigger', selectedText);
  trigger.type = 'button';
  trigger.setAttribute('aria-label', label);
  trigger.setAttribute('aria-haspopup', 'listbox');
  const list = element('div', 'dropdown-list');
  list.setAttribute('role', 'listbox');
  list.hidden = true;
  const dropdown = element('div', 'dropdown', trigger, list);

  function close(): void {
    list.hidden = true;
    document.removeEventListener('pointerdown', closeOnOutsidePress, true);
    document.removeEventListener('keydown', closeOnEscape, true);
  }
  // A panel redraw removes the dropdown while it is open, so the listeners remove themselves then.
  function closeOnOutsidePress(event: Event): void {
    if (!dropdown.isConnected) close();
    else if (!dropdown.contains(event.target as Node)) close();
  }
  function closeOnEscape(event: KeyboardEvent): void {
    if (event.key === 'Escape') close();
  }
  function open(): void {
    list.hidden = false;
    document.addEventListener('pointerdown', closeOnOutsidePress, true);
    document.addEventListener('keydown', closeOnEscape, true);
  }

  for (const option of options) {
    const choice = element('button', option.value === selectedValue ? 'dropdown-option selected' : 'dropdown-option', option.text);
    choice.type = 'button';
    choice.setAttribute('role', 'option');
    choice.addEventListener('click', () => {
      close();
      onChange(option.value);
    });
    list.append(choice);
  }
  trigger.addEventListener('click', () => (list.hidden ? open() : close()));
  return dropdown;
}
