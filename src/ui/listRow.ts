import { element, type Child } from './dom';

export interface ListRowOptions {
  art: Node;
  title: Child;
  lines?: Child[];
  actions?: Node[];
  className?: string;
}

export function createListRow(options: ListRowOptions): HTMLElement {
  const body = element('div', 'row-body', element('div', 'card-title', options.title), ...(options.lines ?? []));
  return element(
    'div',
    `list-row${options.className ? ` ${options.className}` : ''}`,
    element('div', 'row-art', options.art),
    body,
    element('div', 'row-actions', ...(options.actions ?? [])),
  );
}

export function createList(...rows: HTMLElement[]): HTMLElement {
  return element('div', 'list', ...rows);
}
