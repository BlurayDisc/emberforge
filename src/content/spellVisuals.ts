import spellVisualsData from '../../data/spell-visuals.json';

export const CAST_ART_IDS = ['rune-circle', 'power-flash', 'dust-ring', 'shadow-puff', 'roar-ring'] as const;
export const PROJECTILE_ART_IDS = ['arrow-glow', 'fireball', 'great-fireball', 'ice-shard', 'arcane-missile'] as const;
export const IMPACT_ART_IDS = ['slash-cross', 'shock-ring', 'flame-burst', 'ice-burst', 'arcane-pop', 'holy-pillar', 'pierce-spark', 'dagger-slash', 'fist-star', 'crush-burst', 'heal-sparkles', 'steel-slash', 'iron-bash', 'steel-cleave', 'fire-explosion'] as const;
export const BUFF_ART_IDS = ['guard-shield', 'rage-flames', 'wind-lines'] as const;
export const DEBUFF_ART_IDS = ['weaken-mark', 'frost-chill', 'burn-flames'] as const;

export const SPELL_ICON_MOTIFS = ['slash', 'fist', 'shield', 'arrow', 'flame', 'shard', 'orb', 'heal', 'holy', 'dagger', 'skull', 'wind', 'weaken', 'snow', 'drop'] as const;

export type SpellIconMotif = (typeof SPELL_ICON_MOTIFS)[number];
export type CastArtId = (typeof CAST_ART_IDS)[number];
export type ProjectileArtId = (typeof PROJECTILE_ART_IDS)[number];
export type ImpactArtId = (typeof IMPACT_ART_IDS)[number];
export type BuffArtId = (typeof BUFF_ART_IDS)[number];
export type DebuffArtId = (typeof DEBUFF_ART_IDS)[number];

// What a spell looks like. The cast shows on the caster, the projectile flies to the target, the impact shows on the target.
// A buff or a debuff stays on its unit while the status lasts. A damage spell with an inflicted status shows its debuff after the impact.
export interface SpellVisualSpec {
  theme: string;
  // The picture on the spell icon. A spell without a look gets one from its effect and its class.
  icon?: SpellIconMotif;
  cast?: CastArtId;
  projectile?: ProjectileArtId;
  impact?: ImpactArtId;
  buff?: BuffArtId;
  debuff?: DebuffArtId;
}

export const SPELL_VISUALS = spellVisualsData.spells as unknown as Readonly<Record<string, SpellVisualSpec>>;

export function findSpellVisual(spellId: string): SpellVisualSpec | undefined {
  return SPELL_VISUALS[spellId];
}
