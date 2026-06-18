export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  MENTOR = 'MENTOR',
}

export enum TrackDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum TrackCategory {
  FOUNDATION = 'FOUNDATION',
  SPECIALIZATION = 'SPECIALIZATION',
  INDUSTRY = 'INDUSTRY',
}

export enum ContentType {
  LESSON = 'LESSON',
  CODING_EXERCISE = 'CODING_EXERCISE',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
  MINI_PROJECT = 'MINI_PROJECT',
  CAPSTONE = 'CAPSTONE',
  INTERVIEW = 'INTERVIEW',
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  RESUBMIT = 'RESUBMIT',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum QuizQuestionType {
  MCQ = 'MCQ',
  CODE_OUTPUT = 'CODE_OUTPUT',
  DEBUGGING = 'DEBUGGING',
  ORDERING = 'ORDERING',
}

export enum AchievementType {
  LESSON_COMPLETE = 'LESSON_COMPLETE',
  QUIZ_MASTER = 'QUIZ_MASTER',
  STREAK = 'STREAK',
  PROJECT_COMPLETE = 'PROJECT_COMPLETE',
  TRACK_COMPLETE = 'TRACK_COMPLETE',
  XP_MILESTONE = 'XP_MILESTONE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum AIProvider {
  QWEN = 'qwen',
  OPENAI = 'openai',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  OLLAMA = 'ollama',
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  collegeId?: string;
  departmentId?: string;
  year?: number;
  xp: number;
  level: number;
  streak: number;
  isActive: boolean;
}

export interface TrackSummary {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  difficulty: TrackDifficulty;
  category: TrackCategory;
  estimatedWeeks: number;
  isPlaceholder: boolean;
  progress?: number;
  isAssigned?: boolean;
}

export interface ModuleSummary {
  id: string;
  title: string;
  order: number;
  chaptersCount: number;
  progress?: number;
  isLocked?: boolean;
}

export interface ChapterSummary {
  id: string;
  title: string;
  order: number;
  subsectionsCount: number;
  progress?: number;
}

export interface SubsectionSummary {
  id: string;
  title: string;
  order: number;
  contentType: ContentType;
  isCompleted?: boolean;
}

export interface CodingExercise {
  id: string;
  title: string;
  difficulty: string;
  problemStatement: string;
  hints: string[];
  sampleInput?: string;
  sampleOutput?: string;
  constraints?: string;
  starterCode: string;
  visibleTestCases: TestCase[];
  xpReward: number;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface CodeExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTimeMs?: number;
  memoryUsedMb?: number;
  testResults?: TestResult[];
  passed?: number;
  total?: number;
}

export interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  error?: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  code?: string;
  points: number;
}

export interface QuizAttemptResult {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, boolean>;
}

export interface DashboardStats {
  assignedTracks: number;
  overallProgress: number;
  xp: number;
  level: number;
  streak: number;
  badges: number;
  leaderboardRank: number;
  certificates: number;
  pendingAssignments: number;
  interviewReadiness: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  level: number;
  avatarUrl?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AIContext {
  trackId?: string;
  trackName?: string;
  trackSlug?: string;
  moduleId?: string;
  moduleTitle?: string;
  moduleOrder?: number;
  chapterId?: string;
  chapterTitle?: string;
  subsectionId?: string;
  subsectionTitle?: string;
  contentType?: string;
  exerciseId?: string;
  studentCode?: string;
  compilerError?: string;
}

export interface Certificate {
  id: string;
  certificateId: string;
  studentName: string;
  trackName: string;
  programName: string;
  issuedAt: Date;
  qrCodeUrl?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  submittedAt?: Date;
}

export interface MockInterviewSession {
  id: string;
  type: 'technical' | 'hr' | 'coding';
  messages: AIChatMessage[];
  score?: number;
  feedback?: string;
}
