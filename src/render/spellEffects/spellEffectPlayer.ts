import type { Group } from 'three';
import type { SpellVisualSpec } from '../../content/spellVisuals';
import { cachedEffectArt, cachedTrailSpark } from './effectTextures';
import { createSpellEffectLayer, type PixelPoint, type UnitAnchor } from './spellEffectLayer';

const PROJECTILE_START_OFFSET_X = 10;
const BODY_HEIGHT_FRACTION = 0.6;

export interface SpellUnitPlace extends UnitAnchor {
  // 1 when the unit looks to the right (the party), -1 when it looks to the left.
  facing: number;
}

// Draws the effects of spells. A cast shows on the caster, a projectile flies to the target, an impact shows on the target,
// and a buff or a debuff stays on its unit while the status lasts.
export interface SpellEffectPlayer {
  playCast(casterId: string, visual: SpellVisualSpec): void;
  // Returns false when the spell has no projectile. Then the caller shows the hit at once.
  playProjectile(casterId: string, targetId: string, visual: SpellVisualSpec, delaySeconds: number, onArrive: () => void): boolean;
  playImpact(targetId: string, visual: SpellVisualSpec): void;
  playStatus(targetId: string, visual: SpellVisualSpec, role: 'buff' | 'debuff', durationSeconds: number): void;
  // Runs an action after a delay. A spell with many hits shows them one after the other.
  later(delaySeconds: number, action: () => void): void;
  update(elapsedSeconds: number): void;
  clear(): void;
}

function bodyPoint(place: SpellUnitPlace, sideOfUnit: number): PixelPoint {
  return { x: place.x + sideOfUnit * place.facing * PROJECTILE_START_OFFSET_X, y: place.feetY + place.height * BODY_HEIGHT_FRACTION };
}

export function createSpellEffectPlayer(root: Group, placeOf: (unitId: string) => SpellUnitPlace | undefined): SpellEffectPlayer {
  const layer = createSpellEffectLayer(root);
  const anchorGetter = (unitId: string) => (): UnitAnchor | undefined => placeOf(unitId);

  return {
    playCast: (casterId, visual) => {
      if (!visual.cast) return;
      layer.spawnOnUnit(cachedEffectArt('cast', visual.cast, visual.theme), anchorGetter(casterId), {});
    },
    playProjectile: (casterId, targetId, visual, delaySeconds, onArrive) => {
      if (!visual.projectile) return false;
      const projectileArt = visual.projectile;
      layer.later(delaySeconds, () => {
        const caster = placeOf(casterId);
        const target = placeOf(targetId);
        if (!caster || !target) {
          onArrive();
          return;
        }
        layer.launchProjectile(cachedEffectArt('projectile', projectileArt, visual.theme), cachedTrailSpark(visual.theme), bodyPoint(caster, 1), bodyPoint(target, -1), caster.facing, onArrive);
      });
      return true;
    },
    playImpact: (targetId, visual) => {
      if (!visual.impact) return;
      layer.spawnOnUnit(cachedEffectArt('impact', visual.impact, visual.theme), anchorGetter(targetId), {});
    },
    playStatus: (targetId, visual, role, durationSeconds) => {
      const artId = role === 'buff' ? visual.buff : visual.debuff;
      if (!artId) return;
      const facing = placeOf(targetId)?.facing ?? 1;
      layer.spawnOnUnit(cachedEffectArt(role, artId, visual.theme), anchorGetter(targetId), { lifeSeconds: durationSeconds, mirror: facing, key: `${targetId}:${role}:${artId}` });
    },
    later: layer.later,
    update: layer.update,
    clear: layer.clear,
  };
}
