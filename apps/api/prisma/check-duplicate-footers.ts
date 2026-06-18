import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function countMatches(content: string, re: RegExp): number {
  return (content.match(re) ?? []).length;
}

function findDuplicateHeadings(content: string): Array<{ heading: string; count: number }> {
  const headings = content.match(/^## .+$/gm) ?? [];
  const counts = new Map<string, number>();
  for (const h of headings) {
    const norm = h.trim().toLowerCase();
    counts.set(norm, (counts.get(norm) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, c]) => c > 1)
    .map(([heading, count]) => ({ heading, count }));
}

async function main() {
  const lessons = await prisma.lesson.findMany({
    select: {
      content: true,
      subsection: {
        select: {
          title: true,
          contentType: true,
          chapter: {
            select: {
              module: {
                select: { track: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  });

  let dupBefore = 0;
  let dualChecklists = 0;
  let anyDupHeading = 0;

  for (const l of lessons) {
    const c = l.content ?? '';
    const track = l.subsection.chapter.module.track.name;
    const title = l.subsection.title;
    const type = l.subsection.contentType;

    const beforeCount = countMatches(c, /## Before you move on/gi);
    if (beforeCount > 1) {
      dupBefore++;
      console.log(`DUPLICATE FOOTER: ${track} | ${type} | ${title} (${beforeCount}x)`);
    }

    const revCount = countMatches(c, /## Revision checklist/gi);
    if (beforeCount >= 1 && revCount >= 1) {
      dualChecklists++;
      console.log(`DUAL CHECKLIST: ${track} | ${title}`);
    }

    const dups = findDuplicateHeadings(c);
    if (dups.length) {
      anyDupHeading++;
      console.log(`DUP HEADINGS: ${track} | ${type} | ${title}`);
      dups.forEach((d) => console.log(`  ${d.count}x ${d.heading}`));
    }
  }

  console.log('\n--- Summary ---');
  console.log('Total lessons:', lessons.length);
  console.log('Duplicate "Before you move on":', dupBefore);
  console.log('Both Revision checklist + Before you move on:', dualChecklists);
  console.log('Any duplicate ## heading:', anyDupHeading);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
