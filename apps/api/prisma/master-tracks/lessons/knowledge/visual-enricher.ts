/**
 * Auto-generates workflow diagrams, concept maps, and comparison tables for every lesson.
 */
import { codeBlock } from '../lesson-builder';

function mermaid(body: string): string {
  return codeBlock('mermaid', body.trim());
}

function table(headers: string[], rows: string[][]): string {
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((r) => `| ${r.join(' | ')} |`),
  ];
  return lines.join('\n');
}

function workflowForTopic(topic: string, trackSlug: string): string {
  const t = topic.toLowerCase();

  if (t.includes('git')) {
    return mermaid(`flowchart LR
  A[Clone repo] --> B[Create branch]
  B --> C[Edit & test]
  C --> D[git add / commit]
  D --> E[Push & open PR]
  E --> F{Review passed?}
  F -->|Yes| G[Merge to main]
  F -->|No| C`);
  }
  if (t.includes('linux') || t.includes('terminal')) {
    return mermaid(`flowchart TB
  A[SSH / open terminal] --> B[Navigate filesystem]
  B --> C[Run app / script]
  C --> D{Error?}
  D -->|Yes| E[Read logs / permissions]
  E --> C
  D -->|No| F[Deploy or commit]`);
  }
  if (t.includes('rest') || t.includes('api') || t.includes('http')) {
    return mermaid(`sequenceDiagram
  participant C as Client
  participant S as Server
  participant D as Database
  C->>S: HTTP Request (GET/POST)
  S->>S: Validate & auth
  S->>D: Query / persist
  D-->>S: Data
  S-->>C: JSON Response + status code`);
  }
  if (t.includes('react') || t.includes('component') || t.includes('frontend')) {
    return mermaid(`flowchart TB
  P[Parent Component] -->|props| C[Child Component]
  C -->|event / callback| P
  P --> S[(State / hooks)]
  S -->|re-render| P
  C --> H[DOM / UI]`);
  }
  if (t.includes('docker') || t.includes('devops') || t.includes('deploy')) {
    return mermaid(`flowchart LR
  A[Source code] --> B[Dockerfile build]
  B --> C[Image registry]
  C --> D[Container runtime]
  D --> E[Staging / Production]
  E --> F[Health check & logs]`);
  }
  if (t.includes('sql') || t.includes('database') || t.includes('postgres') || t.includes('prisma')) {
    return mermaid(`flowchart TB
  A[Application] --> B[ORM / SQL query]
  B --> C{Index hit?}
  C -->|Yes| D[Fast row lookup]
  C -->|No| E[Table scan]
  D --> F[Result set]
  E --> F`);
  }
  if (t.includes('rag') || t.includes('embedding') || t.includes('retrieval')) {
    return mermaid(`flowchart LR
  Q[User question] --> E[Embed query]
  E --> R[Vector search]
  R --> K[Top-K chunks]
  K --> P[Build prompt]
  P --> L[LLM generate]
  L --> A[Grounded answer]`);
  }
  if (t.includes('jwt') || t.includes('auth') || t.includes('security')) {
    return mermaid(`sequenceDiagram
  participant U as User
  participant A as API
  participant DB as Auth store
  U->>A: Login credentials
  A->>DB: Verify user
  DB-->>A: OK
  A-->>U: Access + refresh token
  U->>A: Request + Bearer token
  A->>A: Verify signature & expiry`);
  }
  if (t.includes('loop') || t.includes('variable') || t.includes('function') || t.includes('python')) {
    return mermaid(`flowchart TB
  Start([Start]) --> I[Input / setup]
  I --> P[Process with ${topic}]
  P --> C{More work?}
  C -->|Yes| P
  C -->|No| O[Output / return]
  O --> End([Done])`);
  }

  const trackFlow = trackSlug.includes('ai')
    ? 'Prompt → Model → Tool → Response'
    : trackSlug.includes('full-stack')
      ? 'UI → API → DB → UI update'
      : 'Script → Logic → File/DB → Result';

  return mermaid(`flowchart LR
  A[Learn ${topic}] --> B[Practice in lab]
  B --> C[Apply in project]
  C --> D[Debug & optimize]
  D --> E[Ship with tests]
  subgraph Track["${trackFlow}"]
    B
    C
  end`);
}

function conceptMapForTopic(topic: string, trackSlug: string): string {
  const t = topic.toLowerCase();
  const core = topic.replace(/\s+/g, ' ');

  if (t.includes('oop') || t.includes('class') || t.includes('solid')) {
    return mermaid(`flowchart TB
  CORE["${core}"]
  CORE --> E[Encapsulation]
  CORE --> I[Inheritance]
  CORE --> P[Polymorphism]
  CORE --> C[Composition]
  E --> E1[Hide data]
  C --> C1[Has-a preferred]`);
  }
  if (t.includes('async') || t.includes('promise') || t.includes('await')) {
    return mermaid(`flowchart TB
  subgraph Sync["Blocking"]
    S1[Call] --> S2[Wait]
    S2 --> S3[Result]
  end
  subgraph Async["Non-blocking"]
    A1[Call] --> A2[Continue other work]
    A2 --> A3[Callback / await result]
  end`);
  }

  return mermaid(`flowchart TB
  CORE["${core}"]
  CORE --> D[Definition]
  CORE --> T[Tools & CLI]
  CORE --> P[Practice labs]
  CORE --> R[Production errors]
  CORE --> I[Interviews]`);
}

function comparisonForTopic(topic: string, trackSlug: string): string {
  const t = topic.toLowerCase();

  if (t.includes('list') || t.includes('tuple') || t.includes('array')) {
    return table(
      ['Feature', 'List / Array', 'Tuple / Read-only'],
      [
        ['Mutability', 'Can change items', 'Fixed after creation'],
        ['Use case', 'Collections that grow/shrink', 'Fixed records, coordinates'],
        ['Performance', 'Slightly more overhead', 'Often faster, hashable if immutable'],
        ['Interview tip', 'Default choice for sequences', 'Use for dict keys when immutable'],
      ],
    );
  }
  if (t.includes('merge') || t.includes('rebase') || t.includes('git')) {
    return table(
      ['', 'git merge', 'git rebase'],
      [
        ['History', 'Preserves branch graph', 'Linear replayed history'],
        ['Conflicts', 'Once at merge', 'Per commit during rebase'],
        ['Shared branches', 'Safe default', 'Avoid on public branches'],
        ['Best for', 'Integrating feature branches', 'Cleaning local branch before PR'],
      ],
    );
  }
  if (t.includes('rest') || t.includes('graphql')) {
    return table(
      ['', 'REST', 'GraphQL'],
      [
        ['Data fetching', 'Fixed endpoints', 'Client specifies fields'],
        ['Caching', 'HTTP cache friendly', 'Needs careful cache strategy'],
        ['Learning curve', 'Lower', 'Higher schema design'],
        ['Best for', 'CRUD APIs, public APIs', 'Complex UIs, mobile clients'],
      ],
    );
  }
  if (t.includes('sql') || t.includes('nosql')) {
    return table(
      ['', 'SQL (Postgres)', 'NoSQL (document/KV)'],
      [
        ['Schema', 'Structured, enforced', 'Flexible documents'],
        ['Joins', 'Strong relational queries', 'Denormalize or app-side join'],
        ['Transactions', 'ACID standard', 'Varies by product'],
        ['Best for', 'Finance, users, orders', 'Logs, caches, rapid prototypes'],
      ],
    );
  }
  if (t.includes('jwt') || t.includes('session')) {
    return table(
      ['', 'JWT (stateless)', 'Session cookie'],
      [
        ['Storage', 'Client holds token', 'Server stores session ID'],
        ['Scale-out', 'Easy across servers', 'Needs shared session store'],
        ['Revoke', 'Short TTL + refresh / denylist', 'Delete session server-side'],
        ['Risk', 'XSS if in localStorage', 'CSRF if misconfigured'],
      ],
    );
  }
  if (t.includes('rag') || t.includes('fine-tun')) {
    return table(
      ['', 'RAG', 'Fine-tuning'],
      [
        ['Knowledge update', 'Re-index documents', 'Retrain model'],
        ['Cost', 'Retrieval + inference', 'Training + inference'],
        ['Hallucination', 'Grounded in retrieved chunks', 'Can still hallucinate facts'],
        ['Best for', 'Docs Q&A, support bots', 'Style, domain tone, specialized tasks'],
      ],
    );
  }
  if (t.includes('react') || t.includes('vue') || t.includes('angular')) {
    return table(
      ['', 'React', 'Alternatives'],
      [
        ['Model', 'Component + hooks', 'Vue SFC / Angular modules'],
        ['Ecosystem', 'Next.js, RN', 'Nuxt, Ionic, etc.'],
        ['State', 'useState, Context, libraries', 'Framework-specific stores'],
        ['Job market', 'Very high in product companies', 'Varies by region/stack'],
      ],
    );
  }

  const without = trackSlug.includes('ai')
    ? 'Generic chatbot guesses'
    : trackSlug.includes('full-stack')
      ? 'Fragile UI + API mismatch'
      : 'Brittle scripts, manual fixes';

  const withTopic = trackSlug.includes('ai')
    ? 'Grounded, measurable AI features'
    : trackSlug.includes('full-stack')
      ? 'Predictable full-stack delivery'
      : 'Reliable automation & services';

  return table(
    ['Dimension', `Without ${topic}`, `With ${topic} mastered`],
    [
      ['Speed', 'Trial-and-error debugging', 'Structured workflow from this lesson'],
      ['Quality', without, withTopic],
      ['Team trust', 'Needs constant review', 'Ship smaller PRs confidently'],
      ['Interviews', 'Vague definitions', 'Explain with diagram + example'],
    ],
  );
}

function progressChart(topic: string): string {
  return mermaid(`flowchart LR
  W1[Week 1-2<br/>Foundations] --> W3[Week 3-4<br/>Core skills]
  W3 --> W5[Week 5-6<br/>Integration]
  W5 --> W7[Week 7-8<br/>Projects]
  W7 --> Cap[Capstone]
  subgraph Now["This lesson: ${topic}"]
    L1[Read] --> L2[Diagram]
    L2 --> L3[Code]
    L3 --> L4[Quiz]
  end`);
}

function decisionFlow(topic: string, trackSlug: string): string {
  const t = topic.toLowerCase();
  if (t.includes('loop') || t.includes('for') || t.includes('while')) {
    return mermaid(`flowchart TD
  Start([Need repetition?]) --> C1{Known count?}
  C1 -->|Yes| F[for loop]
  C1 -->|No| C2{Condition-based?}
  C2 -->|Yes| W[while loop]
  C2 -->|No| R[recursion / iterator]`);
  }
  if (t.includes('cache') || t.includes('redis')) {
    return mermaid(`flowchart TD
  R[Request] --> H{In cache?}
  H -->|Hit| Fast[Return cached]
  H -->|Miss| DB[Fetch from DB/API]
  DB --> S[Store in cache]
  S --> Fast`);
  }

  return mermaid(`flowchart TD
  Q[Problem involving ${topic}] --> A{Production scale?}
  A -->|No| B[Start simple — lesson Example 1]
  A -->|Yes| C[Add validation + tests]
  C --> D[Measure — logs / metrics]
  D --> E[Optimize bottleneck]`);
}

/** Markdown block inserted into every generated lesson */
export function buildVisualLearningSection(topic: string, trackSlug: string): string {
  return [
    '---',
    '',
    '## Visual Learning Guide',
    '',
    '> Use these diagrams and tables to **see** the flow before memorizing syntax. Redraw them on paper after reading.',
    '',
    '### Workflow — how this fits in real engineering',
    '',
    workflowForTopic(topic, trackSlug),
    '',
    '### Concept map',
    '',
    conceptMapForTopic(topic, trackSlug),
    '',
    '### Decision guide — when to use what',
    '',
    decisionFlow(topic, trackSlug),
    '',
    '### Comparison table',
    '',
    comparisonForTopic(topic, trackSlug),
    '',
    '### Your learning path in this program',
    '',
    progressChart(topic),
    '',
  ].join('\n');
}

/** Insert visual section after intro blockquote if not already present */
export function injectLessonVisuals(content: string, topic: string, trackSlug: string): string {
  if (content.includes('## Visual Learning Guide')) return content;

  const visual = buildVisualLearningSection(topic, trackSlug);
  const anchor = content.indexOf('\n---\n');
  if (anchor !== -1) {
    return content.slice(0, anchor) + '\n\n' + visual + content.slice(anchor);
  }

  const firstH2 = content.search(/\n## /);
  if (firstH2 !== -1) {
    return content.slice(0, firstH2) + '\n\n' + visual + content.slice(firstH2);
  }

  return content + '\n\n' + visual;
}
