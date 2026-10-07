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
