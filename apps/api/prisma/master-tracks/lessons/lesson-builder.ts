/** Assembles structured topic knowledge into rich, internship-depth markdown lessons. */

export interface CliCommand {
  command: string;
  whereUsed: string;
  explanation: string;
}

export interface IndustryExample {
  scenario: string;
  detail: string;
}

export interface WalkthroughStep {
  step: string;
  detail: string;
}

export interface TopicKnowledge {
  definition: string;
  memoryTrick?: string;
  whyMatters: Array<{ reason: string; detail: string }>;
  sections: Array<{ heading: string; content: string }>;
  codeExamples?: Array<{ lang: string; code: string; caption?: string }>;
  comparisonTable?: { headers: string[]; rows: string[][] };
  cliCommands?: CliCommand[];
  industryExamples?: IndustryExample[];
  walkthrough?: WalkthroughStep[];
  pitfalls: string[];
  practice: Array<{ question: string; code?: string; answer: string }>;
  cheatSheet: string[];
}

export function codeBlock(lang: string, body: string): string {
  return '```' + lang + '\n' + body.trim() + '\n```';
}

export function buildRichLesson(topic: string, knowledge: TopicKnowledge): string {
  const parts: string[] = [];

  parts.push(`## What is ${topic}?\n\n${knowledge.definition}`);
  if (knowledge.memoryTrick) {
    parts.push(`> **Memory trick:** ${knowledge.memoryTrick}`);
  }

  if (knowledge.whyMatters.length > 0) {
    parts.push('---\n\n## Why This Matters in Engineering\n');
    parts.push('| Reason | What it means for you |');
    parts.push('|--------|------------------------|');
    for (const row of knowledge.whyMatters) {
      parts.push(`| **${row.reason}** | ${row.detail} |`);
    }
  }

  for (const section of knowledge.sections) {
    parts.push(`---\n\n## ${section.heading}\n\n${section.content.trim()}`);
  }

  if (knowledge.comparisonTable) {
    parts.push('---\n\n## Quick Comparison\n');
    parts.push(`| ${knowledge.comparisonTable.headers.join(' | ')} |`);
    parts.push(`| ${knowledge.comparisonTable.headers.map(() => '---').join(' | ')} |`);
    for (const row of knowledge.comparisonTable.rows) {
      parts.push(`| ${row.join(' | ')} |`);
    }
  }

  if (knowledge.cliCommands && knowledge.cliCommands.length > 0) {
    parts.push('---\n\n## Command Line — Run It Yourself\n');
    parts.push('Every concept below maps to commands you will run in internships, labs, and on production servers.\n');
    parts.push('| Command | Where it is used | What it does |');
    parts.push('|---------|------------------|--------------|');
    for (const cli of knowledge.cliCommands) {
      parts.push(`| \`${cli.command}\` | ${cli.whereUsed} | ${cli.explanation} |`);
    }
    parts.push('\n### Try this sequence in your terminal\n');
    parts.push(codeBlock('bash', knowledge.cliCommands.map((c) => `# ${c.whereUsed}\n${c.command}`).join('\n\n')));
  }

  if (knowledge.industryExamples && knowledge.industryExamples.length > 0) {
    parts.push('---\n\n## Where Engineers Use This (Real Scenarios)\n');
    knowledge.industryExamples.forEach((ex, i) => {
      parts.push(`### ${i + 1}. ${ex.scenario}\n\n${ex.detail}`);
    });
  }

  if (knowledge.walkthrough && knowledge.walkthrough.length > 0) {
    parts.push('---\n\n## Hands-On Walkthrough (Step by Step)\n');
    knowledge.walkthrough.forEach((w, i) => {
      parts.push(`**Step ${i + 1}: ${w.step}**\n\n${w.detail}`);
    });
  }

  if (knowledge.codeExamples && knowledge.codeExamples.length > 0) {
    parts.push('---\n\n## Code Examples (Progressive Difficulty)\n');
    for (const ex of knowledge.codeExamples) {
      if (ex.caption) parts.push(`### ${ex.caption}\n`);
      parts.push(codeBlock(ex.lang, ex.code));
    }
  }

  if (knowledge.pitfalls.length > 0) {
    parts.push('---\n\n## Common Mistakes (Avoid These)\n');
    knowledge.pitfalls.forEach((p, i) => parts.push(`${i + 1}. ${p}`));
  }

  if (knowledge.cheatSheet.length > 0) {
    parts.push('---\n\n## One-Page Cheat Sheet (Memorize Before Quiz)\n');
    parts.push(codeBlock('text', knowledge.cheatSheet.join('\n')));
  }

  if (knowledge.practice.length > 0) {
    parts.push('---\n\n## Practice Questions\n');
    knowledge.practice.forEach((p, i) => {
      parts.push(`**Q${i + 1}.** ${p.question}\n`);
      if (p.code) parts.push(codeBlock('python', p.code));
      parts.push(`> **Answer:** ${p.answer}\n`);
    });
  }

  return parts.join('\n\n');
}
