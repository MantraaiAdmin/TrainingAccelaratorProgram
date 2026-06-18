/**
 * Updates lesson & exercise content in-place without resetting student progress.
 * Run: npx ts-node prisma/update-lesson-content.ts
 */
import { PrismaClient } from '@prisma/client';
import { generateDetailedLesson, generateInterviewLesson, generateLabExercise } from './master-tracks/lesson-content';
import { MASTER_TRACKS } from './master-tracks/tracks';

const prisma = new PrismaClient();

async function main() {
  console.log('📖 Updating lesson content in-place...');

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
                include: { lesson: true, exercise: true },
              },
            },
          },
        },
      });

      if (!module) continue;

      for (const chapter of module.chapters) {
        for (const sub of chapter.subsections) {
          if (sub.contentType === 'LESSON' && sub.lesson) {
            await prisma.lesson.update({
              where: { id: sub.lesson.id },
              data: {
                content: generateDetailedLesson(sub.title, trackDef.name, trackDef.slug, week.title, week.week),
              },
            });
          }

          if (sub.contentType === 'CODING_EXERCISE' && sub.exercise) {
            const ex = generateLabExercise(sub.title, trackDef.name, trackDef.slug, week.week, week.title, week.topics);
            await prisma.codingExercise.update({
              where: { id: sub.exercise.id },
              data: {
                problemStatement: ex.problem,
                hints: ex.hints,
                starterCode: ex.starterCode,
              },
            });
          }

          if (sub.contentType === 'INTERVIEW' && sub.lesson) {
            await prisma.lesson.update({
              where: { id: sub.lesson.id },
              data: {
                content: generateInterviewLesson(sub.title, trackDef.name, trackDef.slug, week.title, week.week),
              },
            });
          }
        }
      }
    }

    console.log(`  ✅ Updated content for ${trackDef.name}`);
  }

  console.log('📖 Done — student progress preserved.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
