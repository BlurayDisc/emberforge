import type { BattleSide } from '../model/battle';
import { element } from './dom';
import { t } from './i18n';

export interface LogUnit {
  name: string;
  side: BattleSide;
}

export interface ResourceSpent {
  resourceName: string;
  amount: number;
}

export type LogEntry =
  | { kind: 'turn'; turn: number }
  | { kind: 'fight'; monsters: string }
  | { kind: 'hit'; actor: LogUnit; target: LogUnit; amount: number; isCritical: boolean; absorbed?: number; spellName?: string; resourceSpent?: ResourceSpent }
  | { kind: 'dodge'; actor: LogUnit; target: LogUnit; spellName?: string; resourceSpent?: ResourceSpent }
  | { kind: 'burn'; target: LogUnit; amount: number; absorbed?: number }
  | { kind: 'heal'; actor: LogUnit; target: LogUnit; amount: number; spellName?: string; resourceSpent?: ResourceSpent }
  | { kind: 'effect'; actor: LogUnit; target: LogUnit; spellName: string; resourceSpent?: ResourceSpent }
  | { kind: 'defeated'; unit: LogUnit }
  | { kind: 'result'; won: boolean }
  | { kind: 'experience'; hero: LogUnit; amount: number };

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

function spellChip(name: string): HTMLElement {
  return element('span', 'log-spell', name);
}

function appendResourceSpent(line: HTMLElement, resourceSpent: ResourceSpent | undefined): HTMLElement {
  if (resourceSpent) line.append(element('span', 'log-resource', t('log.resourceSpent', { amount: Math.round(resourceSpent.amount), resource: resourceSpent.resourceName })));
  return line;
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
      const amount = amountChip(entry.amount, amountClass);
      line.append(...(entry.spellName === undefined
        ? sentence('log.hit', { actor: unitName(entry.actor), target: unitName(entry.target), amount })
        : sentence('log.spellHit', { actor: unitName(entry.actor), spell: spellChip(entry.spellName), target: unitName(entry.target), amount })));
      if (entry.isCritical) line.append(element('span', 'log-crit-text', t('log.crit')));
      if (entry.absorbed) line.append(element('span', 'log-resource', t('log.absorbed', { amount: entry.absorbed })));
      return appendResourceSpent(line, entry.resourceSpent);
    }
    case 'dodge':
      return appendResourceSpent(element('div', 'log-line', ...(entry.spellName === undefined
        ? sentence('log.dodge', { actor: unitName(entry.actor), target: unitName(entry.target) })
        : sentence('log.spellDodge', { actor: unitName(entry.actor), spell: spellChip(entry.spellName), target: unitName(entry.target) }))), entry.resourceSpent);
    case 'burn': {
      const line = element('div', 'log-line', ...sentence('log.burn', { target: unitName(entry.target), amount: amountChip(entry.amount, 'dealt') }));
      if (entry.absorbed) line.append(element('span', 'log-resource', t('log.absorbed', { amount: entry.absorbed })));
      return line;
    }
    case 'heal': {
      const amount = amountChip(entry.amount, 'heal');
      return appendResourceSpent(element('div', 'log-line', ...(entry.spellName === undefined
        ? sentence('log.heal', { actor: unitName(entry.actor), target: unitName(entry.target), amount })
        : sentence('log.spellHeal', { actor: unitName(entry.actor), spell: spellChip(entry.spellName), target: unitName(entry.target), amount }))), entry.resourceSpent);
    }
    case 'effect':
      return appendResourceSpent(element('div', 'log-line', ...sentence('log.spellEffect', { actor: unitName(entry.actor), spell: spellChip(entry.spellName), target: unitName(entry.target) })), entry.resourceSpent);
    case 'defeated':
      return element('div', 'log-line log-defeated', ...sentence('log.defeated', { name: unitName(entry.unit) }));
    case 'result':
      return element('div', `log-result ${entry.won ? 'won' : 'lost'}`, entry.won ? t('log.victory') : t('log.defeat'));
    case 'experience':
      return element('div', 'log-line', ...sentence('log.experience', { name: unitName(entry.hero), amount: amountChip(entry.amount, 'experience') }));
  }
}
