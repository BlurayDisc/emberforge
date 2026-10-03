// Version 16: the Morning Star became the Flanged Mace. Every saved item keeps its place and stats.
export function migrateRenamedBases(save: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(save).replaceAll('"baseId":"morning-star"', '"baseId":"flanged-mace"')) as Record<string, unknown>;
}
