import { QuizDef } from './types';
import { buildWeeklyQuestions } from './quiz-topic-pools';

/** Weekly quiz: 15 MCQ + 10 DEBUG + 10 CODE_OUTPUT + 5 scenario + 5 completion + 5 problem = 50 */
export function generateWeeklyQuiz(
  trackSlug: string,
  trackName: string,
  weekTitle: string,
  weekNum: number,
  topics: string[],
): QuizDef {
  return {
    title: `Week ${weekNum} Assessment — ${weekTitle}`,
    passingScore: 80,
    timeLimit: 3600,
    maxRetries: 3,
    questions: buildWeeklyQuestions(trackSlug, trackName, weekTitle, weekNum, topics),
  };
}
