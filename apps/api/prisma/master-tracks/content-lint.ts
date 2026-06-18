import { MASTER_TRACKS } from './tracks';
import { generateDetailedLesson, generateInterviewLesson } from './lesson-content';

function findDuplicateHeadings(content: string): string[] {
  const headings = content.match(/^## .+$/gm) ?? [];
  const counts = new Map<string, number>();
  for (const h of headings) {
    const norm = h.trim().toLowerCase();
    counts.set(norm, (counts.get(norm) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, c]) => c > 1).map(([h, c]) => `${c}x ${h}`);
}

function stripDuplicateBeforeYouMoveOn(content: string): string {
  const heading = /^## Before you move on\s*$/gim;
  const parts = content.split(heading);
  if (parts.length <= 2) return content;
  const first = parts[0].trimEnd();
  const lastSection = parts[parts.length - 1].trim();
  return `${first}\n\n---\n\n## Before you move on\n\n${lastSection}`;
}

let issues = 0;
for (const track of MASTER_TRACKS) {
  for (const week of track.weeks) {
    for (const topic of week.topics) {
      const content = generateDetailedLesson(topic, track.name, track.slug, week.title, week.week);
      const dups = findDuplicateHeadings(content);
      if (dups.length) {
        issues++;
        console.log(`${track.slug} W${week.week} LESSON "${topic}":`, dups.join(', '));
      }
    }
    for (const topic of week.interviewPrep) {
      const content = generateInterviewLesson(topic, track.name, track.slug, week.title, week.week);
      const dups = findDuplicateHeadings(content);
      if (dups.length) {
        issues++;
        console.log(`${track.slug} W${week.week} INTERVIEW "${topic}":`, dups.join(', '));
      }
    }
  }
}
console.log('Generator duplicate heading issues:', issues);

// test stripper
const bad = '## Before you move on\n\n- a\n\n---\n\n## Before you move on\n\n- b';
console.log('Strip test:', findDuplicateHeadings(stripDuplicateBeforeYouMoveOn(bad)).length === 0 ? 'ok' : 'fail');

export { stripDuplicateBeforeYouMoveOn, findDuplicateHeadings };
