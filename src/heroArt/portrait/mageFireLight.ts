import type { Hex } from '../heroPalette';

export const FIRE_LIGHT: Hex = '#ff9a3c';

export function litByFire(color: string, strength = 0.35): Hex {
  const channels = [1, 3, 5].map((start) => {
    const base = parseInt(color.slice(start, start + 2), 16);
    const fire = parseInt(FIRE_LIGHT.slice(start, start + 2), 16);
    return Math.round(base + (fire - base) * strength)
      .toString(16)
      .padStart(2, '0');
  });
  return `#${channels.join('')}`;
}
