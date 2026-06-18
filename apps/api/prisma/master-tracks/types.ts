import { QuizQuestionType } from '@prisma/client';

export interface WeekDefinition {
  week: number;
  title: string;
  topics: string[];
  labs: string[];
  assignment: string;
  miniProject: string;
  interviewPrep: string[];
  capstone?: boolean;
}

export interface MasterTrackDefinition {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  industryPositioning?: string[];
  techStack?: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: 'FOUNDATION' | 'SPECIALIZATION' | 'INDUSTRY';
  trackLevel: 1 | 2 | 3;
  estimatedWeeks: 8;
  isPlaceholder: boolean;
  weeks: WeekDefinition[];
  capstoneOptions?: string[];
  capstoneRequirements?: string[];
}

export interface GeneratedQuestion {
  type: QuizQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | number | boolean;
  explanation?: string;
  code?: string;
  points?: number;
}

export interface QuizDef {
  title: string;
  passingScore: number;
  timeLimit: number;
  maxRetries: number;
  questions: GeneratedQuestion[];
}
