import { Container, Sprite, type Texture } from 'pixi.js';
import type { BattleUnit } from '../model/battle';
import type { RealtimeBattleReport } from '../model/realtimeBattle';
import { drawBattleBackdrop } from './battleBackdrops';
import { PALETTE } from './palette';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, type PixelStage } from './pixelStage';
import { healthBarLength, type HealthBarLengthScale } from '../kernel/healthBarLength';
import { createHealthBar } from './healthBarArt';
import { BATTLE_Z } from './battleLayers';
import { createBattleEventEffects } from './battleEventEffects';
import { createBattleSprite, poseTexturesOf } from './battleSprites';
import { applyAnimation, placeHealthBar, type UnitVisual } from './battleUnitVisual';
import { createParticleLayer } from './battleParticles';
import { hexToNumber } from './colorMath';
import { createFieldProjection, type FieldProjection } from './fieldProjection';
import { createFloatingTextLayer } from './floatingText';
import { createFlatSprite, createPixiTexture } from './pixiTextures';
import { spreadOverlappingHealthBars } from './healthBarSpread';
import { createProjectileLayer } from './projectileLayer';
import { RANGED_ATTACK_STYLE_BY_SPRITE_KEY, type RangedAttackStyle } from './rangedAttackStyles';
import type { SpellVisualSpec } from '../content/spellVisuals';
import { createSpellEffectPlayer } from './spellEffects/spellEffectPlayer';
import { actionWindowsByUnit } from './unitActionWindows';
import { createUnitMotion, createUnitPlacement } from './unitMotion';
import { slashFrameTextures } from './weaponSlashArt';

const STAGE_HEALTH_BAR_SCALE: HealthBarLengthScale = { lengthPerRootPoint: 4, minimum: 28, maximum: 56 };
const SIDE_OFFSET_X = 105;
const WHITE_TINT = 0xffffff;
const MAXIMUM_FRAME_SECONDS = 0.1;
// A unit whose attack reaches farther than this shoots. A hero archer and mage have their own projectile looks, any other shooter fires a magic bolt.
const SHOOTER_MINIMUM_REACH = 2;
const SHADOW_WIDTH_FRACTION = 0.9;
const UNIT_DEPTH_SORT_STEP = 0.01;
const DEAD_UNIT_Z = BATTLE_Z.shadow + 1;
const RUN_HOP_PHASE_STEP = 1.7;
const ENEMY_BOB_PHASE = 0.9;

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
  const visualsFrontToBack: UnitVisual[] = [];
  const rareTint = hexToNumber(PALETTE.gold);
  // The clock of the view. It runs from the browser frames times the time scale, so pause and fast playback reach every effect.
  let latestElapsedSeconds = 1;
  let previousWallSeconds: number | null = null;
  let timeScale = 1;
  let realtimeProjection: FieldProjection | null = null;
  let battleSeconds = 0;
  const eventEffects = createBattleEventEffects({ visualsByUnitId, projectileLayer, particleLayer, floatingTextLayer, spellEffects, viewSeconds: () => latestElapsedSeconds });

  const clearUnits = (): void => {
    projectileLayer.clear();
    particleLayer.clear();
    floatingTextLayer.clear();
    spellEffects.clear();
    visualsByUnitId.forEach((visual) => {
      visual.sprite.destroy();
      visual.slash.destroy();
      visual.shadow.destroy();
      visual.healthBar.dispose();
    });
    visualsByUnitId.clear();
    visualsFrontToBack.length = 0;
    realtimeProjection = null;
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
    visual.healthBar.setResource(placement.resource);
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
    spreadOverlappingHealthBars(visualsFrontToBack);
    particleLayer.update(elapsedSeconds, deltaSeconds);
  };

  stage.onFrame((wallSeconds) => {
    const wallDeltaSeconds = previousWallSeconds === null ? 0 : Math.min(MAXIMUM_FRAME_SECONDS, wallSeconds - previousWallSeconds);
    previousWallSeconds = wallSeconds;
    runFrame(wallDeltaSeconds * timeScale);
  });

  return {
    ...eventEffects,
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
          const slash = new Sprite(slashFrameTextures('large')[0]);
          slash.anchor.set(0, 0.5);
          slash.visible = false;
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
            sprite, readyTexture: sprite.texture, poseTextures: poseTexturesOf(unit), slash, shadow, healthBar, baseTint: unit.rank === 'rare' ? rareTint : WHITE_TINT, spriteHeight, spriteWidth,
            healthBarHalfWidth: healthBar.sprite.width / 2, healthBarHeight: healthBar.sprite.height, centerX, feetY, side,
            drawnFacing: side === 'party' ? 1 : -1,
            rangedAttackStyle: RANGED_ATTACK_STYLE_BY_SPRITE_KEY[unit.spriteKey] ?? null,
            bobPhase: slotIndex * RUN_HOP_PHASE_STEP + (side === 'party' ? 0 : ENEMY_BOB_PHASE),
            flashUntilSeconds: 0, lungeStartSeconds: 0, lungeDirection: side === 'party' ? 1 : -1, shakeStartSeconds: 0, defeatedStartSeconds: 0,
            motion: null, placement: createUnitPlacement(),
          };
          placeHealthBar(visual);
          visualsByUnitId.set(unit.id, visual);
          visualsFrontToBack.push(visual);
          root.addChild(shadow, sprite, slash, healthBar.sprite);
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
    setUnitShield: (unitId, value, durationSeconds) => {
      visualsByUnitId.get(unitId)?.healthBar.setShield(value, latestElapsedSeconds, durationSeconds);
    },
  };
}
