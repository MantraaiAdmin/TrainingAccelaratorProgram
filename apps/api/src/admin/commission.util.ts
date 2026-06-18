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

export interface CommissionAmounts {
  college: number;
  sales: number;
  mentor: number;
  company: number;
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

export const COMMISSION_SETTING_KEY = 'default_commission_split';

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

export function normalizeCommissionConfig(raw: unknown): CommissionConfig {
  const r = (raw ?? {}) as Partial<CommissionConfig>;
  return withDerivedCompany({ ...DEFAULT_COMMISSION, ...r, mode: r.mode ?? 'PERCENTAGE' });
}

export function validateCommissionConfig(config: CommissionConfig): string | null {
  if (config.mode === 'PERCENTAGE') {
    const shares =
      config.collegeCommissionPct + config.salesCommissionPct + config.mentorCommissionPct;
    if (shares > 100) {
      return `College + Sales + Mentor cannot exceed 100% (currently ${shares.toFixed(1)}%)`;
    }
    for (const key of ['collegeCommissionPct', 'salesCommissionPct', 'mentorCommissionPct'] as const) {
      if (config[key] < 0 || config[key] > 100) return `${key} must be between 0 and 100`;
    }
    return null;
  }

  if (config.courseFeeThreshold < 0) return 'Course fee threshold must be positive';
  if (config.standardFlatTotalInr <= 0) return 'Standard tier total must be positive';
  if (config.premiumFlatTotalInr <= 0) return 'Premium tier total must be positive';

  const standardShares = config.collegeFlatInr + config.salesFlatInr + config.mentorFlatInr;
  const premiumShares = config.collegeFlatPremiumInr + config.salesFlatPremiumInr + config.mentorFlatPremiumInr;

  if (standardShares > config.standardFlatTotalInr) {
    return `Standard tier: College + Sales + Mentor (₹${standardShares}) exceeds total (₹${config.standardFlatTotalInr})`;
  }
  if (premiumShares > config.premiumFlatTotalInr) {
    return `Premium tier: College + Sales + Mentor (₹${premiumShares}) exceeds total (₹${config.premiumFlatTotalInr})`;
  }

  for (const key of [
    'collegeFlatInr', 'salesFlatInr', 'mentorFlatInr', 'companyFlatInr',
    'collegeFlatPremiumInr', 'salesFlatPremiumInr', 'mentorFlatPremiumInr', 'companyFlatPremiumInr',
  ] as const) {
    if (config[key] < 0) return `${key} cannot be negative`;
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

export function splitRevenue(
  amount: number,
  config: CommissionConfig,
  studentTier?: StudentCommissionTier | null,
): CommissionAmounts {
  if (config.mode === 'FLAT_PER_STUDENT') {
    const premium = resolveFlatTier(amount, config, studentTier) === 'PREMIUM';
    if (premium) {
      return {
        college: config.collegeFlatPremiumInr,
        sales: config.salesFlatPremiumInr,
        mentor: config.mentorFlatPremiumInr,
        company: config.companyFlatPremiumInr,
      };
    }
    return {
      college: config.collegeFlatInr,
      sales: config.salesFlatInr,
      mentor: config.mentorFlatInr,
      company: config.companyFlatInr,
    };
  }

  return {
    college: Math.round((amount * config.collegeCommissionPct) / 100),
    sales: Math.round((amount * config.salesCommissionPct) / 100),
    mentor: Math.round((amount * config.mentorCommissionPct) / 100),
    company: Math.round((amount * config.companyProfitPct) / 100),
  };
}

export function collegeToConfig(college: {
  commissionMode: string;
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
}): CommissionConfig {
  return normalizeCommissionConfig({
    mode: college.commissionMode as CommissionMode,
    collegeCommissionPct: college.collegeCommissionPct,
    salesCommissionPct: college.salesCommissionPct,
    mentorCommissionPct: college.mentorCommissionPct,
    companyProfitPct: college.companyProfitPct,
    courseFeeThreshold: college.courseFeeThreshold,
    standardFlatTotalInr: college.standardFlatTotalInr,
    premiumFlatTotalInr: college.premiumFlatTotalInr,
    collegeFlatInr: college.collegeFlatInr,
    salesFlatInr: college.salesFlatInr,
    mentorFlatInr: college.mentorFlatInr,
    companyFlatInr: college.companyFlatInr,
    collegeFlatPremiumInr: college.collegeFlatPremiumInr,
    salesFlatPremiumInr: college.salesFlatPremiumInr,
    mentorFlatPremiumInr: college.mentorFlatPremiumInr,
    companyFlatPremiumInr: college.companyFlatPremiumInr,
  });
}

export function flatTierTotal(config: CommissionConfig, premium: boolean): number {
  return premium ? config.premiumFlatTotalInr : config.standardFlatTotalInr;
}

export function configToCollegeData(config: CommissionConfig) {
  return {
    commissionMode: config.mode as 'PERCENTAGE' | 'FLAT_PER_STUDENT',
    collegeCommissionPct: config.collegeCommissionPct,
    salesCommissionPct: config.salesCommissionPct,
    mentorCommissionPct: config.mentorCommissionPct,
    companyProfitPct: config.companyProfitPct,
    courseFeeThreshold: config.courseFeeThreshold,
    standardFlatTotalInr: config.standardFlatTotalInr,
    premiumFlatTotalInr: config.premiumFlatTotalInr,
    collegeFlatInr: config.collegeFlatInr,
    salesFlatInr: config.salesFlatInr,
    mentorFlatInr: config.mentorFlatInr,
    companyFlatInr: config.companyFlatInr,
    collegeFlatPremiumInr: config.collegeFlatPremiumInr,
    salesFlatPremiumInr: config.salesFlatPremiumInr,
    mentorFlatPremiumInr: config.mentorFlatPremiumInr,
    companyFlatPremiumInr: config.companyFlatPremiumInr,
  };
}

// Legacy alias
export type CommissionSplit = CommissionConfig;
export const validateCommissionSplit = validateCommissionConfig;
