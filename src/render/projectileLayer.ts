import { Group, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import { PALETTE } from './palette';
import type { RangedAttackStyle } from './rangedAttackStyles';

const PROJECTILE_Z = 2.5;
const FLIGHT_PIXELS_PER_SECOND_BY_STYLE: Readonly<Record<RangedAttackStyle, number>> = { arrow: 1100, magicBolt: 800 };

interface Projectile {
  group: Group;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  bornSeconds: number;
  flightSeconds: number;
  onArrive: () => void;
}

export interface ProjectileLayer {
  launch(style: RangedAttackStyle, from: PixelPoint, to: PixelPoint, direction: number, nowSeconds: number, onArrive: () => void): void;
  update(elapsedSeconds: number): void;
  clear(): void;
}

export interface PixelPoint {
  x: number;
  y: number;
}

const squareGeometry = new PlaneGeometry(1, 1);

function addPart(group: Group, color: string, centerX: number, width: number, height: number): void {
  const part = new Mesh(squareGeometry, new MeshBasicMaterial({ color }));
  part.scale.set(width, height, 1);
  part.position.set(centerX, 0, 0);
  group.add(part);
}

// The arrow stays horizontal: a rotated one-pixel line would break the whole-pixel rule.
function buildProjectileGroup(style: RangedAttackStyle, direction: number): Group {
  const group = new Group();
  if (style === 'arrow') {
    addPart(group, PALETTE.bone, 0, 8, 1);
    addPart(group, PALETTE.steel, 4 * direction, 2, 3);
    addPart(group, PALETTE.blood, -4 * direction, 2, 3);
  } else {
    addPart(group, PALETTE.violet, 0, 6, 6);
    addPart(group, '#ffffff', 0, 3, 3);
  }
  return group;
}

export function createProjectileLayer(root: Group): ProjectileLayer {
  const flyingProjectiles: Projectile[] = [];

  const remove = (projectile: Projectile): void => {
    projectile.group.children.forEach((part) => ((part as Mesh).material as MeshBasicMaterial).dispose());
    root.remove(projectile.group);
  };

  return {
    launch: (style, from, to, direction, nowSeconds, onArrive) => {
      const group = buildProjectileGroup(style, direction);
      group.position.set(from.x, from.y, PROJECTILE_Z);
      root.add(group);
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const flightSeconds = Math.max(0.05, distance / FLIGHT_PIXELS_PER_SECOND_BY_STYLE[style]);
      flyingProjectiles.push({ group, startX: from.x, startY: from.y, endX: to.x, endY: to.y, bornSeconds: nowSeconds, flightSeconds, onArrive });
    },
    update: (elapsedSeconds) => {
      for (let index = flyingProjectiles.length - 1; index >= 0; index--) {
        const projectile = flyingProjectiles[index] as Projectile;
        const progress = (elapsedSeconds - projectile.bornSeconds) / projectile.flightSeconds;
        if (progress >= 1) {
          flyingProjectiles.splice(index, 1);
          remove(projectile);
          projectile.onArrive();
          continue;
        }
        projectile.group.position.x = Math.round(projectile.startX + (projectile.endX - projectile.startX) * progress);
        projectile.group.position.y = Math.round(projectile.startY + (projectile.endY - projectile.startY) * progress);
      }
    },
    clear: () => {
      flyingProjectiles.splice(0).forEach(remove);
    },
  };
}
