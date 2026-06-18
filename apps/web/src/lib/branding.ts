import { APP_CONFIG } from '@constel/config';

export const BRAND = {
  name: process.env.NEXT_PUBLIC_APP_NAME || APP_CONFIG.name,
  company: APP_CONFIG.company,
  programName: APP_CONFIG.programName,
  tagline: APP_CONFIG.tagline,
  aiAssistantName: APP_CONFIG.aiAssistantName,
  aiTagline: APP_CONFIG.aiTagline,
  aiEmptyStateHint: APP_CONFIG.aiEmptyStateHint,
} as const;
