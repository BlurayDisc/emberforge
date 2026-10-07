import { ATTRIBUTE_NAMES } from '../../content/attributes';
import { HP_PER_STRENGTH, RESISTANCE_PER_INTELLIGENCE } from '../../content/balance/heroStats';
import { CLASSES, type AttributeName, type ClassDefinition } from '../../content/classes';
import { requireById } from '../../content/lookup';
import type { ClassId } from '../../model/hero';
import type { StatBlock } from '../../model/statBlock';

export type Attributes = Record<AttributeName, number>;

export function attributesAtLevel(classDefinition: ClassDefinition, level: number): Attributes {
  const attributes = {} as Attributes;
  for (const attribute of ATTRIBUTE_NAMES) {
    const { start, gainPerLevel } = classDefinition.attributes[attribute];
    attributes[attribute] = Math.round(start + gainPerLevel * (level - 1));
  }
  return attributes;
}

// HP and Resistance follow the attributes. Defence follows nothing: no attribute and no level gives it.
export function statsFromAttributes(classDefinition: ClassDefinition, attributes: Attributes): StatBlock {
  return {
    hp: Math.round(classDefinition.baseHp + attributes.strength * HP_PER_STRENGTH),
    ...attributes,
    defence: classDefinition.baseDefence,
    resistance: Math.round(classDefinition.baseResistance + attributes.intelligence * RESISTANCE_PER_INTELLIGENCE),
  };
}

export function classStatsAtLevel(classId: ClassId, level: number): StatBlock {
  const classDefinition = requireById(CLASSES, classId);
  return statsFromAttributes(classDefinition, attributesAtLevel(classDefinition, level));
}
