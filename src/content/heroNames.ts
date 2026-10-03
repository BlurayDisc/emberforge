import appearanceData from '../../data/hero-appearance.json';
import heroNamesData from '../../data/hero-names.json';
import type { ClassId } from '../model/hero';
import type { ClassLook } from './heroAppearance';

export const HERO_NAMES: readonly string[] = heroNamesData;

export function heroNamesForClass(classId: ClassId): readonly string[] {
  const fixedGender = (appearanceData.classLooks as Record<ClassId, ClassLook>)[classId].gender;
  if (fixedGender === undefined) return HERO_NAMES;
  return HERO_NAMES.filter((name) => appearanceData.femaleNames.includes(name) === (fixedGender === 'female'));
}
