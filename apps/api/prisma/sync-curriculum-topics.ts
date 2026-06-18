/**
 * Adds new topic/lab/interview subsections from tracks.ts without wiping student progress.
 * Run: npx ts-node prisma/sync-curriculum-topics.ts
 */
import { PrismaClient, ContentType } from '@prisma/client';
import { MASTER_TRACKS } from './master-tracks/tracks';
import {
  generateDetailedLesson,
  generateInterviewLesson,
  generateLabExercise,
} from './master-tracks/lesson-content';
import { generateWeeklyQuiz } from './master-tracks/quiz-generator';
import { seedWeekModule } from './master-tracks/track-seeder';

const prisma = new PrismaClient();

async function createQuizForSubsection(
  subsectionId: string,
  trackSlug: string,
  trackName: string,
  weekTitle: string,
  weekNum: number,
  topics: string[],
) {
  const existing = await prisma.quiz.findUnique({ where: { subsectionId } });
  const quizDef = generateWeeklyQuiz(trackSlug, trackName, weekTitle, weekNum, topics);

  if (existing) {
    await prisma.quiz.update({
      where: { id: existing.id },
      data: { title: quizDef.title, passingScore: quizDef.passingScore, timeLimit: quizDef.timeLimit },
    });
    await prisma.quizQuestion.deleteMany({ where: { quizId: existing.id } });
    for (let i = 0; i < quizDef.questions.length; i++) {
      const q = quizDef.questions[i];
      await prisma.quizQuestion.create({
        data: {
          quizId: existing.id,
          type: q.type,
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
    return;
  }

  const created = await prisma.quiz.create({
    data: {
      subsectionId,
      title: quizDef.title,
      passingScore: quizDef.passingScore,
      timeLimit: quizDef.timeLimit,
      xpReward: 50,
    },
  });
  for (let i = 0; i < quizDef.questions.length; i++) {
    const q = quizDef.questions[i];
    await prisma.quizQuestion.create({
      data: {
        quizId: created.id,
        type: q.type,
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
}

async function syncChapterItems(
  chapterId: string,
  titles: string[],
  contentType: ContentType,
  trackDef: { slug: string; name: string },
  week: { week: number; title: string; topics: string[] },
  kind: 'lesson' | 'lab' | 'interview',
) {
  const existing = await prisma.subsection.findMany({
    where: { chapterId },
    orderBy: { order: 'asc' },
  });
  const titleSet = new Set(existing.map((s) => s.title.toLowerCase()));

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    if (titleSet.has(title.toLowerCase())) continue;

    const subsection = await prisma.subsection.create({
      data: {
        chapterId,
        title,
        order: existing.length + i + 1,
        contentType,
      },
    });

    if (kind === 'lesson') {
      await prisma.lesson.create({
        data: {
          subsectionId: subsection.id,
          content: generateDetailedLesson(title, trackDef.name, trackDef.slug, week.title, week.week),
          xpReward: 10,
        },
      });
    } else if (kind === 'interview') {
      await prisma.lesson.create({
        data: {
          subsectionId: subsection.id,
          content: generateInterviewLesson(title, trackDef.name, trackDef.slug, week.title, week.week),
          xpReward: 15,
        },
      });
    } else {
      const ex = generateLabExercise(title, trackDef.name, trackDef.slug, week.week, week.title, week.topics);
      await prisma.codingExercise.create({
        data: {
          subsectionId: subsection.id,
          title: ex.title,
          difficulty: ex.difficulty,
          problemStatement: ex.problem,
          hints: ex.hints,
          sampleInput: '',
          sampleOutput: ex.testCases[0]?.expectedOutput,
          starterCode: ex.starterCode,
          testCases: ex.testCases,
          xpReward: 25,
        },
      });
    }

    console.log(`    + Added ${kind}: ${title}`);
  }
}

async function main() {
  console.log('📚 Syncing expanded curriculum (preserves progress)...\n');

  for (const trackDef of MASTER_TRACKS) {
    const track = await prisma.track.findUnique({ where: { slug: trackDef.slug } });
    if (!track) {
      console.log(`  ⏭ Track not found: ${trackDef.slug}`);
      continue;
    }

    await prisma.track.update({
      where: { id: track.id },
      data: {
        name: trackDef.name,
        tagline: trackDef.tagline,
        description: trackDef.description,
        estimatedWeeks: trackDef.estimatedWeeks,
      },
    });

    console.log(`📘 ${trackDef.name}`);

    for (const week of trackDef.weeks) {
      const module = await prisma.module.findFirst({
        where: { trackId: track.id, order: week.week },
        include: { chapters: { include: { subsections: true } } },
      });
      if (!module) {
        console.log(`  + Creating module week ${week.week} — ${week.title}`);
        await seedWeekModule(prisma, track.id, trackDef, week);
        continue;
      }

      if (module.title !== `Week ${week.week} — ${week.title}`) {
        await prisma.module.update({
          where: { id: module.id },
          data: {
            title: `Week ${week.week} — ${week.title}`,
            description: week.capstone
              ? `Capstone sprint week for ${trackDef.name}.`
              : `Week ${week.week} of ${trackDef.name}: ${week.title}`,
          },
        });
        console.log(`  ~ Renamed module to Week ${week.week} — ${week.title}`);
      }

      const topicsChapter = module.chapters.find((c) => c.title === 'Topics');
      const labsChapter = module.chapters.find((c) => c.title === 'Labs');
      const interviewChapter = module.chapters.find((c) => c.title === 'Interview Preparation');
      const assessmentChapter = module.chapters.find((c) => c.title === 'Weekly Assessment');

      console.log(`  Week ${week.week} — ${week.title}`);

      if (topicsChapter) {
        await syncChapterItems(
          topicsChapter.id,
          week.topics,
          ContentType.LESSON,
          trackDef,
          week,
          'lesson',
        );
      }

      if (labsChapter) {
        await syncChapterItems(labsChapter.id, week.labs, ContentType.CODING_EXERCISE, trackDef, week, 'lab');
      }

      if (interviewChapter) {
        await syncChapterItems(
          interviewChapter.id,
          week.interviewPrep,
          ContentType.INTERVIEW,
          trackDef,
          week,
          'interview',
        );
      }

      if (assessmentChapter) {
        const quizSub = assessmentChapter.subsections[0];
        if (quizSub) {
          await createQuizForSubsection(
            quizSub.id,
            trackDef.slug,
            trackDef.name,
            week.title,
            week.week,
            week.topics,
          );
        }
      }
    }
  }

  console.log('\n📚 Sync complete. Run update-lesson-content.ts to refresh all lesson bodies.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
