import { HERO_HIRE_COST_BY_COMPANY_SIZE } from '../../content/balance/economy';

export function hireCostForCompanySize(companySize: number): number | null {
  return HERO_HIRE_COST_BY_COMPANY_SIZE[companySize] ?? null;
}
