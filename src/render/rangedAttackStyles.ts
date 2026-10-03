export type RangedAttackStyle = 'arrow' | 'magicBolt';

export const RANGED_ATTACK_STYLE_BY_SPRITE_KEY: Readonly<Record<string, RangedAttackStyle>> = {
  'hero-archer': 'arrow',
  'hero-mage': 'magicBolt',
};
