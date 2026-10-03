import type { BankUnlockId } from '../../model/bankUnlock';
import data from '../../../data/balance/economy.json';

export const COPPER_PER_SILVER = data.copperPerSilver;
export const SILVER_PER_GOLD = data.silverPerGold;

export const STARTING_COPPER = data.startingCopper;

export const MAXIMUM_COMPANY_SIZE = data.maximumCompanySize;

export const HERO_HIRE_COST_BY_COMPANY_SIZE: readonly number[] = data.heroHireCostByCompanySize;

export const MERCHANT_BASE_SALE_SLOTS = data.merchantSaleSlots;
export const MERCHANT_EXTRA_SLOT_COSTS_COPPER: readonly number[] = data.merchantExtraSlotCostsCopper;
export const BANK_UNLOCK_COSTS_COPPER: Readonly<Record<BankUnlockId, number>> = data.bankUnlockCostsCopper;
export const SALE_SECONDS_MINIMUM = data.saleSecondsMinimum;
export const SALE_SECONDS_PER_COPPER = data.saleSecondsPerCopper;
export const SALE_SECONDS_MAXIMUM = data.saleSecondsMaximum;
