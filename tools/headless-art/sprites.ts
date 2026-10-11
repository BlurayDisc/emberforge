import { BASE_ITEMS } from '../../src/content/baseItems';
import { MATERIALS } from '../../src/content/materials';
import { SPELLS, familyIdOf } from '../../src/content/spells';
import { drawDungeonIcon, drawFightIcon, drawItemIcon, drawLockIcon, drawMaterialIcon } from '../../src/ui/iconArt';
import { drawSpellIcon } from '../../src/ui/spellIconArt';
import { CLASSES } from '../../src/content/classes';
import { DUNGEONS } from '../../src/content/dungeons';
import { heroNamesForClass } from '../../src/content/heroNames';
import { drawBattleBackdrop } from '../../src/render/battleBackdrops';
import { CREATURE_DRAWERS } from '../../src/render/creatureArt';
import { buildFullBodyPortrait } from '../../src/ui/fullBody/fullBodyPortraitArt';
import { buildCrafterPortrait } from '../../src/ui/crafterPortraitArt';
import { drawHeroBust } from '../../src/heroArt/bustIcon';
import { CLASSES_WITH_POSES, drawHeroSprite } from '../../src/heroArt/battleSprite';
import type { HeroPose } from '../../src/heroArt/heroPose';
import type { SheetEntry, SheetOptions } from './contactSheet';
import { headlessCanvasOf, installHeadlessCanvas } from './installHeadlessCanvas';
import { writeContactSheet } from './writeSheet';

const HERO_NAMES_PER_CLASS = 4;

interface SpriteGroup {
  entries: () => SheetEntry[];
  options: SheetOptions;
}

const SPRITE_GROUPS: Readonly<Record<string, SpriteGroup>> = {
  heroes: {
    options: { scale: 8, columns: 4 },
    entries: () =>
      CLASSES.flatMap((definition) =>
        heroNamesForClass(definition.id)
          .slice(0, HERO_NAMES_PER_CLASS)
          .map((name) => ({ label: `${definition.id} ${name}`, canvas: headlessCanvasOf(drawHeroSprite(definition.id, name)) })),
      ),
  },
  poses: {
    options: { scale: 8, columns: 4 },
    entries: () =>
      CLASSES_WITH_POSES.flatMap((classId) =>
        (['ready', 'charge', 'released', 'reload'] as const satisfies readonly HeroPose[]).map((pose) => ({ label: `${classId} ${pose}`, canvas: headlessCanvasOf(drawHeroSprite(classId, heroNamesForClass(classId)[0] as string, pose)) })),
      ),
  },
  portraits: {
    options: { scale: 6, columns: 4 },
    entries: () =>
      CLASSES.flatMap((definition) =>
        heroNamesForClass(definition.id)
          .slice(0, HERO_NAMES_PER_CLASS)
          .map((name) => ({ label: `${definition.id} ${name}`, canvas: headlessCanvasOf(buildFullBodyPortrait(definition.id, name)) })),
      ),
  },
  busts: {
    options: { scale: 10, columns: 7 },
    entries: () =>
      CLASSES.flatMap((definition) =>
        heroNamesForClass(definition.id)
          .slice(0, 2)
          .map((name) => ({ label: `${definition.id} ${name}`, canvas: headlessCanvasOf(drawHeroBust(definition.id, name)) })),
      ),
  },
  crafters: {
    options: { scale: 8, columns: 4 },
    entries: () =>
      (['weaponsmithing', 'fletching', 'enchanting', 'armoursmithing', 'leatherworking', 'tailoring', 'jewelcrafting'] as const).map((professionId) => ({
        label: professionId,
        canvas: headlessCanvasOf(buildCrafterPortrait(professionId)),
      })),
  },
  creatures: {
    options: { scale: 4, columns: 8 },
    entries: () => Object.entries(CREATURE_DRAWERS).map(([spriteKey, draw]) => ({ label: spriteKey, canvas: headlessCanvasOf(draw()) })),
  },
  items: {
    options: { scale: 8, columns: 6 },
    entries: () => BASE_ITEMS.map((item) => ({ label: item.id, canvas: headlessCanvasOf(drawItemIcon(item.id, 'category-default', item.mainCategory)) })),
  },
  sets: {
    options: { scale: 8, columns: 6 },
    entries: () =>
      ['sword', 'dagger', 'bow', 'helm-heavy', 'armour-heavy', 'armour-medium', 'armour-light', 'gloves-light', 'boots-medium'].flatMap((baseId) => {
        const base = BASE_ITEMS.find((item) => item.id === baseId);
        return ['copper-ore', 'sharp-fang', 'bone-shard', 'coarse-sinew', 'toadskin', 'spider-silk'].map((materialId) => ({ label: `${baseId} ${materialId}`, canvas: headlessCanvasOf(drawItemIcon(baseId, materialId, base?.mainCategory ?? 'ore')) }));
      }),
  },
  materials: {
    options: { scale: 8, columns: 8 },
    entries: () => MATERIALS.map((material) => ({ label: material.id, canvas: headlessCanvasOf(drawMaterialIcon(material.id, material.category)) })),
  },
  icons: {
    options: { scale: 8, columns: 6 },
    entries: () => [
      ...DUNGEONS.map((dungeon) => ({ label: dungeon.id, canvas: headlessCanvasOf(drawDungeonIcon(dungeon.id)) })),
      ...(['ore', 'wood', 'hide', 'cloth', 'gem', 'fang', 'scale', 'bone', 'sinew', 'essence', 'skin', 'silk', 'catalyst'] as const).map((category) => ({ label: `category-${category}`, canvas: headlessCanvasOf(drawMaterialIcon(`category-${category}`, category)) })),
      { label: 'town', canvas: headlessCanvasOf(drawDungeonIcon('town')) },
      { label: 'lock', canvas: headlessCanvasOf(drawLockIcon()) },
      { label: 'fight', canvas: headlessCanvasOf(drawFightIcon()) },
    ],
  },
  spellicons: {
    options: { scale: 6, columns: 12 },
    entries: () => SPELLS.filter((spell) => familyIdOf(spell) === spell.id).map((spell) => ({ label: spell.id, canvas: headlessCanvasOf(drawSpellIcon(spell.id)) })),
  },
  backdrops: {
    options: { scale: 1, columns: 2 },
    entries: () => DUNGEONS.map((dungeon) => ({ label: dungeon.id, canvas: headlessCanvasOf(drawBattleBackdrop(dungeon.id)) })),
  },
};

installHeadlessCanvas();
const requestedGroup = process.argv[2];
const labelFilter = process.argv[3];
const groupNames = requestedGroup ? [requestedGroup] : Object.keys(SPRITE_GROUPS);
for (const groupName of groupNames) {
  const group = SPRITE_GROUPS[groupName];
  if (!group) {
    console.error(`Unknown sprite group "${groupName}". Use: ${Object.keys(SPRITE_GROUPS).join(', ')}`);
    process.exit(1);
  }
  console.log(`\n== ${groupName} ==`);
  const entries = group.entries().filter((entry) => !labelFilter || entry.label.includes(labelFilter));
  writeContactSheet(labelFilter ? `${groupName}-${labelFilter}` : groupName, entries, group.options);
}
