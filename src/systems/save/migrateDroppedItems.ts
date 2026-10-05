// Version 20: monsters can drop items. A report lists the dropped items, and dropped items with no room wait at the dungeon.
export function migrateDroppedItems(save: Record<string, unknown>): Record<string, unknown> {
  const reports = ((save.reports ?? []) as { result: Record<string, unknown> }[]).map((report) => ({ ...report, result: { ...report.result, items: [], itemsWaiting: [] } }));
  return { ...save, reports, pendingItems: {} };
}
