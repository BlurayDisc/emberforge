export interface GridRectangle {
  column: number;
  row: number;
  width: number;
  height: number;
}

export interface GridSpot {
  column: number;
  row: number;
}

export function isGridSpotFree(placed: readonly GridRectangle[], wanted: GridRectangle, columnCount: number, rowCount: number): boolean {
  const isInsideGrid = wanted.column >= 0 && wanted.row >= 0 && wanted.column + wanted.width <= columnCount && wanted.row + wanted.height <= rowCount;
  const overlapsPlaced = placed.some((other) =>
    wanted.column < other.column + other.width && other.column < wanted.column + wanted.width &&
    wanted.row < other.row + other.height && other.row < wanted.row + wanted.height);
  return isInsideGrid && !overlapsPlaced;
}

// First fit, row by row. Used by the backpack and by the save migration.
export function findFreeGridSpot(placed: readonly GridRectangle[], width: number, height: number, columnCount: number, rowCount: number): GridSpot | null {
  const occupied = new Set<string>();
  for (const rectangle of placed) {
    for (let column = rectangle.column; column < rectangle.column + rectangle.width; column++) {
      for (let row = rectangle.row; row < rectangle.row + rectangle.height; row++) occupied.add(`${column},${row}`);
    }
  }
  for (let row = 0; row + height <= rowCount; row++) {
    for (let column = 0; column + width <= columnCount; column++) {
      const isFree = Array.from({ length: width * height }).every((_, offset) => !occupied.has(`${column + (offset % width)},${row + Math.floor(offset / width)}`));
      if (isFree) return { column, row };
    }
  }
  return null;
}
