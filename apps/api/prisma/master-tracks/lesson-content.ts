/**
 * Generates in-depth lesson markdown for each curriculum topic.
 */

import { PYTHON_WEEK2_LESSONS } from './lessons/python-week2';
import { buildRichLesson } from './lessons/lesson-builder';
import { getTopicKnowledge } from './lessons/knowledge';
import { ensureLessonFooter } from './content-utils';
import { buildInterviewLesson } from './lessons/interview-builder';
import { getInterviewSpec } from './lessons/interview-banks';
import { injectLessonVisuals } from './lessons/knowledge/visual-enricher';

const CODE = (lang: string, body: string) => `\`\`\`${lang}\n${body}\n\`\`\``;

function sections(blocks: Array<[string, string]>): string {
  return blocks.map(([heading, body]) => `## ${heading}\n\n${body.trim()}`).join('\n\n');
}

/** Full curated lessons — no generic filler appended */
const CURATED_LESSONS: Record<string, string> = {
  ...PYTHON_WEEK2_LESSONS,
};

function lessonFooter(weekNum: number): string {
  return `---

## Before you move on

- [ ] Read every section and run the code examples yourself
- [ ] Ran every CLI command above in your own terminal
- [ ] Typed and executed all code examples — did not just read
- [ ] Complete the **Practice Questions** without peeking
- [ ] Can explain one industry scenario out loud in 60 seconds
- [ ] Do the related **lab** for this week
- [ ] Use the **AI Assistant** on lessons and labs if any concept is unclear (not available during quizzes)
- [ ] Pass the **Weekly Assessment** (80% required)

*Week ${weekNum} labs → then weekly evaluation.*
`;
}

/** Topic-specific deep dives (matched by lowercase keyword in title) */
const TOPIC_DEEP_DIVES: Record<string, (track: string, week: string) => string> = {
  'linux basics': (_, week) => sections([
    ['What is Linux?', `Linux is an open-source Unix-like operating system kernel that powers most cloud servers, Android devices, and developer machines. As an engineer, you interact with Linux daily through terminals, SSH sessions, Docker containers, and CI/CD pipelines.

Understanding Linux is not optional for backend and DevOps roles — it is the default production environment.`],
    ['Core concepts', `- **Kernel vs shell**: The kernel manages hardware; the shell (bash/zsh) is your command interface
- **Filesystem hierarchy**: \`/home\`, \`/etc\`, \`/var\`, \`/tmp\`, \`/usr\` — know where configs, logs, and binaries live
- **Permissions**: \`rwx\` for user/group/others; \`chmod\`, \`chown\`
- **Processes**: Every running program is a process with a PID; use \`ps\`, \`top\`, \`kill\`
- **Users & sudo**: Least-privilege access; never develop as root`],
    ['Essential commands', CODE('bash', `# Navigation & files
pwd                    # print working directory
ls -la                 # list all files with details
cd /path/to/dir        # change directory
mkdir -p projects/app  # create nested folders
cp -r src dest         # copy recursively
mv old new             # move/rename
rm -rf folder          # delete (careful!)

# Viewing files
cat file.txt           # print entire file
less file.log          # paginated view
head -n 20 file.log    # first 20 lines
tail -f app.log        # follow live logs

# Search
grep -r "error" ./logs # recursive search
find . -name "*.py"    # find files by name`)],
    ['Production mindset', `In internships and jobs you will:
1. SSH into staging/production servers
2. Read application logs under \`/var/log\`
3. Debug permission issues on deployed files
4. Run scripts via cron or systemd

**Practice:** Open a terminal and create a project folder structure: \`~/engineering/workspace/{src,tests,docs}\`.`],
  ]),

  'git & github': (_, week) => sections([
    ['Why Git matters', `Git is the industry-standard version control system. Every engineering team uses it for:
- Tracking every code change with history
- Collaborating via branches and pull requests
- Rolling back broken deployments
- Code review before merge to main

If you cannot use Git confidently, you cannot work on a real product team.`],
    ['Core workflow', CODE('bash', `# Initial setup
git config --global user.name "Your Name"
git config --global user.email "you@college.edu"

# Daily workflow
git clone https://github.com/org/repo.git
git checkout -b feature/login-page
# ... edit files ...
git add .
git commit -m "feat: add login form validation"
git push origin feature/login-page
# Open Pull Request on GitHub`)],
    ['Branching strategy', `- **main/master**: production-ready code only
- **develop**: integration branch (optional)
- **feature/***: one branch per task
- **hotfix/***: urgent production fixes

Never commit secrets (.env, API keys) — use \`.gitignore\`.`],
    ['Pull requests & code review', `A good PR includes:
1. Clear title: \`feat:\`, \`fix:\`, \`docs:\` prefix
2. Description of *what* and *why*
3. Screenshots for UI changes
4. Linked issue/ticket number

Reviewers check: correctness, readability, tests, security.`],
  ]),

  'vs code mastery': (_, week) => sections([
    ['Why VS Code', `Visual Studio Code is the most popular editor in industry because of:
- Fast performance and rich extension ecosystem
- Integrated terminal, Git, and debugger
- Python, TypeScript, and Docker support
- Remote SSH and Dev Containers for cloud development`],
    ['Essential setup', `- Install **Python** extension (Microsoft)
- Install **Pylance** for IntelliSense and type checking
- Install **GitLens** for blame/history inline
- Enable **Format on Save** with Black or Prettier
- Set tab size to 4 spaces for Python, 2 for web`],
    ['Productivity shortcuts', `| Action | macOS | Windows |
|--------|-------|---------|
| Command palette | Cmd+Shift+P | Ctrl+Shift+P |
| Quick open file | Cmd+P | Ctrl+P |
| Toggle terminal | Ctrl+\` | Ctrl+\` |
| Multi-cursor | Option+Click | Alt+Click |
| Go to definition | F12 | F12 |
| Rename symbol | F2 | F2 |`],
    ['Debugging Python', CODE('json', `// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [{
    "name": "Python: Current File",
    "type": "debugpy",
    "request": "launch",
    "program": "\${file}",
    "console": "integratedTerminal"
  }]
}`)],
  ]),

  'loops': (_, week) => sections([
    ['Loop fundamentals', `Loops automate repetition. Choose the right loop:
- **for**: known iterations (lists, ranges, files)
- **while**: unknown iterations until condition false

Avoid infinite loops — always ensure the condition eventually becomes false.`],
    ['Patterns', CODE('python', `# for with range
for i in range(5):        # 0,1,2,3,4
    print(i)

# enumerate — index + value
for idx, item in enumerate(["a", "b", "c"]):
    print(idx, item)

# while with guard
count = 0
while count < 3:
    count += 1

# break / continue
for n in range(10):
    if n == 5:
        break      # exit loop
    if n % 2 == 0:
        continue   # skip even numbers
    print(n)`)],
    ['Complexity awareness', `Nested loops often mean **O(n²)** time. For large inputs, consider:
- Hash maps for O(1) lookups
- Single-pass algorithms
- Built-in functions (\`sum\`, \`any\`, \`all\`) implemented in C`],
  ]),

  'functions': (_, week) => sections([
    ['Functions as building blocks', `Functions encapsulate logic, enable reuse, and make code testable. Production codebases are collections of small, focused functions — not thousand-line scripts.`],
    ['Design principles', CODE('python', `def calculate_discount(price: float, pct: float) -> float:
    """Return discounted price. Raises ValueError if pct invalid."""
    if not 0 <= pct <= 100:
        raise ValueError("pct must be 0-100")
    return price * (1 - pct / 100)

# Default & keyword arguments
def connect(host="localhost", port=5432, ssl=True):
    ...

connect(port=3306)  # keyword arg`)],
    ['Recursion', `Recursion solves problems defined in terms of smaller subproblems (trees, factorial, divide-and-conquer).

Every recursive function needs:
1. **Base case** — stops recursion
2. **Recursive case** — calls itself with smaller input

Watch stack depth — Python default limit is ~1000 frames.`],
  ]),

  'rest apis': (_, week) => sections([
    ['REST fundamentals', `REST (Representational State Transfer) is the dominant API style on the web.

| Method | Purpose | Idempotent |
|--------|---------|------------|
| GET | Read resource | Yes |
| POST | Create resource | No |
| PUT | Replace resource | Yes |
| PATCH | Partial update | No |
| DELETE | Remove resource | Yes |`],
    ['JSON & HTTP', CODE('python', `import requests

# GET
resp = requests.get("https://api.example.com/users/1")
data = resp.json()
print(resp.status_code)  # 200 OK

# POST
payload = {"name": "Arjun", "email": "a@demo.com"}
resp = requests.post("https://api.example.com/users", json=payload)`)],
    ['Error handling', `- **4xx**: client error (400 bad request, 401 unauthorized, 404 not found)
- **5xx**: server error (500 internal, 503 unavailable)
Always check \`response.status_code\` and handle failures gracefully.`],
  ]),

  'react internals': (_, week) => sections([
    ['How React works', `React is a declarative UI library. You describe *what* the UI should look like for a given state; React figures out *how* to update the DOM efficiently via a **Virtual DOM** and **reconciliation** algorithm.`],
    ['Components & hooks', CODE('tsx', `import { useState, useEffect } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Clicked {count} times
    </button>
  );
}`)],
    ['Rules of hooks', `1. Only call hooks at the top level (not inside loops/conditions)
2. Only call hooks from React functions
3. Custom hooks extract reusable stateful logic`],
  ]),

  'transformers': (_, week) => sections([
    ['The transformer revolution', `Transformers (Vaswani et al., 2017) replaced RNNs as the dominant architecture for NLP and now power GPT, Claude, Qwen, and Gemini.

Key innovation: **self-attention** — each token attends to all other tokens in parallel, enabling massive scale.`],
    ['Key concepts', `- **Tokenization**: text → subword tokens (BPE, SentencePiece)
- **Embeddings**: tokens → dense vectors in high-dimensional space
- **Attention**: query/key/value matrices compute relevance weights
- **Layers**: stacked encoder/decoder blocks with feed-forward networks`],
    ['Practical implications', `As an AI engineer you don't train transformers from scratch — you:
1. Choose a pre-trained model (Qwen, GPT-4)
2. Craft prompts or fine-tune on domain data
3. Build RAG pipelines for private knowledge
4. Optimize cost via caching and smaller models`],
  ]),
};

function matchCuratedLesson(topic: string): string | null {
  const lower = topic.toLowerCase().trim();
  if (CURATED_LESSONS[lower]) return CURATED_LESSONS[lower];
  for (const [key, body] of Object.entries(CURATED_LESSONS)) {
    if (lower.includes(key) || key.includes(lower)) return body;
  }
  return null;
}

function matchDeepDive(topic: string): ((track: string, week: string) => string) | null {
  const lower = topic.toLowerCase();
  for (const [key, fn] of Object.entries(TOPIC_DEEP_DIVES)) {
    if (lower.includes(key) || key.includes(lower)) return fn;
  }
  return null;
}

export function generateDetailedLesson(
  topic: string,
  trackName: string,
  trackSlug: string,
  weekTitle: string,
  weekNum: number,
): string {
  const curated = matchCuratedLesson(topic);
  let body = curated ?? buildRichLesson(topic, getTopicKnowledge(trackSlug, topic));
  body = injectLessonVisuals(body, topic, trackSlug);

  const markdown = `# ${topic}

> **Track:** ${trackName} · **Week ${weekNum}:** ${weekTitle}

${body}`;

  return ensureLessonFooter(markdown, lessonFooter(weekNum));
}

export function generateInterviewLesson(
  topic: string,
  trackName: string,
  trackSlug: string,
  weekTitle: string,
  weekNum: number,
): string {
  const spec = getInterviewSpec(topic, trackSlug, trackName, weekTitle);
  const markdown = buildInterviewLesson(spec, trackName, weekTitle, weekNum);

  const interviewFooter = `---

## Before you move on

- [ ] I answered all industry questions **out loud** (not silently read)
- [ ] I recorded myself on 3 answers and removed filler words ("um", "like")
- [ ] I practiced the CLARIFY method for 2 unpredictable scenarios
- [ ] I can deliver one STAR story connecting **${topic}** to my lab/project
- [ ] I studied the mock dialogue and can improvise follow-ups
- [ ] I prepared 3 smart questions to ask the interviewer
- [ ] I re-read Week ${weekNum} lessons — quiz topics overlap interview probes
- [ ] I am ready to face a mock interviewer with confidence`;

  return ensureLessonFooter(markdown, interviewFooter);
}

export function generateLabExercise(
  labTitle: string,
  trackName: string,
  trackSlug: string,
  weekNum: number,
  weekTitle: string,
  topics: string[],
): {
  title: string;
  difficulty: string;
  problem: string;
  hints: string[];
  starterCode: string;
  testCases: Array<{ input: string; expectedOutput: string }>;
} {
  const lang = trackSlug.includes('full-stack') ? 'typescript' : 'python';
  const relatedTopics = topics.slice(0, 4).join(', ');

  return {
    title: labTitle,
    difficulty: weekNum <= 2 ? 'easy' : weekNum <= 5 ? 'medium' : 'hard',
    problem: `# ${labTitle}

**${trackName}** · Week ${weekNum}: ${weekTitle}

## Context

This hands-on lab applies: **${relatedTopics}**.

You will build a working solution that mirrors what engineering teams ship in week 1–4 of an internship — clean code, edge cases, and readable structure.

## Problem statement

Implement **${labTitle}** that:

1. Accepts or generates input relevant to this week's topics
2. Validates input and handles edge cases gracefully
3. Produces correct, formatted output
4. Uses functions/modules — no monolithic scripts

## Requirements

| # | Requirement |
|---|-------------|
| 1 | Correct output for all test cases |
| 2 | Handle empty/invalid input without crashing |
| 3 | Functions with docstrings or JSDoc |
| 4 | No hardcoded magic values — use constants |
| 5 | Code readable enough for a code review |

## Step-by-step approach

1. **Understand** — read problem twice, write examples on paper
2. **Plan** — pseudocode or function list before coding
3. **Implement** — smallest working version first
4. **Test** — sample inputs, edge cases, then submit
5. **Refactor** — rename variables, extract helpers

## Evaluation criteria

| Criteria | Weight |
|----------|--------|
| Correctness | 40% |
| Code quality & structure | 25% |
| Error handling | 20% |
| Documentation | 15% |

## Related lessons

Review: ${relatedTopics} before starting. Use the AI Assistant if stuck (not available during weekly quiz).

## Submission

Run your code in the editor. All test cases must pass before submitting.`,
    hints: [
      `Break "${labTitle}" into: input → validate → process → output`,
      'Test with empty input and one invalid input first',
      `Re-read the lesson on "${topics[0] || weekTitle}"`,
      'Print debug values, then remove debug prints before submit',
      'If stuck 20+ minutes, read hints in order — do not skip planning step',
    ],
    starterCode: lang === 'typescript'
      ? `/**\n * ${labTitle}\n * ${trackName} - Week ${weekNum}\n */\n\nfunction validate(input: unknown): unknown {\n  // TODO: validate input\n  return input;\n}\n\nfunction process(data: unknown): string {\n  // TODO: core logic for ${labTitle}\n  return "Lab completed successfully";\n}\n\nfunction main(): void {\n  const input = ""; // or read from test harness\n  const validated = validate(input);\n  const result = process(validated);\n  console.log(result);\n}\n\nmain();\n`
      : `"""\n${labTitle}\n${trackName} - Week ${weekNum}\n"""\n\n\ndef validate(data):\n    """Validate input — raise ValueError on bad data."""\n    if data is None:\n        raise ValueError("input required")\n    return data\n\n\ndef process(data):\n    """Core logic for ${labTitle}."""\n    # TODO: implement using concepts from: ${relatedTopics}\n    return "Lab completed successfully"\n\n\ndef main():\n    raw = ""  # test harness provides input\n    result = process(validate(raw))\n    print(result)\n\n\nif __name__ == "__main__":\n    main()\n`,
    testCases: [{ input: '', expectedOutput: 'Lab completed successfully' }],
  };
}
