import { Container, Sprite } from 'pixi.js';
import { BATTLE_Z } from './battleLayers';
import { createFlatSprite } from './pixiTextures';

const PARTICLE_SIZE = 2;
const PARTICLE_GRAVITY = 220;
const PARTICLE_LIFE_SECONDS = 0.45;
const PARTICLE_SPEED = 60;
const PARTICLE_LIFT = 30;

interface Particle {
  sprite: Sprite;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  bornSeconds: number;
}

export interface ParticleLayer {
  burst(centerX: number, centerY: number, color: string, count: number, nowSeconds: number): void;
  update(nowSeconds: number, deltaSeconds: number): void;
  clear(): void;
}

export function createParticleLayer(root: Container): ParticleLayer {
  const particles: Particle[] = [];
  return {
    burst: (centerX, centerY, color, count, nowSeconds) => {
      for (let index = 0; index < count; index++) {
        const sprite = createFlatSprite(color, PARTICLE_SIZE, PARTICLE_SIZE);
        sprite.zIndex = BATTLE_Z.particle;
        root.addChild(sprite);
        const angle = (index / count) * Math.PI * 2 + centerX;
        // The y axis points down, so an upward speed is negative.
        particles.push({ sprite, x: centerX, y: centerY, velocityX: Math.cos(angle) * PARTICLE_SPEED, velocityY: -(Math.sin(angle) * PARTICLE_SPEED + PARTICLE_LIFT), bornSeconds: nowSeconds });
      }
    },
    update: (nowSeconds, deltaSeconds) => {
      for (let index = particles.length - 1; index >= 0; index--) {
        const particle = particles[index] as Particle;
        const age = nowSeconds - particle.bornSeconds;
        if (age > PARTICLE_LIFE_SECONDS) {
          particle.sprite.destroy();
          particles.splice(index, 1);
          continue;
        }
        particle.velocityY += PARTICLE_GRAVITY * deltaSeconds;
        particle.x += particle.velocityX * deltaSeconds;
        particle.y += particle.velocityY * deltaSeconds;
        particle.sprite.position.set(Math.round(particle.x - PARTICLE_SIZE / 2), Math.round(particle.y - PARTICLE_SIZE / 2));
        particle.sprite.alpha = 1 - age / PARTICLE_LIFE_SECONDS;
      }
    },
    clear: () => {
      particles.splice(0).forEach((particle) => particle.sprite.destroy());
    },
  };
}
