import { LOG_TIME_MARKER_SECONDS } from '../content/balance/battle';
import type { BattleEvent, BattleUnit } from '../model/battle';
import type { LogEntry, LogUnit } from '../ui/battleLogLines';
import { resourceName, unitDisplayName } from '../ui/displayNames';
import { t } from '../ui/i18n';
import { spellName as spellNameOf } from '../ui/spellText';

export function logUnitOf(unit: BattleUnit | undefined): LogUnit {
  return unit ? { name: unitDisplayName(unit), side: unit.side } : { name: t('log.someone'), side: 'enemy' };
}

// A fixed span of battle time gets one clock-time line in the log, so a long fight reads as a timeline.
function timeMarkerOf(event: BattleEvent): number {
  return Math.floor(event.timeSeconds / LOG_TIME_MARKER_SECONDS) * LOG_TIME_MARKER_SECONDS;
}

export interface LogContext {
  unitsById: ReadonlyMap<string, BattleUnit>;
  lastLoggedTimeMarker: number;
}

export function logEntriesForEvent(event: BattleEvent, encounter: LogContext): LogEntry[] {
  const entries: LogEntry[] = [];
  const seconds = timeMarkerOf(event);
  if (seconds !== encounter.lastLoggedTimeMarker) {
    encounter.lastLoggedTimeMarker = seconds;
    entries.push({ kind: 'time' });
  }
  const actor = logUnitOf(encounter.unitsById.get(event.actorId));
  const targetUnit = encounter.unitsById.get(event.targetId);
  const target = logUnitOf(targetUnit);
  const spellName = event.spellId === undefined ? undefined : spellNameOf(event.spellId);
  const actorUnit = encounter.unitsById.get(event.actorId);
  const resourceSpent = event.resourceSpent !== undefined && actorUnit ? { resourceName: resourceName(actorUnit.resourceId), amount: event.resourceSpent } : undefined;
  if (event.isDamageOverTime) entries.push({ kind: 'burn', target, amount: event.amount, absorbed: event.absorbed });
  else if (event.isDodge) entries.push({ kind: 'dodge', actor, target, spellName, resourceSpent });
  else if (event.kind === 'effect') entries.push({ kind: 'effect', actor, target, spellName: spellName ?? '', resourceSpent });
  else if (event.kind === 'heal') entries.push({ kind: 'heal', actor, target, amount: event.amount, spellName, resourceSpent });
  else entries.push({ kind: 'hit', actor, target, amount: event.amount, isCritical: event.isCritical, absorbed: event.absorbed, spellName, resourceSpent });
  if (targetUnit && event.targetHpAfter === 0) entries.push({ kind: 'defeated', unit: target });
  return entries;
}
