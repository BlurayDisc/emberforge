import { BACKPACK_BASE_ROWS, BACKPACK_COLUMNS, BACKPACK_ROWS_PER_EXPANSION } from '../../content/balance/backpack';
import { MATERIALS } from '../../content/materials';
import { findFreeGridSpot } from '../../kernel/gridPacking';
import type { BackpackContent, BackpackEntry } from '../../model/backpack';

interface OldSaleJob {
  id: number;
  kind: 'sell';
  copper: number;
  content?: BackpackContent;
}

function sizeOf(content: BackpackContent): { width: number; height: number } {
  if (content.kind === 'item') return { width: content.item.width, height: content.item.height };
  const material = MATERIALS.find((candidate) => candidate.id === content.materialId);
  return { width: material?.width ?? 1, height: material?.height ?? 1 };
}

// Version 22: goods on sale stay in the backpack. An old sale took its goods out, so they go back into a free cell.
// If there is no room, the sale is paid at once, so the player never loses the goods or their value.
export function migrateSalesInPlace(save: Record<string, unknown>): Record<string, unknown> {
  const rowCount = BACKPACK_BASE_ROWS + BACKPACK_ROWS_PER_EXPANSION * ((save.backpackExpansions as number | undefined) ?? 0);
  const backpack = [...((save.backpack ?? []) as BackpackEntry[])];
  let copper = (save.copper as number | undefined) ?? 0;
  const jobs = ((save.jobs ?? []) as (OldSaleJob | Record<string, unknown>)[]).flatMap((job) => {
    if (job.kind !== 'sell') return [job];
    const { content, ...saleJob } = job as OldSaleJob;
    const placed = backpack.map((entry) => ({ column: entry.column, row: entry.row, ...sizeOf(entry.content) }));
    const spot = content ? findFreeGridSpot(placed, sizeOf(content).width, sizeOf(content).height, BACKPACK_COLUMNS, rowCount) : null;
    if (content && spot) {
      backpack.push({ ...spot, content, saleJobId: saleJob.id });
      return [saleJob];
    }
    copper += saleJob.copper;
    return [];
  });
  return { ...save, backpack, jobs, copper };
}
