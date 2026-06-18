/**
 * Removes duplicate trailing checklist / footer sections from lesson markdown.
 */
const BEFORE_HEADING = /^## Before you move on\s*$/gim;
const REVISION_HEADING = /^## Revision [Cc]hecklist\s*$/gim;

function extractSection(content: string, headingRe: RegExp): { before: string; section: string | null } {
  const match = headingRe.exec(content);
  headingRe.lastIndex = 0;
  if (!match || match.index === undefined) {
    return { before: content.trimEnd(), section: null };
  }
  return {
    before: content.slice(0, match.index).trimEnd(),
    section: content.slice(match.index).trim(),
  };
}

function parseBulletItems(section: string): string[] {
  const items: string[] = [];
  for (const line of section.split('\n')) {
    const m = line.match(/^- \[ \] (.+)$/);
    if (m) items.push(m[1].trim());
  }
  return items;
}

function formatBeforeYouMoveOn(items: string[]): string {
  const unique = [...new Set(items)];
  return `---\n\n## Before you move on\n\n${unique.map((i) => `- [ ] ${i}`).join('\n')}`;
}

/** Collapse repeated "Before you move on" and merge "Revision checklist" into one footer. */
export function dedupeLessonMarkdown(content: string): string {
  let body = content.trimEnd();

  const revision = extractSection(body, REVISION_HEADING);
  body = revision.before;
  const revisionItems = revision.section ? parseBulletItems(revision.section) : [];

  const beforeParts: string[] = [];
  let rest = body;
  let match: RegExpExecArray | null;

  while ((match = BEFORE_HEADING.exec(rest)) !== null) {
    if (match.index === undefined) break;
    beforeParts.push(rest.slice(match.index).trim());
    rest = rest.slice(0, match.index).trimEnd();
    BEFORE_HEADING.lastIndex = 0;
  }

  const allItems = [...revisionItems];
  for (const part of beforeParts.reverse()) {
    allItems.push(...parseBulletItems(part));
  }

  if (allItems.length === 0) {
    return revision.before + (revision.section ? `\n\n${revision.section}` : '');
  }

  return `${rest}\n\n${formatBeforeYouMoveOn(allItems)}`.trimEnd();
}

/** Ensure exactly one footer; append if missing. */
export function ensureLessonFooter(content: string, footerMarkdown: string): string {
  const deduped = dedupeLessonMarkdown(content);
  if (/## Before you move on/i.test(deduped)) {
    return deduped;
  }
  const footer = footerMarkdown.trimStart().startsWith('---')
    ? footerMarkdown.trimStart()
    : `---\n\n${footerMarkdown.trimStart()}`;
  return `${deduped.trimEnd()}\n\n${footer}`.trimEnd();
}
