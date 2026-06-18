export type CommissionMode = 'PERCENTAGE' | 'FLAT_PER_STUDENT';
export type StudentCommissionTier = 'AUTO' | 'STANDARD' | 'PREMIUM';
export type FlatTierChoice = 'STANDARD' | 'PREMIUM';

export interface CommissionConfig {
  mode: CommissionMode;
  collegeCommissionPct: number;
  salesCommissionPct: number;
  mentorCommissionPct: number;
  companyProfitPct: number;
  courseFeeThreshold: number;
  standardFlatTotalInr: number;
  premiumFlatTotalInr: number;
  collegeFlatInr: number;
  salesFlatInr: number;
  mentorFlatInr: number;
  companyFlatInr: number;
  collegeFlatPremiumInr: number;
  salesFlatPremiumInr: number;
  mentorFlatPremiumInr: number;
  companyFlatPremiumInr: number;
}

export const DEFAULT_COMMISSION: CommissionConfig = {
  mode: 'PERCENTAGE',
  collegeCommissionPct: 30,
  salesCommissionPct: 15,
  mentorCommissionPct: 10,
  companyProfitPct: 45,
  courseFeeThreshold: 5000,
  standardFlatTotalInr: 300,
  premiumFlatTotalInr: 400,
  collegeFlatInr: 120,
  salesFlatInr: 75,
  mentorFlatInr: 45,
  companyFlatInr: 60,
  collegeFlatPremiumInr: 160,
  salesFlatPremiumInr: 100,
  mentorFlatPremiumInr: 60,
  companyFlatPremiumInr: 80,
};

export function deriveFlatCompany(tierTotal: number, college: number, sales: number, mentor: number): number {
  return Math.max(0, tierTotal - college - sales - mentor);
}

export function withDerivedCompany(config: CommissionConfig): CommissionConfig {
  if (config.mode === 'FLAT_PER_STUDENT') {
    return {
      ...config,
      companyFlatInr: deriveFlatCompany(
        config.standardFlatTotalInr,
        config.collegeFlatInr,
        config.salesFlatInr,
        config.mentorFlatInr,
      ),
      companyFlatPremiumInr: deriveFlatCompany(
        config.premiumFlatTotalInr,
        config.collegeFlatPremiumInr,
        config.salesFlatPremiumInr,
        config.mentorFlatPremiumInr,
      ),
    };
  }
  return {
    ...config,
    companyProfitPct:
      100 - config.collegeCommissionPct - config.salesCommissionPct - config.mentorCommissionPct,
  };
}

export function flatTierTotal(config: CommissionConfig, premium: boolean): number {
  return premium ? config.premiumFlatTotalInr : config.standardFlatTotalInr;
}

export function validateCommissionConfig(config: CommissionConfig): string | null {
  const derived = withDerivedCompany(config);
  if (derived.mode === 'PERCENTAGE') {
    const shares =
      derived.collegeCommissionPct + derived.salesCommissionPct + derived.mentorCommissionPct;
    if (shares > 100) {
      return `College + Sales + Mentor cannot exceed 100% (currently ${shares.toFixed(1)}%)`;
    }
    return null;
  }
  if (derived.courseFeeThreshold < 0) return 'Threshold must be positive';
  if (derived.standardFlatTotalInr <= 0) return 'Standard tier total must be positive';
  if (derived.premiumFlatTotalInr <= 0) return 'Premium tier total must be positive';

  const standardShares = derived.collegeFlatInr + derived.salesFlatInr + derived.mentorFlatInr;
  const premiumShares =
    derived.collegeFlatPremiumInr + derived.salesFlatPremiumInr + derived.mentorFlatPremiumInr;

  if (standardShares > derived.standardFlatTotalInr) {
    return `Standard tier: College + Sales + Mentor (₹${standardShares}) exceeds total (₹${derived.standardFlatTotalInr})`;
  }
  if (premiumShares > derived.premiumFlatTotalInr) {
    return `Premium tier: College + Sales + Mentor (₹${premiumShares}) exceeds total (₹${derived.premiumFlatTotalInr})`;
  }
  return null;
}

export function resolveFlatTier(
  courseFeeInr: number,
  config: CommissionConfig,
  studentTier?: StudentCommissionTier | null,
): FlatTierChoice {
  if (studentTier === 'STANDARD') return 'STANDARD';
  if (studentTier === 'PREMIUM') return 'PREMIUM';
  return courseFeeInr > config.courseFeeThreshold ? 'PREMIUM' : 'STANDARD';
}

export function estimateEnrollmentSplit(
  courseFeeInr: number,
  config: CommissionConfig,
  studentTier?: StudentCommissionTier | null,
): { tier: FlatTierChoice; college: number; sales: number; mentor: number; company: number; total: number } {
  const derived = withDerivedCompany(config);
  if (derived.mode === 'FLAT_PER_STUDENT') {
    const tier = resolveFlatTier(courseFeeInr, derived, studentTier);
    const premium = tier === 'PREMIUM';
    const college = premium ? derived.collegeFlatPremiumInr : derived.collegeFlatInr;
    const sales = premium ? derived.salesFlatPremiumInr : derived.salesFlatInr;
    const mentor = premium ? derived.mentorFlatPremiumInr : derived.mentorFlatInr;
    const company = premium ? derived.companyFlatPremiumInr : derived.companyFlatInr;
    return { tier, college, sales, mentor, company, total: college + sales + mentor + company };
  }
  return {
    tier: resolveFlatTier(courseFeeInr, derived, studentTier),
    college: Math.round((courseFeeInr * derived.collegeCommissionPct) / 100),
    sales: Math.round((courseFeeInr * derived.salesCommissionPct) / 100),
    mentor: Math.round((courseFeeInr * derived.mentorCommissionPct) / 100),
    company: Math.round((courseFeeInr * derived.companyProfitPct) / 100),
    total: courseFeeInr,
  };
}

export function collegeRowToConfig(row: {
  commissionMode?: string;
  collegeCommissionPct: number;
  salesCommissionPct: number;
  mentorCommissionPct: number;
  companyProfitPct: number;
  courseFeeThreshold?: number;
  standardFlatTotalInr?: number;
  premiumFlatTotalInr?: number;
  collegeFlatInr?: number;
  salesFlatInr?: number;
  mentorFlatInr?: number;
  companyFlatInr?: number;
  collegeFlatPremiumInr?: number;
  salesFlatPremiumInr?: number;
  mentorFlatPremiumInr?: number;
  companyFlatPremiumInr?: number;
}): CommissionConfig {
  return withDerivedCompany({
    ...DEFAULT_COMMISSION,
    ...row,
    mode: (row.commissionMode as CommissionMode) ?? 'PERCENTAGE',
  });
}
