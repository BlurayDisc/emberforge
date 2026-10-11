type Rows = readonly string[];

// A set piece takes its colours from the set material only, so two sets in similar colours would look the same. Each set material also stamps a 6 by 6 emblem into the emptiest corner of the picture. Letters are the BASE_LEGEND colours.
const SET_EMBLEM_ROWS: Readonly<Record<string, Rows>> = {
  'sharp-fang': ['.oooo.', 'oppppo', 'opppso', '.opso.', '.opso.', '..oo..'],
  'bone-shard': ['.oooo.', 'oppppo', 'opoopo', 'oppppo', '.opop.', '.oooo.'],
  'coarse-sinew': ['.oooo.', 'orrrro', 'ororro', 'orrrro', '.orro.', '..oo..'],
  toadskin: ['.oooo.', 'oFFFFo', 'oFfFFo', 'oFFFfo', '.oFFo.', '..oo..'],
  'spider-silk': ['..oo..', '.osso.', 'osSSso', 'osSSso', '.osso.', '..oo..'],
};

const EMBLEM_SIZE = 6;
const CORNERS = [
  { left: 0, top: 0 },
  { left: -1, top: 0 },
  { left: 0, top: -1 },
  { left: -1, top: -1 },
] as const;

function filledPixelsIn(rows: Rows, left: number, top: number): number {
  return rows.slice(top, top + EMBLEM_SIZE).reduce((total, row) => total + [...row.slice(left, left + EMBLEM_SIZE)].filter((symbol) => symbol !== '.').length, 0);
}

export function hasSetEmblem(materialId: string): boolean {
  return SET_EMBLEM_ROWS[materialId] !== undefined;
}

export function stampSetEmblem(rows: Rows, materialId: string): Rows {
  const emblem = SET_EMBLEM_ROWS[materialId];
  if (!emblem) return rows;
  const height = rows.length;
  const width = rows[0]?.length ?? 0;
  const placements = CORNERS.map((corner) => ({ left: corner.left < 0 ? width - EMBLEM_SIZE : 0, top: corner.top < 0 ? height - EMBLEM_SIZE : 0 }));
  const emptiest = placements.reduce((best, placement) => (filledPixelsIn(rows, placement.left, placement.top) < filledPixelsIn(rows, best.left, best.top) ? placement : best), placements[3] as { left: number; top: number });
  return rows.map((row, rowIndex) => {
    const emblemRow = emblem[rowIndex - emptiest.top];
    if (!emblemRow) return row;
    return [...row].map((symbol, columnIndex) => {
      const emblemSymbol = emblemRow[columnIndex - emptiest.left];
      return emblemSymbol !== undefined && emblemSymbol !== '.' ? emblemSymbol : symbol;
    }).join('');
  });
}
