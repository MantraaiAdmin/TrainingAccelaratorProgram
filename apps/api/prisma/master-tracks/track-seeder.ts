import { PrismaClient, ContentType, QuizQuestionType, TrackDifficulty, TrackCategory } from '@prisma/client';
import { MASTER_TRACKS } from './tracks';
import { MasterTrackDefinition, QuizDef } from './types';
import { generateWeeklyQuiz } from './quiz-generator';
import { generateDetailedLesson, generateInterviewLesson, generateLabExercise } from './lesson-content';

async function resetTrackContent(prisma: PrismaClient, trackId: string) {
  await prisma.assignment.deleteMany({ where: { trackId } });
  await prisma.miniProject.deleteMany({ where: { trackId } });
  await prisma.capstoneProject.deleteMany({ where: { trackId } });
  await prisma.interviewModule.deleteMany({ where: { trackId } });
  await prisma.module.deleteMany({ where: { trackId } });
}

async function createQuiz(prisma: PrismaClient, subsectionId: string, quiz: QuizDef) {
  const created = await prisma.quiz.create({
    data: {
      subsectionId,
      title: quiz.title,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      xpReward: 50,
    },
  });

  for (let i = 0; i < quiz.questions.length; i++) {
    const q = quiz.questions[i];
    await prisma.quizQuestion.create({
      data: {
        quizId: created.id,
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
}

export async function seedWeekModule(prisma: PrismaClient, trackId: string, def: MasterTrackDefinition, week: MasterTrackDefinition['weeks'][number]) {
  const module = await prisma.module.create({
    data: {
      trackId,
      title: `Week ${week.week} — ${week.title}`,
      description: week.capstone
        ? `Capstone sprint week for ${def.name}.`
        : `Week ${week.week} of ${def.name}: ${week.title}`,
      order: week.week,
    },
  });

  const topicsChapter = await prisma.chapter.create({
    data: { moduleId: module.id, title: 'Topics', order: 1 },
  });

  for (let i = 0; i < week.topics.length; i++) {
    const topic = week.topics[i];
    const subsection = await prisma.subsection.create({
      data: {
        chapterId: topicsChapter.id,
        title: topic,
        order: i + 1,
        contentType: ContentType.LESSON,
      },
    });
    await prisma.lesson.create({
      data: {
        subsectionId: subsection.id,
        content: generateDetailedLesson(topic, def.name, def.slug, week.title, week.week),
        xpReward: 10,
      },
    });
  }

  const labsChapter = await prisma.chapter.create({
    data: { moduleId: module.id, title: 'Labs', order: 2 },
  });

  for (let i = 0; i < week.labs.length; i++) {
    const lab = week.labs[i];
    const subsection = await prisma.subsection.create({
      data: {
        chapterId: labsChapter.id,
        title: lab,
        order: i + 1,
        contentType: ContentType.CODING_EXERCISE,
      },
    });
    const ex = generateLabExercise(lab, def.name, def.slug, week.week, week.title, week.topics);
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

  const assessmentChapter = await prisma.chapter.create({
    data: { moduleId: module.id, title: 'Weekly Assessment', order: 3 },
  });

  const quizSub = await prisma.subsection.create({
    data: {
      chapterId: assessmentChapter.id,
      title: `Week ${week.week} Evaluation (50 Questions)`,
      order: 1,
      contentType: ContentType.QUIZ,
    },
  });

  const weeklyQuiz = generateWeeklyQuiz(def.slug, def.name, week.title, week.week, week.topics);
  await createQuiz(prisma, quizSub.id, weeklyQuiz);

  const interviewChapter = await prisma.chapter.create({
    data: { moduleId: module.id, title: 'Interview Preparation', order: 4 },
  });

  for (let i = 0; i < week.interviewPrep.length; i++) {
    const topic = week.interviewPrep[i];
    const subsection = await prisma.subsection.create({
      data: {
        chapterId: interviewChapter.id,
        title: topic,
        order: i + 1,
        contentType: ContentType.INTERVIEW,
      },
    });
    await prisma.lesson.create({
      data: {
        subsectionId: subsection.id,
        content: generateInterviewLesson(topic, def.name, def.slug, week.title, week.week),
        xpReward: 15,
      },
    });
  }

  await prisma.assignment.create({
    data: {
      trackId,
      moduleId: module.id,
      title: week.capstone ? `Capstone Assignment — ${week.title}` : `Week ${week.week} Assignment`,
      description: week.capstone
        ? `Complete your capstone milestone for ${def.name}. Submit architecture docs, repo link, and deployment URL.`
        : `Assignment: **${week.assignment}**\n\nComplete this implementation exercise for Week ${week.week}: ${week.title}.`,
      instructions: week.capstone
        ? def.capstoneRequirements?.map((r, i) => `${i + 1}. ${r}`).join('\n') ||
          '1. GitHub repo\n2. Documentation\n3. Deployment\n4. Presentation'
        : `1. Read all topic lessons\n2. Complete lab exercises\n3. Implement: ${week.assignment}\n4. Pass the weekly assessment (80% minimum)\n5. Submit your solution`,
      deadline: new Date(Date.now() + week.week * 7 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      allowResubmit: true,
    },
  });

  if (!week.capstone) {
    await prisma.miniProject.create({
      data: {
        trackId,
        title: `Week ${week.week} Mini Project: ${week.miniProject}`,
        description: `Build **${week.miniProject}** as the Week ${week.week} mini project for ${def.name}.`,
        requirements: `## Requirements\n- Implement ${week.miniProject}\n- GitHub repository with README\n- Screenshots or demo URL\n- Documentation explaining architecture\n\n## Related Topics\n${week.topics.map((t) => `- ${t}`).join('\n')}`,
        maxScore: 100,
        order: week.week,
      },
    });
  }

  return module;
}

async function seedTrackContent(prisma: PrismaClient, trackId: string, def: MasterTrackDefinition) {
  for (const week of def.weeks) {
    await seedWeekModule(prisma, trackId, def, week);
  }

  // Track-level capstone
  await prisma.capstoneProject.create({
    data: {
      trackId,
      title: `${def.name} — Industry Capstone`,
      description: `Complete the industry-grade capstone for ${def.name}.\n\n## Options\n${(def.capstoneOptions || []).map((o) => `- ${o}`).join('\n')}`,
      milestones: def.weeks
        .filter((w) => w.capstone)
        .flatMap(() => [
          { title: 'Architecture Planning', description: 'Define requirements and system design', week: 1 },
          { title: 'Core Development', description: 'Implement main features', week: 2 },
          { title: 'Testing & CI/CD', description: 'Add tests and deployment pipeline', week: 3 },
          { title: 'Final Submission & Viva', description: 'Deploy, present, and defend', week: 4 },
        ]),
      rubric: {
        criteria: [
          { name: 'Architecture', weight: 25 },
          { name: 'Code Quality', weight: 25 },
          { name: 'Deployment', weight: 25 },
          { name: 'Presentation', weight: 25 },
        ],
      },
      maxScore: 200,
    },
  });

  // Track-level interview module
  await prisma.interviewModule.create({
    data: {
      trackId,
      title: `${def.name} — Interview Readiness`,
      description: `Complete interview preparation for ${def.name} including technical, coding, and HR rounds.`,
      content: {
        sections: def.weeks.flatMap((w) =>
          w.interviewPrep.map((topic) => ({
            week: w.week,
            title: topic,
            type: 'prep',
          })),
        ),
        mockInterview: { type: 'ai-powered', enabled: true },
        passRequirement: 'All weekly assessments passed (80%+)',
      },
    },
  });
}

export async function seedMasterTracks(prisma: PrismaClient, options?: { assignToUserId?: string; assignedBy?: string }) {
  console.log('📚 Seeding master tracks...');

  // Remove legacy placeholder tracks
  const legacySlugs = [
    'basics-of-python',
    'javascript-fundamentals',
    'data-structures-algorithms',
    'web-development-basics',
    'machine-learning',
    'deep-learning',
    'cloud-computing',
    'cybersecurity',
    'industry-project-ai',
    'industry-project-web',
  ];

  for (const slug of legacySlugs) {
    const existing = await prisma.track.findUnique({ where: { slug } });
    if (existing) {
      await prisma.certificate.deleteMany({ where: { trackId: existing.id } });
      await prisma.progressRecord.deleteMany({ where: { trackId: existing.id } });
      await prisma.trackPrerequisite.deleteMany({
        where: { OR: [{ trackId: existing.id }, { prerequisiteId: existing.id }] },
      });
      await resetTrackContent(prisma, existing.id);
      await prisma.trackAssignment.deleteMany({ where: { trackId: existing.id } });
      await prisma.track.delete({ where: { id: existing.id } });
      console.log(`  🗑 Removed legacy track: ${slug}`);
    }
  }

  for (let i = 0; i < MASTER_TRACKS.length; i++) {
    const def = MASTER_TRACKS[i];
    const track = await prisma.track.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        tagline: def.tagline,
        description: def.description,
        difficulty: def.difficulty as TrackDifficulty,
        category: def.category as TrackCategory,
        estimatedWeeks: def.estimatedWeeks,
        isPlaceholder: def.isPlaceholder,
        isPublished: true,
        order: i + 1,
      },
      create: {
        slug: def.slug,
        name: def.name,
        tagline: def.tagline,
        description: def.description,
        difficulty: def.difficulty as TrackDifficulty,
        category: def.category as TrackCategory,
        estimatedWeeks: def.estimatedWeeks,
        isPlaceholder: def.isPlaceholder,
        isPublished: true,
        order: i + 1,
        priceInr: def.trackLevel === 1 ? 4999 : def.trackLevel === 2 ? 9999 : 14999,
      },
    });

    await resetTrackContent(prisma, track.id);
    await seedTrackContent(prisma, track.id, def);

    if (options?.assignToUserId && def.slug === 'python-engineering-foundations') {
      await prisma.trackAssignment.upsert({
        where: { userId_trackId: { userId: options.assignToUserId, trackId: track.id } },
        update: { isActive: true },
        create: {
          userId: options.assignToUserId,
          trackId: track.id,
          assignedBy: options.assignedBy,
          isActive: true,
        },
      });
    }

    const moduleCount = await prisma.module.count({ where: { trackId: track.id } });
    const quizCount = await prisma.quiz.count({
      where: { subsection: { chapter: { module: { trackId: track.id } } } },
    });
    const questionCount = await prisma.quizQuestion.count({
      where: { quiz: { subsection: { chapter: { module: { trackId: track.id } } } } },
    });

    console.log(`  ✅ ${def.name}: ${moduleCount} weeks, ${quizCount} quizzes, ${questionCount} questions`);
  }

  // Default quiz platform settings
  await prisma.platformSetting.upsert({
    where: { key: 'quiz.defaults' },
    create: {
      key: 'quiz.defaults',
      value: {
        passingScore: 80,
        maxRetries: 3,
        cooldownMinutes: 60,
        timeLimitSeconds: 3600,
        randomizeQuestions: true,
        randomizeOptions: true,
        negativeMarking: false,
        requireFullscreen: false,
        lockNextModuleUntilPass: true,
        blockCapstoneUntilAllQuizzesPassed: true,
        blockCertificateUntilAllQuizzesPassed: true,
        questionDistribution: {
          mcq: 15,
          debugging: 10,
          outputPrediction: 10,
          scenario: 5,
          codeCompletion: 5,
          problemSolving: 5,
        },
      },
    },
    update: {
      value: {
        passingScore: 80,
        maxRetries: 3,
        cooldownMinutes: 60,
        timeLimitSeconds: 3600,
        randomizeQuestions: true,
        randomizeOptions: true,
        negativeMarking: false,
        requireFullscreen: false,
        lockNextModuleUntilPass: true,
        blockCapstoneUntilAllQuizzesPassed: true,
        blockCertificateUntilAllQuizzesPassed: true,
        questionDistribution: {
          mcq: 15,
          debugging: 10,
          outputPrediction: 10,
          scenario: 5,
          codeCompletion: 5,
          problemSolving: 5,
        },
      },
    },
  });

  console.log('📚 Master tracks seeded.');
}
