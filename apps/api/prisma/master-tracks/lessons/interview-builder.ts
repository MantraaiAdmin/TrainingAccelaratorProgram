/** Assembles industry-grade interview prep markdown. */

export interface InterviewQA {
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Technical' | 'Behavioral' | 'System' | 'Coding' | 'HR';
  whatInterviewerWants: string;
  modelAnswer: string;
  followUps?: string[];
  standOutTip?: string;
  codeSnippet?: string;
}

export interface InterviewModuleSpec {
  topic: string;
  sessionGoal: string;
  roundTypes: string[];
  evaluationRubrics: Array<{ signal: string; detail: string }>;
  questions: InterviewQA[];
  unpredictablePlaybook: string[];
  convinceInterviewer: string[];
  redFlags: string[];
  mockDialogue: Array<{ speaker: 'Interviewer' | 'Candidate'; line: string }>;
  practicePlan: string[];
}

export function formatInterviewQA(q: InterviewQA, index: number): string {
  const parts: string[] = [
    `### Q${index + 1}. ${q.question}`,
    '',
    `| Field | Detail |`,
    `|-------|--------|`,
    `| **Difficulty** | ${q.difficulty} |`,
    `| **Type** | ${q.type} |`,
    '',
    `**What the interviewer is testing:** ${q.whatInterviewerWants}`,
    '',
    '**Model answer (aim for 60–90 seconds aloud):**',
    '',
    `> ${q.modelAnswer.split('\n').join('\n> ')}`,
  ];

  if (q.codeSnippet) {
    parts.push('', '**Code / example (if whiteboard or shared editor):**', '', '```', q.codeSnippet.trim(), '```');
  }

  if (q.followUps?.length) {
    parts.push('', '**Follow-up traps:**');
    q.followUps.forEach((f) => parts.push(`- ${f}`));
  }

  if (q.standOutTip) {
    parts.push('', `**How to stand out:** ${q.standOutTip}`);
  }

  return parts.join('\n');
}

export function buildInterviewLesson(
  spec: InterviewModuleSpec,
  trackName: string,
  weekTitle: string,
  weekNum: number,
): string {
  const parts: string[] = [
    `# Interview Preparation: ${spec.topic}`,
    '',
    `> **${trackName}** · Week ${weekNum}: ${weekTitle}`,
    '',
    '## Session goal',
    '',
    spec.sessionGoal,
    '',
    '---',
    '',
    '## What interviewers actually evaluate',
    '',
    '| Signal | What "good" looks like |',
    '|--------|------------------------|',
    ...spec.evaluationRubrics.map((r) => `| **${r.signal}** | ${r.detail} |`),
    '',
    '---',
    '',
    '## Interview rounds you will face',
    '',
    ...spec.roundTypes.map((r, i) => `${i + 1}. ${r}`),
    '',
    '---',
    '',
    '## Industry questions with model answers',
    '',
    'Practice **out loud**. Record yourself. If you cannot explain without reading, you are not ready.',
    '',
    ...spec.questions.flatMap((q, i) => [formatInterviewQA(q, i), '', '---', '']),
    '',
    '## Handling unpredictable questions (CLARIFY method)',
    '',
    'When you get a question you did not prepare for, do **not** panic or guess blindly. Use **CLARIFY**:',
    '',
    ...spec.unpredictablePlaybook.map((step, i) => `${i + 1}. ${step}`),
    '',
    '**Script when stuck:** *"I have not worked with that exact scenario, but here is how I would approach it systematically…"* — then apply CLARIFY. Honesty + structured thinking beats faking expertise.',
    '',
    '---',
    '',
    '## How to convince the interviewer (trust signals)',
    '',
    'Interviewers hire candidates they **trust** to ship safely. Show these signals:',
    '',
    ...spec.convinceInterviewer.map((tip, i) => `${i + 1}. ${tip}`),
    '',
    '---',
    '',
    '## Live mock dialogue (study the rhythm)',
    '',
    ...spec.mockDialogue.map((d) => `**${d.speaker}:** ${d.line}`),
    '',
    '---',
    '',
    '## Red flags — instant rejection patterns',
    '',
    ...spec.redFlags.map((f, i) => `${i + 1}. ${f}`),
    '',
    '---',
    '',
    '## 30-minute practice plan (do this today)',
    '',
    ...spec.practicePlan.map((p, i) => `${i + 1}. ${p}`),
    '',
    '---',
    '',
    '## Answer frameworks (quick reference)',
    '',
    '**Technical (IDE):** Input → Design → Execute (think aloud before coding)',
    '',
    '**Behavioral (STAR):** Situation → Task → Action → Result (use numbers: "reduced bugs by 40%")',
    '',
    '**System design (RESO):** Requirements → Estimation → Storage/API → Optimization → trade-offs',
    '',
    `**Week ${weekNum} link:** Re-read *${weekTitle}* lessons before mock — interview questions map directly to this week's topics and quiz.`,
  ];

  return parts.join('\n');
}
