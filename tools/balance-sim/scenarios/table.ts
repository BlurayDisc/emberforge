export function printTable(title: string, headers: readonly string[], rows: readonly (readonly (string | number)[])[]): void {
  const cells = [headers, ...rows].map((row) => row.map(String));
  const widths = headers.map((_, column) => Math.max(...cells.map((row) => row[column]!.length)));
  const formatRow = (row: readonly string[]): string => row.map((cell, column) => (column === 0 ? cell.padEnd(widths[column]!) : cell.padStart(widths[column]!))).join('  ');
  console.log(`\n${title}`);
  console.log(formatRow(cells[0]!));
  console.log(widths.map((width) => '-'.repeat(width)).join('  '));
  for (const row of cells.slice(1)) console.log(formatRow(row));
}
