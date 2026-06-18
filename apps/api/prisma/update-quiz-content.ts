/**
 * Updates weekly quiz questions in-place without resetting student progress records.
 * Run: npx ts-node prisma/update-quiz-content.ts
 */
import { PrismaClient, QuizQuestionType } from '@prisma/client';
import { generateWeeklyQuiz } from './master-tracks/quiz-generator';
import { MASTER_TRACKS } from './master-tracks/tracks';

const prisma = new PrismaClient();

async function main() {
  console.log('📝 Updating quiz content in-place...');

  for (const trackDef of MASTER_TRACKS) {
    const track = await prisma.track.findUnique({ where: { slug: trackDef.slug } });
    if (!track) {
      console.log(`  ⏭ Track not found: ${trackDef.slug}`);
      continue;
    }

    for (const week of trackDef.weeks) {
      const module = await prisma.module.findFirst({
        where: { trackId: track.id, order: week.week },
        include: {
          chapters: {
            include: {
              subsections: {
                include: {
                  quiz: { include: { questions: true } },
                },
              },
            },
          },
        },
      });

      if (!module) continue;

      for (const chapter of module.chapters) {
        for (const sub of chapter.subsections) {
          if (sub.contentType !== 'QUIZ' || !sub.quiz) continue;

          const quizDef = generateWeeklyQuiz(
            trackDef.slug,
            trackDef.name,
            week.title,
            week.week,
            week.topics,
          );

          await prisma.quiz.update({
            where: { id: sub.quiz.id },
            data: {
              title: quizDef.title,
              passingScore: quizDef.passingScore,
              timeLimit: quizDef.timeLimit,
            },
          });

          await prisma.quizQuestion.deleteMany({ where: { quizId: sub.quiz.id } });

          for (let i = 0; i < quizDef.questions.length; i++) {
            const q = quizDef.questions[i];
            await prisma.quizQuestion.create({
              data: {
                quizId: sub.quiz.id,
                type: q.type as QuizQuestionType,
                question: q.question,
                options: q.options ?? undefined,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                code: q.code,
                points: q.points || 2,
                order: i + 1,
              },
            });
          }

          console.log(`  ✅ Week ${week.week} quiz updated (${quizDef.questions.length} questions)`);
        }
      }
    }

    console.log(`  ✅ Quizzes updated for ${trackDef.name}`);
  }

  console.log('📝 Done — quiz attempts preserved (may reference old question IDs).');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
