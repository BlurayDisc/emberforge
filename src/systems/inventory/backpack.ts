import { MATERIAL_STACK_LIMIT } from '../../content/balance/dungeonRun';
import type { MaterialStack } from '../../model/material';

export interface AddMaterialsResult {
  stacks: MaterialStack[];
  overflow: MaterialStack[];
}

function addOneMaterial(
  stacks: MaterialStack[],
  addition: MaterialStack,
  cellCapacity: number,
): number {
  let remaining = addition.quantity;
  for (const stack of stacks) {
    if (remaining === 0) break;
    if (stack.materialId !== addition.materialId || stack.quantity >= MATERIAL_STACK_LIMIT) continue;
    const moved = Math.min(remaining, MATERIAL_STACK_LIMIT - stack.quantity);
    stack.quantity += moved;
    remaining -= moved;
  }
  while (remaining > 0 && stacks.length < cellCapacity) {
    const moved = Math.min(remaining, MATERIAL_STACK_LIMIT);
    stacks.push({ materialId: addition.materialId, quantity: moved });
    remaining -= moved;
  }
  return remaining;
}

export function addMaterials(
  currentStacks: readonly MaterialStack[],
  additions: readonly MaterialStack[],
  cellCapacity: number,
): AddMaterialsResult {
  const stacks = currentStacks.map((stack) => ({ ...stack }));
  const overflow: MaterialStack[] = [];
  for (const addition of additions) {
    const leftover = addOneMaterial(stacks, addition, cellCapacity);
    if (leftover > 0) overflow.push({ materialId: addition.materialId, quantity: leftover });
  }
  return { stacks, overflow };
}

export function combineMaterialQuantities(
  totals: readonly MaterialStack[],
  additions: readonly MaterialStack[],
): MaterialStack[] {
  const combined = totals.map((stack) => ({ ...stack }));
  for (const addition of additions) {
    const existing = combined.find((stack) => stack.materialId === addition.materialId);
    if (existing) existing.quantity += addition.quantity;
    else combined.push({ ...addition });
  }
  return combined;
}
