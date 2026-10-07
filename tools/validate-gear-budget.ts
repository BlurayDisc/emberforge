const ARMOUR_WEIGHT_ORDER = ['heavy', 'medium', 'light'];
const DAMAGE_STATS = ['physicalDamage', 'magicalDamage'];
// Resistance alone does not count, because every monster hits physically for now.
const USELESS_STATS = ['resistance'];

interface GearBaseItem {
  id: string;
  slot: string;
  gearType: string;
  armourWeight: string | null;
  craftLevelOffset: number;
  mainStat: string;
  baseStats: Record<string, number>;
  growthPerItemLevel?: Record<string, number>;
}

interface GearBudget {
  baseStatSpreadFraction: number;
  minimumArmourDefence: number;
  weaponDamage: {
    atItemLevel1: number;
    growthPerItemLevel: number;
    maximumRoundingDifference: number;
    typeMultipliers: Record<string, Record<string, number>>;
  };
}

export function damageAtItemLevel(base: GearBaseItem, damageStat: string, itemLevel: number): number {
  return (base.baseStats[damageStat] ?? 0) + (base.growthPerItemLevel?.[damageStat] ?? 0) * (itemLevel - 1);
}

function checkWeaponDamage(base: GearBaseItem, budget: GearBudget, report: (message: string) => void): void {
  const damageStat = DAMAGE_STATS.find((stat) => stat in base.baseStats);
  if (!damageStat) return;
  const { atItemLevel1, growthPerItemLevel, maximumRoundingDifference, typeMultipliers } = budget.weaponDamage;
  const multiplier = typeMultipliers[base.slot]?.[base.gearType];
  if (multiplier === undefined) {
    report(`base-items.json: '${base.id}' has damage, but items.json has no weapon damage multiplier for ${base.slot} ${base.gearType}`);
    return;
  }
  const itemLevel = base.craftLevelOffset;
  const ruleDamage = Math.round(multiplier * (atItemLevel1 + growthPerItemLevel * (itemLevel - 1)));
  const actualDamage = damageAtItemLevel(base, damageStat, itemLevel);
  if (Math.abs(actualDamage - ruleDamage) > maximumRoundingDifference) {
    report(`base-items.json: '${base.id}' has ${damageStat} ${actualDamage.toFixed(2)} at item level ${itemLevel}, but the weapon rule gives ${ruleDamage}`);
  }
}

function checkArmourOrder(baseItems: GearBaseItem[], report: (message: string) => void): void {
  for (const slot of new Set(baseItems.filter((base) => base.armourWeight !== null).map((base) => base.slot))) {
    const [heavy, medium, light] = ARMOUR_WEIGHT_ORDER.map((weight) => baseItems.find((base) => base.slot === slot && base.armourWeight === weight)?.baseStats.defence);
    if (heavy === undefined) continue;
    if (medium !== undefined && heavy <= medium) report(`base-items.json: ${slot} heavy Defence ${heavy} must be above medium ${medium}`);
    if (medium !== undefined && light !== undefined && medium < light) report(`base-items.json: ${slot} medium Defence ${medium} must not be below light ${light}`);
  }
}

export function checkGearBudget(baseItems: GearBaseItem[], budget: GearBudget, report: (message: string) => void): void {
  for (const base of baseItems) {
    for (const [stat, value] of Object.entries(base.baseStats)) {
      if (!Number.isInteger(value)) report(`base-items.json: '${base.id}' has ${stat} ${value}. Base stats must be whole numbers`);
    }
    if (!(base.mainStat in base.baseStats)) report(`base-items.json: '${base.id}' has main stat '${base.mainStat}' that it does not give`);
    if (base.armourWeight !== null && (base.baseStats.defence ?? 0) < budget.minimumArmourDefence) {
      report(`base-items.json: armour '${base.id}' gives less than ${budget.minimumArmourDefence} Defence`);
    }
    const usefulStats = Object.entries(base.baseStats).filter(([stat, value]) => value > 0 && !USELESS_STATS.includes(stat));
    if (usefulStats.length === 0) report(`base-items.json: '${base.id}' has no useful stat. Every craft must matter`);
    checkWeaponDamage(base, budget, report);
  }
  checkArmourOrder(baseItems, report);
}
