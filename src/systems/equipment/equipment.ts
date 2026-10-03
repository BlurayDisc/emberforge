import { CLASSES } from '../../content/classes';
import { requireById } from '../../content/lookup';
import type { Hero } from '../../model/hero';
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
  if (item.armourWeight !== null && item.armourWeight !== classDefinition.armourWeight) {
    return { key: 'equip.wearsArmour', params: { classId: hero.classId, armourWeight: classDefinition.armourWeight } };
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
