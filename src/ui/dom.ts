export type Child = Node | string;

export function element<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  className: string,
  ...children: Child[]
): HTMLElementTagNameMap[Tag] {
  const created = document.createElement(tag);
  created.className = className;
  created.append(...children);
  return created;
}

export function actionButton(
  label: string,
  onClick: () => void,
  options: { disabled?: boolean; className?: string } = {},
): HTMLButtonElement {
  const created = element('button', options.className ?? 'action-button', label);
  created.type = 'button';
  created.disabled = options.disabled ?? false;
  created.addEventListener('click', onClick);
  return created;
}

export function percentBar(fraction: number, className: string): HTMLElement {
  const fill = element('div', 'bar-fill');
  fill.style.width = `${Math.round(Math.max(0, Math.min(1, fraction)) * 100)}%`;
  return element('div', `bar ${className}`, fill);
}
