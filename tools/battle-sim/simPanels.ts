import { createLogLine, type LogEntry } from '../../src/ui/battleLogLines';
import { element } from '../../src/ui/dom';
import { unitDisplayName } from '../../src/ui/displayNames';
import type { BattleEvent, BattleUnit } from '../../src/model/battle';
import type { RealtimeBattleReport } from '../../src/model/realtimeBattle';
import { say } from './battleSimTexts';

const MAXIMUM_LOG_LINES = 300;

export interface LivePanel {
  setHealth(unitId: string, hp: number): void;
}

export function renderLivePanel(host: HTMLElement, units: readonly BattleUnit[]): LivePanel {
  host.replaceChildren();
  const fills = new Map<string, HTMLElement>();
  const numbers = new Map<string, HTMLElement>();
  const maxHpById = new Map(units.map((unit) => [unit.id, unit.maxHp]));
  for (const unit of units) {
    const fill = element('div', 'sim-bar-fill');
    fill.style.width = '100%';
    const number = element('span', 'sim-live-number', `${unit.hp} / ${unit.maxHp}`);
    host.append(element('div', `sim-live-row ${unit.side}`, element('span', 'sim-live-name', `${unitDisplayName(unit)} L${unit.level}`), element('div', 'sim-bar', fill), number));
    fills.set(unit.id, fill);
    numbers.set(unit.id, number);
  }
  return {
    setHealth: (unitId, hp) => {
      const maxHp = maxHpById.get(unitId) ?? 1;
      const fill = fills.get(unitId);
      if (fill) fill.style.width = `${Math.round(Math.max(0, Math.min(1, hp / maxHp)) * 100)}%`;
      const number = numbers.get(unitId);
      if (number) number.textContent = `${hp} / ${maxHp}`;
    },
  };
}

export function appendLogEntries(host: HTMLElement, entries: readonly LogEntry[]): void {
  for (const entry of entries) host.append(createLogLine(entry));
  while (host.childElementCount > MAXIMUM_LOG_LINES) host.firstElementChild?.remove();
  host.scrollTop = host.scrollHeight;
}

interface UnitTotals {
  damage: number;
  healing: number;
}

// Damage and healing are counted by the actor of each event. The damage per second divides by the whole fight.
export function renderSummary(host: HTMLElement, report: RealtimeBattleReport, units: readonly BattleUnit[], events: readonly BattleEvent[]): void {
  const totals = new Map<string, UnitTotals>(units.map((unit) => [unit.id, { damage: 0, healing: 0 }]));
  for (const event of events) {
    const total = totals.get(event.actorId);
    if (!total || event.isDodge) continue;
    if (event.kind === 'attack') total.damage += event.amount;
    else if (event.kind === 'heal') total.healing += event.amount;
  }
  const heroes = units.filter((unit) => unit.side === 'party');
  const heroMaxHp = heroes.reduce((sum, unit) => sum + unit.maxHp, 0);
  const heroHpLeft = report.finalUnits.filter((unit) => unit.side === 'party').reduce((sum, unit) => sum + unit.hp, 0);
  const hpLostPercent = Math.round(((heroMaxHp - heroHpLeft) / heroMaxHp) * 100);
  const seconds = report.durationSeconds;
  const row = (...cells: string[]): HTMLElement => element('tr', '', ...cells.map((cell) => element('td', '', cell)));
  const table = element('table', 'sim-table', element('tr', '', ...[say('unit'), say('damageDealt'), say('damagePerSecond'), say('healingDone')].map((cell) => element('th', '', cell))));
  for (const unit of units) {
    const total = totals.get(unit.id) as UnitTotals;
    table.append(row(`${unitDisplayName(unit)} L${unit.level}`, String(total.damage), (total.damage / seconds).toFixed(1), String(total.healing)));
  }
  host.replaceChildren(
    element('div', 'sim-summary-line', `${say('winner')}: ${say(report.winner === 'party' ? 'winner.party' : 'winner.enemy')}`),
    element('div', 'sim-summary-line', `${say('duration')}: ${seconds.toFixed(1)} ${say('seconds')}`),
    element('div', 'sim-summary-line', `${say('hpLost')}: ${hpLostPercent}%`),
    table,
  );
}
