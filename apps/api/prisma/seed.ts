import { PrismaClient, AchievementType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedMasterTracks } from './master-tracks/track-seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Constel Nexus database...');

  const passwordHash = await bcrypt.hash('Demo@123', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@constel.ai' },
    update: {},
    create: {
      email: 'superadmin@constel.ai',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isVerified: true,
      xp: 0,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@constel.ai' },
    update: {},
    create: {
      email: 'admin@constel.ai',
      passwordHash,
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const college = await prisma.college.upsert({
    where: { code: 'CIT-CBE' },
    update: {},
    create: {
      name: 'Coimbatore Institute of Technology',
      code: 'CIT-CBE',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
    },
  });

  const dept = await prisma.department.upsert({
    where: { collegeId_code: { collegeId: college.id, code: 'CSE' } },
    update: {},
    create: { name: 'Computer Science', code: 'CSE', collegeId: college.id },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@demo.com' },
    update: {},
    create: {
      email: 'student@demo.com',
      passwordHash,
      firstName: 'Arjun',
      lastName: 'Kumar',
      role: 'STUDENT',
      isVerified: true,
      collegeId: college.id,
      departmentId: dept.id,
      year: 3,
      xp: 150,
      level: 2,
      streak: 3,
    },
  });

  const achievements = [
    { name: 'First Steps', description: 'Complete your first lesson', icon: '🎯', type: AchievementType.LESSON_COMPLETE, xpRequired: 0 },
    { name: 'Code Warrior', description: 'Complete 10 coding exercises', icon: '⚔️', type: AchievementType.PROJECT_COMPLETE, xpRequired: 250 },
    { name: 'Quiz Master', description: 'Score 100% on a weekly assessment', icon: '🏆', type: AchievementType.QUIZ_MASTER, xpRequired: 0 },
    { name: '7-Day Streak', description: 'Maintain a 7-day learning streak', icon: '🔥', type: AchievementType.STREAK, xpRequired: 0 },
    { name: 'Python Pioneer', description: 'Complete Python Engineering Foundations', icon: '🐍', type: AchievementType.TRACK_COMPLETE, xpRequired: 1000 },
    { name: 'XP Legend', description: 'Earn 5000 XP', icon: '⭐', type: AchievementType.XP_MILESTONE, xpRequired: 5000 },
  ];

  for (const ach of achievements) {
    const existing = await prisma.achievement.findFirst({ where: { name: ach.name } });
    if (!existing) {
      await prisma.achievement.create({ data: ach });
    }
  }

  await seedMasterTracks(prisma, {
    assignToUserId: student.id,
    assignedBy: admin.id,
  });

  const existingAnnouncement = await prisma.announcement.findFirst({
    where: { title: 'Welcome to Constel Nexus!' },
  });
  if (!existingAnnouncement) {
    await prisma.announcement.create({
      data: {
        title: 'Welcome to Constel Nexus!',
        content:
          'Welcome to the Constel Nexus Internship Program. Start with Python Engineering Foundations — Week 1 is now available. Pass each weekly assessment (80% minimum) to unlock the next week.',
        isActive: true,
      },
    });
  }

  const existingPayment = await prisma.payment.findFirst({ where: { providerId: 'pay_demo_001' } });
  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        collegeId: college.id,
        amount: 500000,
        status: 'COMPLETED',
        provider: 'razorpay',
        providerId: 'pay_demo_001',
      },
    });
  }

  console.log('✅ Seed completed!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Super Admin: superadmin@constel.ai / Demo@123');
  console.log('  Admin:       admin@constel.ai / Demo@123');
  console.log('  Student:     student@demo.com / Demo@123');
  console.log('\n📚 Master Tracks:');
  console.log('  1. Python Engineering Foundations (8 weeks, assigned to demo student)');
  console.log('  2. Full Stack Product Engineering (8 weeks, placeholder content)');
  console.log('  3. AI Engineering & Intelligent Systems (8 weeks, placeholder content)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
