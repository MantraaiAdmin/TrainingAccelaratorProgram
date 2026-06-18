export const APP_CONFIG = {
  name: 'Mantra.ai',
  company: 'Mantra.ai',
  programName: 'Mantra.ai Internship Program',
  tagline: 'Learn smarter. Build faster. Ship with confidence.',
  aiAssistantName: 'Mantra AI Tutor',
  aiTagline: 'Your 24/7 learning companion — syllabus-focused guidance from first concept to production-ready code.',
  aiEmptyStateHint: 'Master every lesson with instant help on concepts, examples, and exercise hints — powered by Mantra.ai.',
  version: '1.0.0',
} as const;

export const XP_CONFIG = {
  LESSON_COMPLETE: 10,
  SUBSECTION_COMPLETE: 5,
  CODING_EXERCISE: 25,
  QUIZ_PASS: 30,
  QUIZ_PERFECT: 50,
  ASSIGNMENT: 100,
  MINI_PROJECT: 200,
  CAPSTONE: 500,
  INTERVIEW_COMPLETE: 150,
  STREAK_BONUS: 5,
  DAILY_LOGIN: 2,
} as const;

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000, 25000,
] as const;

export const TRACK_CATEGORIES = {
  FOUNDATION: { label: 'Foundation', order: 1 },
  SPECIALIZATION: { label: 'Advanced Specialization', order: 2 },
  INDUSTRY: { label: 'Industry & Projects', order: 3 },
} as const;

export const DIFFICULTY_LABELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const;

export const PROGRESSION_ORDER = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

export const PLACEHOLDER_TRACKS = [] as const;

export const MASTER_TRACKS = [
  {
    slug: 'python-engineering-foundations',
    name: 'Foundation Track: Python, Data & AI',
    category: 'FOUNDATION',
    difficulty: 'BEGINNER',
    trackLevel: 1,
    weeks: 10,
  },
  {
    slug: 'full-stack-product-engineering',
    name: 'Full Stack Product Engineering',
    category: 'SPECIALIZATION',
    difficulty: 'INTERMEDIATE',
    trackLevel: 2,
    weeks: 8,
  },
  {
    slug: 'ai-engineering-intelligent-systems',
    name: 'AI Engineering & Intelligent Systems',
    category: 'SPECIALIZATION',
    difficulty: 'ADVANCED',
    trackLevel: 3,
    weeks: 8,
  },
] as const;

export const QUIZ_CONFIG = {
  passingScore: 80,
  maxRetries: 3,
  cooldownMinutes: 60,
  timeLimitSeconds: 3600,
  questionsPerWeek: 50,
  distribution: {
    mcq: 15,
    debugging: 10,
    outputPrediction: 10,
    scenario: 5,
    codeCompletion: 5,
    problemSolving: 5,
  },
} as const;

export const CERTIFICATE_REQUIREMENTS = {
  lessonsComplete: true,
  quizzesPassed: true,
  assignmentsSubmitted: true,
  miniProjectsComplete: true,
  capstoneComplete: true,
  interviewPrepComplete: true,
} as const;

export const CODE_EXECUTION = {
  DEFAULT_TIMEOUT_MS: 10000,
  DEFAULT_MEMORY: '128m',
  MAX_OUTPUT_LENGTH: 10000,
  ALLOWED_LANGUAGES: ['python'] as const,
} as const;

export const RATE_LIMITS = {
  API: { ttl: 60, limit: 100 },
  AUTH: { ttl: 60, limit: 10 },
  AI: { ttl: 60, limit: 20 },
  CODE_EXEC: { ttl: 60, limit: 30 },
} as const;

export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function xpToNextLevel(xp: number): number {
  const level = calculateLevel(xp);
  if (level >= LEVEL_THRESHOLDS.length) return 0;
  return LEVEL_THRESHOLDS[level] - xp;
}
