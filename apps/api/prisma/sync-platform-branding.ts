/**
 * Updates platform branding in the database without wiping curriculum or progress.
 * Run: npx ts-node prisma/sync-platform-branding.ts
 */
import { PrismaClient } from '@prisma/client';
import { APP_CONFIG } from '@constel/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Syncing Mantra.ai platform branding...\n');

  const welcomeRows = await prisma.announcement.findMany({
    where: {
      OR: [
        { title: { contains: 'Constel', mode: 'insensitive' } },
        { content: { contains: 'Constel', mode: 'insensitive' } },
        { title: { in: ['Welcome to Constel Nexus!', 'Welcome to Mantra.ai!'] } },
      ],
    },
  });

  for (const row of welcomeRows) {
    await prisma.announcement.update({
      where: { id: row.id },
      data: {
        title: 'Welcome to Mantra.ai!',
        content:
          `Welcome to the ${APP_CONFIG.programName}. Start with Foundation Track: Python, Data & AI — Week 1 is now available. Pass each weekly assessment (80% minimum) to unlock the next week.`,
      },
    });
  }
  if (welcomeRows.length > 0) {
    console.log(`  ✅ Updated ${welcomeRows.length} announcement(s) to Mantra.ai branding`);
  } else {
    await prisma.announcement.create({
      data: {
        title: 'Welcome to Mantra.ai!',
        content:
          `Welcome to the ${APP_CONFIG.programName}. Start with Foundation Track: Python, Data & AI — Week 1 is now available. Pass each weekly assessment (80% minimum) to unlock the next week.`,
        isActive: true,
      },
    });
    console.log('  ✅ Welcome announcement created');
  }

  const certUpdate = await prisma.certificate.updateMany({
    where: { programName: { contains: 'Constel' } },
    data: { programName: APP_CONFIG.name },
  });
  if (certUpdate.count > 0) {
    console.log(`  ✅ Updated ${certUpdate.count} certificate(s) to ${APP_CONFIG.name}`);
  }

  await prisma.platformSetting.upsert({
    where: { key: 'branding' },
    create: {
      key: 'branding',
      value: {
        name: APP_CONFIG.name,
        company: APP_CONFIG.company,
        programName: APP_CONFIG.programName,
        tagline: APP_CONFIG.tagline,
        aiAssistantName: APP_CONFIG.aiAssistantName,
        aiTagline: APP_CONFIG.aiTagline,
      },
    },
    update: {
      value: {
        name: APP_CONFIG.name,
        company: APP_CONFIG.company,
        programName: APP_CONFIG.programName,
        tagline: APP_CONFIG.tagline,
        aiAssistantName: APP_CONFIG.aiAssistantName,
        aiTagline: APP_CONFIG.aiTagline,
      },
    },
  });
  console.log('  ✅ Platform branding settings saved');

  console.log('\n🎨 Branding sync complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
