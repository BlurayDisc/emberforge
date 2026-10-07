import { Container, Sprite, type Texture } from 'pixi.js';
import type { BattleUnit } from '../model/battle';
import type { RealtimeBattleReport } from '../model/realtimeBattle';
import { drawBattleBackdrop } from './battleBackdrops';
import { PALETTE } from './palette';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, type PixelStage } from './pixelStage';
import { healthBarLength, type HealthBarLengthScale } from '../kernel/healthBarLength';
import { createHealthBar } from './healthBarArt';
import { BATTLE_Z } from './battleLayers';
import { createBattleSprite } from './battleSprites';
import { applyAnimation, HIT_FLASH_SECONDS, placeHealthBar, type UnitVisual } from './battleUnitVisual';
import { createParticleLayer } from './battleParticles';
import { hexToNumber } from './colorMath';
import { createFieldProjection, type FieldProjection } from './fieldProjection';
import { createFloatingTextLayer } from './floatingText';
import { createFlatSprite, createPixiTexture } from './pixiTextures';
import { createProjectileLayer } from './projectileLayer';
import { RANGED_ATTACK_STYLE_BY_SPRITE_KEY, type RangedAttackStyle } from './rangedAttackStyles';
import type { SpellVisualSpec } from '../content/spellVisuals';
import { createSpellEffectPlayer } from './spellEffects/spellEffectPlayer';
import { actionWindowsByUnit } from './unitActionWindows';
import { createUnitMotion, createUnitPlacement } from './unitMotion';

const STAGE_HEALTH_BAR_SCALE: HealthBarLengthScale = { lengthPerRootPoint: 4, minimum: 28, maximum: 56 };
const SIDE_OFFSET_X = 105;
const WHITE_TINT = 0xffffff;
const MAXIMUM_FRAME_SECONDS = 0.1;
const SPELL_HIT_SPACING_SECONDS = 0.16;
// A unit whose attack reaches farther than this shoots. A hero archer and mage have their own projectile looks, any other shooter fires a magic bolt.
const SHOOTER_MINIMUM_REACH = 2;
const SHADOW_WIDTH_FRACTION = 0.9;
const UNIT_DEPTH_SORT_STEP = 0.01;
const DEAD_UNIT_Z = BATTLE_Z.shadow + 1;
const RUN_HOP_PHASE_STEP = 1.7;
const ENEMY_BOB_PHASE = 0.9;
const BODY_HEIGHT_FRACTION = 0.6;

export interface BattleView {
  setVisible(isVisible: boolean): void;
  setBackdrop(dungeonId: string): void;
  showUnits(units: readonly BattleUnit[]): void;
  // Real-time battle. Call it after showUnits. The units then follow the tracks of the report. Pass null for the old fixed slots.
  setRealtimeBattle(report: RealtimeBattleReport | null): void;
  // The battle time in seconds that the tracks are drawn at. The caller advances it, so pause and speed are the caller's choice.
  setBattleTime(battleSeconds: number): void;
  // The speed of the effects, particles and numbers. 0 freezes them (pause), 1 is normal, 2 and 4 are fast. The caller scales the battle time by the same number.
  setTimeScale(timeScale: number): void;
  // Runs the effects, particles and numbers for this many seconds at once, as a frame would. The battle sim page uses it to jump to a moment, and the screenshot tool needs it.
  advanceTime(deltaSeconds: number): void;
  setUnitHealth(unitId: string, hp: number): void;
  setUnitResource(unitId: string, value: number): void;
  // durationSeconds is set on the event that makes a shield. Later hits on the shield leave it out.
  setUnitShield(unitId: string, value: number, durationSeconds?: number): void;
  playDodge(targetId: string, text: string): void;
  playAbsorb(targetId: string, amount: number): void;
  playDamageOverTime(targetId: string, amount: number): void;
  playHit(actorId: string, targetId: string, amount: number, isCritical: boolean): void;
  playHeal(actorId: string, targetId: string, amount: number): void;
  markDefeated(unitId: string): void;
  playSpellCast(casterId: string, visual: SpellVisualSpec): void;
  // hitIndex counts the hits of one cast. debuffSeconds is set on the first hit at an enemy that gets a status.
  playSpellHit(actorId: string, targetId: string, amount: number, isCritical: boolean, visual: SpellVisualSpec, hitIndex: number, debuffSeconds: number | null): void;
  playSpellHeal(actorId: string, targetId: string, amount: number, visual: SpellVisualSpec | undefined): void;
  playSpellStatus(actorId: string, targetId: string, visual: SpellVisualSpec, role: 'buff' | 'debuff', durationSeconds: number): void;
}

function feetLogicalY(slotIndex: number, unitCount: number): number {
  return 205 - ((unitCount - 1) * 44) / 2 + slotIndex * 44;
}

function projectileAnchor(visual: UnitVisual, sideOfUnit: number): { x: number; y: number } {
  return { x: visual.centerX + sideOfUnit * visual.lungeDirection * 10, y: visual.feetY - visual.spriteHeight * BODY_HEIGHT_FRACTION };
}

export function createBattleView(stage: PixelStage): BattleView {
  const root = new Container();
  root.sortableChildren = true;
  root.visible = false;
  stage.pixi.views.addChild(root);

  const ground = new Sprite();
  ground.zIndex = BATTLE_Z.ground;
  root.addChild(ground);
  const backdropTextures = new Map<string, Texture>();

  const projectileLayer = createProjectileLayer(root);
  const particleLayer = createParticleLayer(root);
  const floatingTextLayer = createFloatingTextLayer(stage.overlay);
  const spellEffects = createSpellEffectPlayer(root, (unitId) => {
    const visual = visualsByUnitId.get(unitId);
    return visual && { x: visual.centerX, feetY: visual.feetY, height: visual.spriteHeight, facing: visual.lungeDirection };
  });
  const visualsByUnitId = new Map<string, UnitVisual>();
  const rareTint = hexToNumber(PALETTE.gold);
  // The clock of the view. It runs from the browser frames times the time scale, so pause and fast playback reach every effect.
  let latestElapsedSeconds = 1;
  let previousWallSeconds: number | null = null;
  let timeScale = 1;
  let realtimeProjection: FieldProjection | null = null;
  let battleSeconds = 0;

  const clearUnits = (): void => {
    projectileLayer.clear();
    particleLayer.clear();
    floatingTextLayer.clear();
    spellEffects.clear();
    visualsByUnitId.forEach((visual) => {
      visual.sprite.destroy();
      visual.shadow.destroy();
      visual.healthBar.dispose();
    });
    visualsByUnitId.clear();
    realtimeProjection = null;
  };

  const spawnFloatingText = (visual: UnitVisual, text: string, className: string): void => {
    floatingTextLayer.spawn(visual.centerX, visual.feetY - visual.spriteHeight, text, className, latestElapsedSeconds);
  };

  const spawnParticles = (visual: UnitVisual, color: string, count: number): void => {
    particleLayer.burst(visual.centerX, visual.feetY - visual.spriteHeight * BODY_HEIGHT_FRACTION, color, count, latestElapsedSeconds);
  };

  const showHitOn = (target: UnitVisual, amount: number, isCritical: boolean): void => {
    target.flashUntilSeconds = latestElapsedSeconds + HIT_FLASH_SECONDS;
    target.shakeStartSeconds = latestElapsedSeconds;
    spawnParticles(target, isCritical ? PALETTE.gold : '#ffffff', isCritical ? 10 : 5);
    if (amount > 0) spawnFloatingText(target, isCritical ? `${amount}!` : String(amount), isCritical ? 'critical' : 'damage');
  };

  // The unit stands where its track says. Units nearer the front of the ground are drawn over units behind them.
  const followTrack = (visual: UnitVisual, projection: FieldProjection): void => {
    const motion = visual.motion;
    if (!motion) return;
    const placement = visual.placement;
    motion.sampleAt(battleSeconds, placement);
    visual.centerX = Math.round(projection.screenX(placement.fieldX) + projection.sideGap(visual.side === 'party', visual.spriteWidth));
    visual.feetY = Math.round(projection.feetY(placement.fieldY));
    visual.lungeDirection = placement.facing;
    const isDefeated = visual.defeatedStartSeconds > 0;
    visual.sprite.zIndex = isDefeated ? DEAD_UNIT_Z : BATTLE_Z.unit + visual.feetY * UNIT_DEPTH_SORT_STEP;
    visual.shadow.position.set(Math.round(visual.centerX - (visual.spriteWidth * SHADOW_WIDTH_FRACTION) / 2), visual.feetY - 4);
    placeHealthBar(visual);
  };

  const runFrame = (deltaSeconds: number): void => {
    latestElapsedSeconds += deltaSeconds;
    if (!root.visible) return;
    const elapsedSeconds = latestElapsedSeconds;
    projectileLayer.update(elapsedSeconds);
    spellEffects.update(elapsedSeconds);
    floatingTextLayer.update(elapsedSeconds);
    visualsByUnitId.forEach((visual) => {
      if (realtimeProjection) followTrack(visual, realtimeProjection);
      applyAnimation(visual, elapsedSeconds);
      visual.healthBar.update(elapsedSeconds, deltaSeconds);
    });
    particleLayer.update(elapsedSeconds, deltaSeconds);
  };

  stage.onFrame((wallSeconds) => {
    const wallDeltaSeconds = previousWallSeconds === null ? 0 : Math.min(MAXIMUM_FRAME_SECONDS, wallSeconds - previousWallSeconds);
    previousWallSeconds = wallSeconds;
    runFrame(wallDeltaSeconds * timeScale);
  });

  return {
    setVisible: (isVisible) => {
      root.visible = isVisible;
      if (isVisible) stage.setLayout('fixed');
    },
    setBackdrop: (dungeonId) => {
      let texture = backdropTextures.get(dungeonId);
      if (!texture) {
        texture = createPixiTexture(drawBattleBackdrop(dungeonId));
        backdropTextures.set(dungeonId, texture);
      }
      ground.texture = texture;
      ground.width = LOGICAL_WIDTH;
      ground.height = LOGICAL_HEIGHT;
    },
    showUnits: (units) => {
      clearUnits();
      (['party', 'enemy'] as const).forEach((side) => {
        const sideUnits = units.filter((unit) => unit.side === side);
        sideUnits.forEach((unit, slotIndex) => {
          const sprite = createBattleSprite(unit);
          sprite.zIndex = BATTLE_Z.unit;
          const spriteHeight = sprite.height;
          const spriteWidth = sprite.width;
          const centerX = LOGICAL_WIDTH / 2 + (side === 'party' ? -SIDE_OFFSET_X : SIDE_OFFSET_X) - (unit.rank === 'boss' ? 6 : 0);
          const feetY = feetLogicalY(slotIndex, sideUnits.length);
          const shadowWidth = Math.round(spriteWidth * SHADOW_WIDTH_FRACTION);
          const shadow = createFlatSprite('#000000', shadowWidth, 6);
          shadow.zIndex = BATTLE_Z.shadow;
          shadow.alpha = 0.35;
          shadow.position.set(Math.round(centerX - shadowWidth / 2), feetY - 4);
          const barWidth = healthBarLength(unit.maxHp, STAGE_HEALTH_BAR_SCALE);
          const healthBar = createHealthBar({ hp: unit.hp, maxHp: unit.maxHp, level: unit.level, side, rank: unit.rank, barWidth, resource: side === 'party' && unit.maxResource > 0 ? { id: unit.resourceId, value: unit.resource, max: unit.maxResource } : undefined });
          healthBar.sprite.zIndex = BATTLE_Z.healthBar;
          const visual: UnitVisual = {
            sprite, shadow, healthBar, baseTint: unit.rank === 'rare' ? rareTint : WHITE_TINT, spriteHeight, spriteWidth,
            healthBarHalfWidth: healthBar.sprite.width / 2, healthBarHeight: healthBar.sprite.height, centerX, feetY, side,
            drawnFacing: side === 'party' ? 1 : -1,
            rangedAttackStyle: RANGED_ATTACK_STYLE_BY_SPRITE_KEY[unit.spriteKey] ?? null,
            bobPhase: slotIndex * RUN_HOP_PHASE_STEP + (side === 'party' ? 0 : ENEMY_BOB_PHASE),
            flashUntilSeconds: 0, lungeStartSeconds: 0, lungeDirection: side === 'party' ? 1 : -1, shakeStartSeconds: 0, defeatedStartSeconds: 0,
            motion: null, placement: createUnitPlacement(),
          };
          placeHealthBar(visual);
          visualsByUnitId.set(unit.id, visual);
          root.addChild(shadow, sprite, healthBar.sprite);
          applyAnimation(visual, latestElapsedSeconds);
        });
      });
    },
    setRealtimeBattle: (report) => {
      visualsByUnitId.forEach((visual) => {
        visual.motion = null;
      });
      realtimeProjection = null;
      battleSeconds = 0;
      if (!report) return;
      const windowsByUnit = actionWindowsByUnit(report.actionEvents);
      for (const track of report.tracks) {
        const visual = visualsByUnitId.get(track.unitId);
        if (!visual) continue;
        visual.motion = createUnitMotion(track, report.tickSeconds, windowsByUnit.get(track.unitId) ?? [], visual.bobPhase);
        if (visual.rangedAttackStyle === null && track.attackReach > SHOOTER_MINIMUM_REACH) visual.rangedAttackStyle = 'magicBolt' satisfies RangedAttackStyle;
      }
      realtimeProjection = createFieldProjection(report.field);
      visualsByUnitId.forEach((visual) => followTrack(visual, realtimeProjection as FieldProjection));
    },
    setBattleTime: (newBattleSeconds) => {
      battleSeconds = newBattleSeconds;
    },
    advanceTime: (deltaSeconds) => {
      runFrame(deltaSeconds);
    },
    setTimeScale: (newTimeScale) => {
      timeScale = newTimeScale;
      floatingTextLayer.setTimeScale(newTimeScale);
    },
    setUnitHealth: (unitId, hp) => {
      const visual = visualsByUnitId.get(unitId);
      if (visual) visual.healthBar.setHealth(hp, latestElapsedSeconds);
    },
    setUnitResource: (unitId, value) => {
      visualsByUnitId.get(unitId)?.healthBar.setResource(value);
    },
    setUnitShield: (unitId, value, durationSeconds) => {
      visualsByUnitId.get(unitId)?.healthBar.setShield(value, latestElapsedSeconds, durationSeconds);
    },
    playDodge: (targetId, text) => {
      const target = visualsByUnitId.get(targetId);
      if (target) spawnFloatingText(target, text, 'dodge');
    },
    playAbsorb: (targetId, amount) => {
      const target = visualsByUnitId.get(targetId);
      if (!target) return;
      spawnParticles(target, PALETTE.waterLight, 5);
      spawnFloatingText(target, `-${amount}`, 'absorb');
    },
    playDamageOverTime: (targetId, amount) => {
      const target = visualsByUnitId.get(targetId);
      if (!target) return;
      target.flashUntilSeconds = latestElapsedSeconds + HIT_FLASH_SECONDS;
      spawnFloatingText(target, String(amount), 'burn');
    },
    playHit: (actorId, targetId, amount, isCritical) => {
      const actor = visualsByUnitId.get(actorId);
      const target = visualsByUnitId.get(targetId);
      if (!target) return;
      const showImpact = (): void => showHitOn(target, amount, isCritical);
      if (actor?.rangedAttackStyle) {
        // The hit shows when the projectile lands, not when the shot leaves.
        projectileLayer.launch(actor.rangedAttackStyle, projectileAnchor(actor, 1), projectileAnchor(target, -1), actor.lungeDirection, latestElapsedSeconds, showImpact);
        return;
      }
      if (actor) actor.lungeStartSeconds = latestElapsedSeconds;
      showImpact();
    },
    playHeal: (actorId, targetId, amount) => {
      const actor = visualsByUnitId.get(actorId);
      const target = visualsByUnitId.get(targetId);
      if (actor) actor.lungeStartSeconds = latestElapsedSeconds;
      if (!target) return;
      spawnParticles(target, PALETTE.goblin, 6);
      spawnFloatingText(target, `+${amount}`, 'heal');
    },
    playSpellCast: (casterId, visual) => {
      const caster = visualsByUnitId.get(casterId);
      if (caster) caster.lungeStartSeconds = latestElapsedSeconds;
      spellEffects.playCast(casterId, visual);
    },
    playSpellHit: (actorId, targetId, amount, isCritical, visual, hitIndex, debuffSeconds) => {
      const target = visualsByUnitId.get(targetId);
      if (!target) return;
      const land = (): void => {
        showHitOn(target, amount, isCritical);
        spellEffects.playImpact(targetId, visual);
        if (debuffSeconds !== null) spellEffects.playStatus(targetId, visual, 'debuff', debuffSeconds);
      };
      const delaySeconds = hitIndex * SPELL_HIT_SPACING_SECONDS;
      if (!spellEffects.playProjectile(actorId, targetId, visual, delaySeconds, land)) spellEffects.later(delaySeconds, land);
    },
    playSpellHeal: (actorId, targetId, amount, visual) => {
      const actor = visualsByUnitId.get(actorId);
      const target = visualsByUnitId.get(targetId);
      if (actor) actor.lungeStartSeconds = latestElapsedSeconds;
      if (!target) return;
      spawnParticles(target, PALETTE.goblin, 6);
      spawnFloatingText(target, `+${amount}`, 'heal');
      if (visual) spellEffects.playImpact(targetId, visual);
    },
    playSpellStatus: (actorId, targetId, visual, role, durationSeconds) => {
      const applyStatus = (): void => {
        if (role === 'debuff') spellEffects.playImpact(targetId, visual);
        spellEffects.playStatus(targetId, visual, role, durationSeconds);
      };
      // A debuff with a projectile lands when the projectile arrives.
      if (role === 'debuff' && spellEffects.playProjectile(actorId, targetId, visual, 0, applyStatus)) return;
      applyStatus();
    },
    markDefeated: (unitId) => {
      const visual = visualsByUnitId.get(unitId);
      if (!visual) return;
      visual.defeatedStartSeconds = latestElapsedSeconds + 0.001;
      visual.healthBar.setVisible(false);
      visual.shadow.alpha = 0.15;
    },
  };
}
