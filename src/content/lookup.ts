export function requireById<Entry extends { id: string }>(entries: readonly Entry[], id: string): Entry {
  const entry = entries.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`Unknown content id: ${id}`);
  return entry;
}
