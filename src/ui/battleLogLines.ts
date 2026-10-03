import type { BattleSide } from '../model/battle';
import { element } from './dom';
import { t } from './i18n';

export interface LogUnit {
  name: string;
  side: BattleSide;
}

export type LogEntry =
  | { kind: 'turn'; turn: number }
  | { kind: 'fight'; monsters: string }
  | { kind: 'hit'; actor: LogUnit; target: LogUnit; amount: number; isCritical: boolean }
  | { kind: 'heal'; actor: LogUnit; target: LogUnit; amount: number }
  | { kind: 'defeated'; unit: LogUnit }
  | { kind: 'result'; won: boolean };

const MARKER = '\u0001';

// The translated sentence keeps its word order. Each {placeholder} is swapped for a styled element.
function sentence(key: string, parts: Record<string, Node>): Node[] {
  const markers = Object.fromEntries(Object.keys(parts).map((name) => [name, `${MARKER}${name}${MARKER}`]));
  return t(key, markers)
    .split(MARKER)
    .map((piece, index) => (index % 2 === 1 ? (parts[piece] ?? '') : piece))
    .map((piece) => (typeof piece === 'string' ? document.createTextNode(piece) : piece));
}

function unitName(unit: LogUnit): HTMLElement {
  return element('span', `log-unit ${unit.side === 'party' ? 'log-hero' : 'log-monster'}`, unit.name);
}

function amountChip(amount: number, className: string): HTMLElement {
  return element('span', `log-amount ${className}`, String(amount));
}

export function createLogLine(entry: LogEntry): HTMLElement {
  switch (entry.kind) {
    case 'turn':
      return element('div', 'log-turn', t('log.turn', { turn: entry.turn }));
    case 'fight':
      return element('div', 'log-line log-fight', t('log.fight', { monsters: entry.monsters }));
    case 'hit': {
      const line = element('div', `log-line${entry.isCritical ? ' log-critical-line' : ''}`);
      const amountClass = `${entry.actor.side === 'party' ? 'dealt' : 'taken'}${entry.isCritical ? ' crit' : ''}`;
      line.append(...sentence('log.hit', { actor: unitName(entry.actor), target: unitName(entry.target), amount: amountChip(entry.amount, amountClass) }));
      if (entry.isCritical) line.append(element('span', 'log-crit-text', t('log.crit')));
      return line;
    }
    case 'heal':
      return element('div', 'log-line', ...sentence('log.heal', { actor: unitName(entry.actor), target: unitName(entry.target), amount: amountChip(entry.amount, 'heal') }));
    case 'defeated':
      return element('div', 'log-line log-defeated', ...sentence('log.defeated', { name: unitName(entry.unit) }));
    case 'result':
      return element('div', `log-result ${entry.won ? 'won' : 'lost'}`, entry.won ? t('log.victory') : t('log.defeat'));
  }
}
