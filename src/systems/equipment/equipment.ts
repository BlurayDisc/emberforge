import { CLASSES } from '../../content/classes';
import { requireById } from '../../content/lookup';
import type { ClassId, Hero } from '../../model/hero';
import type { EquipmentSlot, Item } from '../../model/item';

export interface EquipProblem {
  key: string;
  params: Record<string, string | number>;
}

export interface EquipResult {
  hero: Hero;
  replacedItem: Item | null;
}

export function findEquipProblem(hero: Hero, item: Item): EquipProblem | null {
  if (hero.level < item.itemLevel) return { key: 'equip.needsLevel', params: { level: item.itemLevel } };
  const classDefinition = requireById(CLASSES, hero.classId);
  if (item.slot === 'mainHand' && !classDefinition.weaponTypes.includes(item.gearType)) {
    return { key: 'equip.cannotUseWeapon', params: { classId: hero.classId } };
  }
  if (item.slot === 'offHand' && !classDefinition.offHandTypes.includes(item.gearType)) {
    return { key: 'equip.cannotUseOffHand', params: { classId: hero.classId } };
  }
  if (item.armourWeight !== null && !classDefinition.armourWeights.includes(item.armourWeight)) {
    return { key: 'equip.wearsArmour', params: { classId: hero.classId, armourWeight: classDefinition.armourWeights.join(',') } };
  }
  return null;
}

// The classes that may wear or wield an item of this base. The Workshop shows them before the player crafts.
export function classIdsThatCanUse(base: Pick<Item, 'slot' | 'gearType' | 'armourWeight'>): ClassId[] {
  return CLASSES.filter((classDefinition) => {
    if (base.slot === 'mainHand' && !classDefinition.weaponTypes.includes(base.gearType)) return false;
    if (base.slot === 'offHand' && !classDefinition.offHandTypes.includes(base.gearType)) return false;
    return base.armourWeight === null || classDefinition.armourWeights.includes(base.armourWeight);
  }).map((classDefinition) => classDefinition.id);
}

export function slotsForItem(item: Item): EquipmentSlot[] {
  return item.slot === 'ring' ? ['ringOne', 'ringTwo'] : [item.slot];
}

function chooseSlot(hero: Hero, item: Item, requestedSlot?: EquipmentSlot): EquipmentSlot {
  if (requestedSlot && slotsForItem(item).includes(requestedSlot)) return requestedSlot;
  if (item.slot !== 'ring') return item.slot;
  return hero.equipment.ringOne && !hero.equipment.ringTwo ? 'ringTwo' : 'ringOne';
}

export function equipItem(hero: Hero, item: Item, requestedSlot?: EquipmentSlot): EquipResult {
  const slot = chooseSlot(hero, item, requestedSlot);
  return {
    hero: { ...hero, equipment: { ...hero.equipment, [slot]: item } },
    replacedItem: hero.equipment[slot] ?? null,
  };
}

export function unequipItem(hero: Hero, slot: EquipmentSlot): EquipResult {
  const { [slot]: removedItem, ...remainingEquipment } = hero.equipment;
  return { hero: { ...hero, equipment: remainingEquipment }, replacedItem: removedItem ?? null };
}
