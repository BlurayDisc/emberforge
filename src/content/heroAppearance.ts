import appearanceData from '../../data/hero-appearance.json';
import type { ClassId } from '../model/hero';

export interface ClassLook {
  background: string;
  backgroundShade: string;
  cloth: string;
  clothShade: string;
  trim: string;
  gender?: HeroGender;
  hair?: string;
  slender?: boolean;
}

export type HeroGender = 'male' | 'female';

export interface HeroAppearance {
  gender: HeroGender;
  skin: string;
  skinShade: string;
  hair: string;
  eye: string;
  look: ClassLook;
}

function hashText(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickFrom(options: readonly string[], seed: number): string {
  return options[seed % options.length] ?? options[0] ?? '#ffffff';
}

export function pickHeroAppearance(classId: ClassId, heroName: string): HeroAppearance {
  const seed = hashText(`${classId}:${heroName}`);
  const look = (appearanceData.classLooks as Record<ClassId, ClassLook>)[classId];
  const skinIndex = seed % appearanceData.skinTones.length;
  return {
    gender: look.gender ?? (appearanceData.femaleNames.includes(heroName) ? 'female' : 'male'),
    skin: appearanceData.skinTones[skinIndex] ?? '#f2c9a0',
    skinShade: appearanceData.skinShades[skinIndex] ?? '#d9a87c',
    hair: look.hair ?? pickFrom(appearanceData.hairColors, seed >> 3),
    eye: pickFrom(appearanceData.eyeColors, seed >> 6),
    look,
  };
}
