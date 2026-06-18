/**
 * Adds internship-depth layers (CLI, industry scenarios, walkthroughs) to every topic.
 * Makes 8 intensive weeks feel like 6 months of structured learning.
 */
import {
  TopicKnowledge,
  CliCommand,
  IndustryExample,
  WalkthroughStep,
} from '../lesson-builder';

const TOPIC_CLI: Record<string, CliCommand[]> = {
  'linux basics': [
    { command: 'pwd', whereUsed: 'SSH into any cloud server', explanation: 'Print current directory — first command after login.' },
    { command: 'ls -lah', whereUsed: 'Debugging deploy folders', explanation: 'List all files with human-readable sizes and permissions.' },
    { command: 'cd /var/log && sudo tail -50 syslog', whereUsed: 'Production incident response', explanation: 'Read recent system logs when app fails.' },
    { command: 'df -h', whereUsed: 'Disk-full alerts', explanation: 'Check disk usage — full disks crash databases.' },
    { command: 'top', whereUsed: 'CPU spike investigation', explanation: 'Live view of processes consuming CPU/memory.' },
  ],
  'terminal usage': [
    { command: 'history | grep git', whereUsed: 'Recall forgotten commands', explanation: 'Search command history.' },
    { command: 'cat file.log | grep ERROR | wc -l', whereUsed: 'Count errors in logs', explanation: 'Pipe output between commands.' },
    { command: 'export APP_ENV=development', whereUsed: 'Before running app locally', explanation: 'Set env var for child processes.' },
    { command: 'chmod +x deploy.sh && ./deploy.sh', whereUsed: 'CI/CD scripts', explanation: 'Make script executable then run.' },
  ],
  'git & github': [
    { command: 'git status', whereUsed: 'Before every commit', explanation: 'See staged/unstaged changes.' },
    { command: 'git checkout -b feature/auth', whereUsed: 'Starting new task', explanation: 'Create and switch to feature branch.' },
    { command: 'git log --oneline -10', whereUsed: 'Code review / debugging', explanation: 'Recent commit history compact.' },
    { command: 'git diff main', whereUsed: 'Before opening PR', explanation: 'See all changes vs main branch.' },
    { command: 'git pull --rebase origin main', whereUsed: 'Daily team sync', explanation: 'Update branch with latest main cleanly.' },
  ],
  variables: [
    { command: 'python3 -c "x=42; print(id(x), type(x))"', whereUsed: 'Debugging reference bugs', explanation: 'Inspect object identity and type in one line.' },
    { command: 'python3 variables_lab.py', whereUsed: 'Local lab execution', explanation: 'Run script that exercises assignment patterns.' },
  ],
  loops: [
    { command: 'python3 -m trace --count loops.py', whereUsed: 'Performance debugging', explanation: 'See how many times each line runs.' },
    { command: 'time python3 process_data.py', whereUsed: 'Compare loop optimizations', explanation: 'Measure wall-clock runtime.' },
  ],
  'rest apis': [
    { command: 'curl -s https://httpbin.org/get | jq', whereUsed: 'API smoke testing', explanation: 'GET request + pretty JSON.' },
    { command: 'curl -X POST -H "Content-Type: application/json" -d \'{"name":"Arjun"}\' http://localhost:4000/users', whereUsed: 'Local API dev', explanation: 'Test POST endpoint from terminal.' },
    { command: 'curl -i http://localhost:4000/health', whereUsed: 'Deploy verification', explanation: 'Show response headers + status code.' },
  ],
  docker: [
    { command: 'docker build -t myapp:dev .', whereUsed: 'CI pipeline / local', explanation: 'Build image from Dockerfile.' },
    { command: 'docker compose up -d', whereUsed: 'Full stack local dev', explanation: 'Start all services detached.' },
    { command: 'docker logs -f api --tail 100', whereUsed: 'Debug container crash', explanation: 'Follow live container logs.' },
    { command: 'docker ps', whereUsed: 'Verify deploy', explanation: 'List running containers.' },
  ],
  postgresql: [
    { command: 'psql $DATABASE_URL', whereUsed: 'DB debugging', explanation: 'Connect to Postgres interactively.' },
    { command: '\\dt', whereUsed: 'Inside psql', explanation: 'List all tables.' },
    { command: 'EXPLAIN ANALYZE SELECT * FROM users WHERE email = $1;', whereUsed: 'Slow query tuning', explanation: 'Show query plan and cost.' },
  ],
  transformers: [
    { command: 'python3 -c "import tiktoken; print(len(tiktoken.encoding_for_model(\'gpt-4o-mini\').encode(\'Hello\')))"', whereUsed: 'Cost estimation', explanation: 'Count tokens before API call.' },
    { command: 'curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"', whereUsed: 'Verify API key', explanation: 'List available models.' },
  ],
  fastapi: [
    { command: 'uvicorn main:app --reload --port 8000', whereUsed: 'Local AI backend dev', explanation: 'Hot-reload ASGI server.' },
    { command: 'curl http://localhost:8000/docs', whereUsed: 'Open Swagger UI', explanation: 'Interactive API documentation.' },
  ],
};

function cliForTopic(topic: string, trackSlug: string): CliCommand[] {
  const key = topic.toLowerCase().trim();
  if (TOPIC_CLI[key]) return TOPIC_CLI[key];

  const defaults: Record<string, CliCommand[]> = {
    'python-engineering-foundations': [
      { command: `python3 -c "print('${topic}: ok')"`, whereUsed: 'Verify Python env', explanation: 'Quick sanity check that interpreter works.' },
      { command: 'python3 -m pytest tests/ -v', whereUsed: 'After implementing feature', explanation: 'Run automated tests with verbose output.' },
      { command: 'pip install -r requirements.txt', whereUsed: 'Project setup / CI', explanation: 'Install pinned dependencies.' },
    ],
    'full-stack-product-engineering': [
      { command: 'npm run dev', whereUsed: 'Local frontend dev', explanation: 'Start Next.js dev server with hot reload.' },
      { command: 'npm run test', whereUsed: 'Pre-commit check', explanation: 'Run unit/integration tests.' },
      { command: 'npx prisma migrate dev', whereUsed: 'Schema change workflow', explanation: 'Apply DB migrations in development.' },
    ],
    'ai-engineering-intelligent-systems': [
      { command: 'python3 -m venv .venv && source .venv/bin/activate', whereUsed: 'AI project setup', explanation: 'Isolated Python env for ML/API libs.' },
      { command: 'curl -N http://localhost:8000/chat/stream', whereUsed: 'Test streaming endpoint', explanation: 'Verify SSE/streaming AI response.' },
      { command: 'pip install openai langchain chromadb', whereUsed: 'RAG project bootstrap', explanation: 'Install common AI stack packages.' },
    ],
  };

  return defaults[trackSlug] ?? defaults['python-engineering-foundations'];
}

function industryFor(topic: string, trackSlug: string): IndustryExample[] {
  const t = topic;
  const track =
    trackSlug.includes('full-stack') ? 'product engineering team'
      : trackSlug.includes('ai') ? 'AI platform team'
        : 'backend / automation team';

  return [
    {
      scenario: `Daily standup — discussing ${t}`,
      detail: `A senior on your ${track} mentions a bug related to **${t}**. You must explain what it is, how your module uses it, and what you would check first. This lesson gives you that vocabulary.`,
    },
    {
      scenario: `Week 2 of internship — feature ticket`,
      detail: `Your ticket: "Implement X using ${t}." You read the lesson, run the CLI commands, copy the Example 2 pattern, open a PR. Reviewer comments reference the same concepts — you are prepared.`,
    },
    {
      scenario: `Production incident at 2 AM`,
      detail: `On-call runbook says: verify ${t} configuration, check logs, rollback if needed. Engineers who skipped fundamentals panic; engineers who practiced these commands fix issues in minutes.`,
    },
    {
      scenario: `Technical interview screening`,
      detail: `Interviewer: "Tell me about ${t} in a project." You answer with definition + CLI/tool you used + trade-off. That structure comes from the practice section at the end of this lesson.`,
    },
  ];
}

function walkthroughFor(topic: string, trackSlug: string): WalkthroughStep[] {
  const lang = trackSlug.includes('full-stack') ? 'TypeScript/React' : 'Python';
  return [
    { step: 'Open your terminal and project folder', detail: 'Create `~/constel-labs/week-N/` if you do not have a lab folder. Consistency builds habit.' },
    { step: 'Run the CLI commands from this lesson', detail: 'Copy each command exactly. If one fails, read the error — that is learning. Fix PATH/permissions before moving on.' },
    { step: 'Create a file for this topic', detail: `Make \`${topic.toLowerCase().replace(/\s+/g, '_')}_demo.${lang === 'Python' ? 'py' : 'tsx'}\` and implement Example 1 from scratch without looking.` },
    { step: 'Break it on purpose', detail: 'Change one line to cause an error. Read the traceback. This trains debugging for interviews and production.' },
    { step: 'Implement Example 2 with a twist', detail: 'Add your own input: different data, edge case (empty string, zero, null). Handle it cleanly.' },
    { step: 'Explain aloud', detail: `Pretend a junior asks: "What is ${topic}?" Record a 90-second explanation on your phone.` },
    { step: 'Commit to Git', detail: '`git add . && git commit -m "lab: ' + topic + '"` — build portfolio history week by week.' },
    { step: 'Self-quiz', detail: 'Close the lesson. Answer all practice questions from memory. Re-read only what you missed.' },
  ];
}

function extraSections(topic: string, trackSlug: string): TopicKnowledge['sections'] {
  const weekFocus =
    trackSlug.includes('ai') ? 'building intelligent features with LLMs, RAG, and agents'
      : trackSlug.includes('full-stack') ? 'shipping full-stack product features end-to-end'
        : 'writing reliable Python systems and automation';

  return [
    {
      heading: 'Deep Dive — How It Actually Works',
      content: `**${topic}** is not a checkbox topic — it is a skill you reuse across months of work.

1. **Mental model** — Draw a diagram (paper or Excalidraw): inputs → ${topic} → outputs.
2. **Internals** — What data structures, network calls, or OS resources are involved?
3. **Edge cases** — Empty input, null, timeout, permission denied, rate limit.
4. **Trade-offs** — Faster vs simpler vs more maintainable — pick consciously.
5. **Connection** — How does this link to last week's topic and next week's lab?

In a 6-month internship arc, you would revisit **${topic}** in week 1 (learn), week 8 (apply in feature), week 16 (optimize), and week 24 (design systems around it). This 8-week track compresses that arc — you must **practice**, not skim.`,
    },
    {
      heading: 'Three Usage Patterns (Beginner → Production)',
      content: `| Level | What you do | Example for ${topic} |
|-------|-------------|------------------------|
| **Level 1 — Read & run** | Follow this lesson verbatim | Run CLI + Example 1 |
| **Level 2 — Modify** | Change inputs, add validation | Example 2 + your edge cases |
| **Level 3 — Integrate** | Use in mini-project / capstone | Combine with 2 other week topics in one script/service |

**Goal:** By end of week, you are at Level 2 minimum. Capstone weeks require Level 3.`,
    },
    {
      heading: 'Connection to Your Track',
      content: `This topic supports **${weekFocus}**. In your weekly lab, assignment, and 50-question assessment, expect direct questions on **${topic}** — conceptual, output prediction, debugging, and scenario-based.`,
    },
  ];
}

function extraExamples(topic: string, trackSlug: string, existing?: TopicKnowledge['codeExamples']): TopicKnowledge['codeExamples'] {
  const lang = trackSlug.includes('full-stack') ? 'typescript' : 'python';
  const extras =
    lang === 'typescript'
      ? [
          { lang: 'typescript', caption: 'Example 2 — Validation layer', code: `// ${topic}: validate before processing\nfunction validate(input: unknown): string {\n  if (typeof input !== "string" || !input.trim()) {\n    throw new Error("Invalid input for ${topic}");\n  }\n  return input.trim();\n}\n\nfunction process(data: string): { topic: string; status: string; length: number } {\n  return { topic: "${topic}", status: "ok", length: data.length };\n}\n\nconsole.log(process(validate("  Constel Nexus  ")));` },
          { lang: 'typescript', caption: 'Example 3 — Integration stub', code: `// ${topic} in a service module\nexport async function run${topic.replace(/\W+/g, '')}Task(payload: Record<string, unknown>) {\n  const validated = validatePayload(payload);\n  const result = await executeCore(validated);\n  return { success: true, data: result, timestamp: new Date().toISOString() };\n}` },
        ]
      : [
          { lang: 'python', caption: 'Example 2 — With validation & errors', code: `# ${topic} — production-style structure\ndef validate(data):\n    if data is None or (isinstance(data, str) and not data.strip()):\n        raise ValueError("input required for ${topic}")\n    return data\n\ndef process(data):\n    data = validate(data)\n    return {"topic": "${topic}", "status": "ok", "len": len(str(data))}\n\nif __name__ == "__main__":\n    print(process("Constel internship lab"))` },
          { lang: 'python', caption: 'Example 3 — File + CLI entry point', code: `#!/usr/bin/env python3\n"""${topic} — runnable lab module."""\nimport argparse\n\ndef main():\n    parser = argparse.ArgumentParser(description="${topic} lab")\n    parser.add_argument("--input", default="demo", help="Input data")\n    args = parser.parse_args()\n    result = process(validate(args.input))\n    print(result)\n\nif __name__ == "__main__":\n    main()` },
        ];

  return [...(existing ?? []), ...extras];
}

function extraPractice(topic: string): TopicKnowledge['practice'] {
  return [
    { question: `Explain ${topic} to a non-technical product manager in 2 sentences.`, answer: 'Plain definition + one business benefit — no jargon.' },
    { question: `What is the first CLI command you would run when debugging ${topic}?`, answer: 'Refer to the Command Line section — justify why that command gives useful signal.' },
    { question: `Name one edge case for ${topic} and how to handle it.`, answer: 'Empty/null/timeout/permission — specific handling, not "check errors".' },
  ];
}

/** Merge base knowledge with depth layers — every lesson gets 6-month program feel. */
export function enrichTopicKnowledge(
  topic: string,
  trackSlug: string,
  base: TopicKnowledge,
): TopicKnowledge {
  return {
    ...base,
    sections: [...base.sections, ...extraSections(topic, trackSlug)],
    cliCommands: base.cliCommands?.length ? base.cliCommands : cliForTopic(topic, trackSlug),
    industryExamples: base.industryExamples?.length ? base.industryExamples : industryFor(topic, trackSlug),
    walkthrough: base.walkthrough?.length ? base.walkthrough : walkthroughFor(topic, trackSlug),
    codeExamples: extraExamples(topic, trackSlug, base.codeExamples),
    practice: [...base.practice, ...extraPractice(topic)],
    cheatSheet: [
      ...base.cheatSheet,
      `CLI: run all commands in "${topic}" lesson`,
      'Level 1 → 2 → 3 progression before quiz',
      'Explain one industry scenario aloud',
    ],
  };
}
