import { Group, Sprite, SpriteMaterial } from 'three';
import type { CachedEffect } from './effectTextures';

const EFFECT_Z = 2.6;
const FADE_OUT_SECONDS = 0.4;
const ABOVE_HEAD_GAP = 14;
const FEET_LIFT = 2;
const BODY_HEIGHT_FRACTION = 0.55;
const FLIGHT_PIXELS_PER_SECOND = 650;
const MINIMUM_FLIGHT_SECONDS = 0.1;
const TRAIL_SECONDS = 0.045;

export interface UnitAnchor {
  x: number;
  feetY: number;
  height: number;
}

export interface PixelPoint {
  x: number;
  y: number;
}

interface ActiveEffect {
  sprite: Sprite;
  cached: CachedEffect;
  bornSeconds: number;
  lifeSeconds: number;
  // Returns the unit place while the unit is on the stage. An effect keeps its last place when the unit leaves.
  anchorOf: () => UnitAnchor | undefined;
  mirror: number;
  key: string | null;
}

interface Flight {
  sprite: Sprite;
  cached: CachedEffect;
  trailSpark: CachedEffect;
  from: PixelPoint;
  to: PixelPoint;
  bornSeconds: number;
  flightSeconds: number;
  nextTrailSeconds: number;
  onArrive: () => void;
}

interface WaitingAction {
  runAtSeconds: number;
  action: () => void;
}

function centreOnAnchor(anchor: UnitAnchor, cached: CachedEffect): PixelPoint {
  switch (cached.art.anchor) {
    case 'feet': return { x: anchor.x, y: anchor.feetY + FEET_LIFT };
    case 'above': return { x: anchor.x, y: anchor.feetY + anchor.height + ABOVE_HEAD_GAP };
    case 'column': return { x: anchor.x, y: anchor.feetY + cached.height / 2 - FEET_LIFT };
    case 'body': return { x: anchor.x, y: anchor.feetY + anchor.height * BODY_HEIGHT_FRACTION };
  }
}

export interface SpellEffectLayer {
  // A one-shot effect lasts for its frames. A looping effect lasts for lifeSeconds. A key replaces the effect with the same key.
  spawnOnUnit(cached: CachedEffect, anchorOf: () => UnitAnchor | undefined, options: { mirror?: number; lifeSeconds?: number; key?: string }): void;
  spawnAtPoint(cached: CachedEffect, point: PixelPoint): void;
  // The projectile flies in a straight line and leaves a trail. The impact starts in onArrive.
  launchProjectile(cached: CachedEffect, trailSpark: CachedEffect, from: PixelPoint, to: PixelPoint, mirror: number, onArrive: () => void): void;
  later(delaySeconds: number, action: () => void): void;
  now(): number;
  update(elapsedSeconds: number): void;
  clear(): void;
}

export function createSpellEffectLayer(root: Group): SpellEffectLayer {
  const activeEffects: ActiveEffect[] = [];
  const flights: Flight[] = [];
  const waitingActions: WaitingAction[] = [];
  let nowSeconds = 0;

  const remove = (effect: ActiveEffect): void => {
    effect.sprite.material.dispose();
    root.remove(effect.sprite);
  };

  const place = (effect: ActiveEffect, point: PixelPoint): void => {
    effect.sprite.position.set(Math.round(point.x), Math.round(point.y), EFFECT_Z);
  };

  const add = (cached: CachedEffect, mirror: number, lifeSeconds: number, anchorOf: () => UnitAnchor | undefined, key: string | null): ActiveEffect => {
    const sprite = new Sprite(new SpriteMaterial({ map: cached.textures[0] ?? null, transparent: true }));
    sprite.scale.set(cached.width * mirror, cached.height, 1);
    root.add(sprite);
    const effect: ActiveEffect = { sprite, cached, bornSeconds: nowSeconds, lifeSeconds, anchorOf, mirror, key };
    activeEffects.push(effect);
    return effect;
  };

  const oneShotSeconds = (cached: CachedEffect): number => cached.art.frames.length / cached.art.framesPerSecond;

  return {
    spawnOnUnit: (cached, anchorOf, options) => {
      const key = options.key ?? null;
      if (key !== null) {
        for (let index = activeEffects.length - 1; index >= 0; index--) {
          if (activeEffects[index]?.key === key) remove(activeEffects.splice(index, 1)[0] as ActiveEffect);
        }
      }
      const anchor = anchorOf();
      if (!anchor) return;
      const effect = add(cached, options.mirror ?? 1, cached.art.looping ? (options.lifeSeconds ?? oneShotSeconds(cached)) : oneShotSeconds(cached), anchorOf, key);
      place(effect, centreOnAnchor(anchor, cached));
    },
    spawnAtPoint: (cached, point) => {
      const effect = add(cached, 1, oneShotSeconds(cached), () => undefined, null);
      place(effect, point);
    },
    launchProjectile: (cached, trailSpark, from, to, mirror, onArrive) => {
      const sprite = new Sprite(new SpriteMaterial({ map: cached.textures[0] ?? null, transparent: true }));
      sprite.scale.set(cached.width * mirror, cached.height, 1);
      sprite.position.set(Math.round(from.x), Math.round(from.y), EFFECT_Z);
      root.add(sprite);
      const flightSeconds = Math.max(MINIMUM_FLIGHT_SECONDS, Math.hypot(to.x - from.x, to.y - from.y) / FLIGHT_PIXELS_PER_SECOND);
      flights.push({ sprite, cached, trailSpark, from, to, bornSeconds: nowSeconds, flightSeconds, nextTrailSeconds: nowSeconds, onArrive });
    },
    later: (delaySeconds, action) => {
      if (delaySeconds <= 0) action();
      else waitingActions.push({ runAtSeconds: nowSeconds + delaySeconds, action });
    },
    now: () => nowSeconds,
    update: (elapsedSeconds) => {
      nowSeconds = elapsedSeconds;
      for (let index = waitingActions.length - 1; index >= 0; index--) {
        const waiting = waitingActions[index] as WaitingAction;
        if (waiting.runAtSeconds > nowSeconds) continue;
        waitingActions.splice(index, 1);
        waiting.action();
      }
      for (let index = flights.length - 1; index >= 0; index--) {
        const flight = flights[index] as Flight;
        const progress = (nowSeconds - flight.bornSeconds) / flight.flightSeconds;
        if (progress >= 1) {
          flights.splice(index, 1);
          flight.sprite.material.dispose();
          root.remove(flight.sprite);
          flight.onArrive();
          continue;
        }
        const point = { x: Math.round(flight.from.x + (flight.to.x - flight.from.x) * progress), y: Math.round(flight.from.y + (flight.to.y - flight.from.y) * progress) };
        flight.sprite.position.set(point.x, point.y, EFFECT_Z);
        flight.sprite.material.map = flight.cached.textures[Math.floor((nowSeconds - flight.bornSeconds) * flight.cached.art.framesPerSecond) % flight.cached.textures.length] ?? null;
        if (nowSeconds >= flight.nextTrailSeconds) {
          flight.nextTrailSeconds = nowSeconds + TRAIL_SECONDS;
          const trail = add(flight.trailSpark, 1, oneShotSeconds(flight.trailSpark), () => undefined, null);
          place(trail, point);
        }
      }
      for (let index = activeEffects.length - 1; index >= 0; index--) {
        const effect = activeEffects[index] as ActiveEffect;
        const age = nowSeconds - effect.bornSeconds;
        if (age >= effect.lifeSeconds) {
          activeEffects.splice(index, 1);
          remove(effect);
          continue;
        }
        const { frames, framesPerSecond, looping } = effect.cached.art;
        const frameIndex = looping ? Math.floor(age * framesPerSecond) % frames.length : Math.min(frames.length - 1, Math.floor(age * framesPerSecond));
        effect.sprite.material.map = effect.cached.textures[frameIndex] ?? null;
        effect.sprite.material.opacity = looping ? Math.min(1, (effect.lifeSeconds - age) / FADE_OUT_SECONDS) : 1;
        const anchor = effect.anchorOf();
        if (anchor) place(effect, centreOnAnchor(anchor, effect.cached));
      }
    },
    clear: () => {
      flights.splice(0).forEach((flight) => {
        flight.sprite.material.dispose();
        root.remove(flight.sprite);
      });
      activeEffects.splice(0).forEach(remove);
      waitingActions.length = 0;
    },
  };
}
