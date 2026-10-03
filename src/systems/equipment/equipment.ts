import { CLASSES } from '../../content/classes';
import { requireById } from '../../content/lookup';
import type { Hero } from '../../model/hero';
import type { EquipmentSlot, Item } from '../../model/item';

export interface EquipResult {
  hero: Hero;
  replacedItem: Item | null;
}

export function findEquipProblem(hero: Hero, item: Item): string | null {
  if (hero.level < item.itemLevel) return `Needs level ${item.itemLevel}`;
  const classDefinition = requireById(CLASSES, hero.classId);
  if (item.slot === 'mainHand' && !classDefinition.weaponTypes.includes(item.gearType)) {
    return `${classDefinition.displayName} cannot use this weapon`;
  }
  if (item.slot === 'offHand' && !classDefinition.offHandTypes.includes(item.gearType)) {
    return `${classDefinition.displayName} cannot use this off-hand item`;
  }
  if (item.armourWeight !== null && item.armourWeight !== classDefinition.armourWeight) {
    return `${classDefinition.displayName} wears ${classDefinition.armourWeight} armour`;
  }
  return null;
}

function chooseSlot(hero: Hero, item: Item): EquipmentSlot {
  if (item.slot !== 'ring') return item.slot;
  return hero.equipment.ringOne && !hero.equipment.ringTwo ? 'ringTwo' : 'ringOne';
}

export function equipItem(hero: Hero, item: Item): EquipResult {
  const slot = chooseSlot(hero, item);
  return {
    hero: { ...hero, equipment: { ...hero.equipment, [slot]: item } },
    replacedItem: hero.equipment[slot] ?? null,
  };
}

export function unequipItem(hero: Hero, slot: EquipmentSlot): EquipResult {
  const { [slot]: removedItem, ...remainingEquipment } = hero.equipment;
  return { hero: { ...hero, equipment: remainingEquipment }, replacedItem: removedItem ?? null };
}
