/**
 * Industry-grade interview prep content — questions, answers, unpredictable-question playbook.
 */
import { InterviewModuleSpec, InterviewQA } from './interview-builder';

const rubrics = (topic: string) => [
  { signal: 'Conceptual clarity', detail: `Explain ${topic} in plain English without buzzword stacking — 2 minutes max.` },
  { signal: 'Practical depth', detail: 'Reference labs, GitHub projects, or internship tasks — not textbook-only answers.' },
  { signal: 'Problem-solving process', detail: 'Think aloud: clarify → approach → implement → test → reflect.' },
  { signal: 'Communication', detail: 'Structured answers, eye contact (video), pause before answering hard questions.' },
  { signal: 'Maturity under pressure', detail: 'Admit gaps honestly, then show how you would learn or debug.' },
];

const clarify = (topic: string) => [
  '**C — Clarify:** Repeat the question in your words. Ask scope: "Are we optimizing for speed, memory, or readability?"',
  '**L — Limits:** State constraints: data size, latency, team size, existing stack.',
  '**A — Approach options:** Name 2 approaches and trade-offs before picking one.',
  '**R — Reason:** Explain why you chose this approach for this context.',
  '**I — Implement sketch:** Outline steps, pseudocode, or API shape — not silence.',
  '**F — Follow-up:** Ask "Would you like me to go deeper on X or optimize Y?"',
  `**Y — Yield gracefully:** If truly unknown: "I have not used ${topic} in production yet, but here is how I would ramp up in week 1…"`,
];

const convince = [
  '**Show your work:** Narrate thinking — silence reads as guessing.',
  '**Use evidence:** "In my Constel lab I…" beats "I think maybe…"',
  '**Acknowledge trade-offs:** "This is faster but harder to maintain — I would choose X because…"',
  '**Ask smart questions:** "What does success look like in the first 90 days?" shows ownership mindset.',
  '**Recover from mistakes:** Wrong answer? "Good catch — let me revise with that constraint."',
  '**End with impact:** Quantify results when possible — time saved, bugs reduced, users served.',
];

const redFlags = [
  'Memorized answers with no ability to answer follow-ups.',
  'Blaming teammates, tools, or "the tester" for bugs.',
  'Saying "I don\'t know" with no attempt to reason.',
  'Bad-mouthing previous employers or college.',
  'No questions when interviewer asks "Any questions for us?"',
  'Overclaiming expertise you cannot defend under probing.',
];

function qa(
  question: string,
  difficulty: InterviewQA['difficulty'],
  type: InterviewQA['type'],
  wants: string,
  answer: string,
  extras?: Partial<InterviewQA>,
): InterviewQA {
  return { question, difficulty, type, whatInterviewerWants: wants, modelAnswer: answer, ...extras };
}

const SPECS: Record<string, InterviewModuleSpec> = {
  'git basics': {
    topic: 'Git basics',
    sessionGoal: 'Leave this session able to explain Git workflow, resolve conflicts, and answer product-company screening questions confidently — the #1 tool every engineering team uses daily.',
    roundTypes: ['Online screening (15–20 min)', 'Technical phone screen with live Git scenario', 'Take-home followed by "walk through your commits" review'],
    evaluationRubrics: rubrics('Git'),
    questions: [
      qa('Explain the difference between git merge and git rebase.', 'Medium', 'Technical', 'Do you understand team workflow impact?', 'Merge preserves branch history and creates a merge commit — safe for shared branches. Rebase replays commits on top of another branch for linear history — cleaner log but rewrites history, so we avoid rebasing public shared branches. On feature branches I rebase onto main before PR; we merge PRs to main to keep audit trail.', { followUps: ['When would rebase cause pain?', 'What is merge conflict?'], standOutTip: 'Mention PR review + squash merge vs merge commit — shows real team experience.' }),
      qa('Your teammate pushed broken code to main. What do you do?', 'Hard', 'Behavioral', 'Incident maturity and Git safety.', 'First, assess user impact — rollback or hotfix branch from last good tag. I would not force-push main. Steps: identify bad commit with git log, revert with git revert (preserves history) or deploy previous artifact, post incident note, add test so it cannot recur. Communication to team immediately.', { standOutTip: 'Say revert over reset for shared branches — interviewers listen for this.' }),
      qa('How do you structure commits in a real project?', 'Easy', 'Technical', 'Professional habits.', 'Small atomic commits — one logical change each. Message format: type(scope): description — e.g. feat(auth): add JWT refresh. Reference ticket ID. Never commit secrets or node_modules. I commit after each passing test slice.', { codeSnippet: 'git commit -m "fix(api): validate email on registration (#142)"' }),
      qa('What is git stash and when do you use it?', 'Easy', 'Technical', 'Daily workflow fluency.', 'Stash temporarily shelves uncommitted changes so I can switch branches without committing WIP. Use stash pop to restore. Common when urgent bugfix interrupts feature work.', { followUps: ['Stash vs commit on feature branch?'] }),
      qa('Explain git cherry-pick.', 'Medium', 'Technical', 'Advanced but common in hotfixes.', 'Cherry-pick applies a specific commit from one branch to another without merging entire branch. Used for hotfix propagation — e.g. apply security patch from main to release branch.', { followUps: ['Risk of cherry-pick?'] }),
      qa('Describe your PR workflow.', 'Medium', 'Behavioral', 'Collaboration signal.', 'Branch from updated main → implement with tests → push → open PR with description, screenshots, test plan → address review comments → squash or merge per team policy → delete branch. I review others\' PRs weekly to learn codebase.', { standOutTip: 'Mention CI must pass before merge.' }),
      qa('How do you undo the last commit but keep changes?', 'Easy', 'Technical', 'Practical Git recovery.', 'git reset --soft HEAD~1 keeps changes staged. --mixed (default) unstages but keeps files. --hard discards — dangerous on shared work. For pushed commits use git revert instead.', { codeSnippet: 'git reset --soft HEAD~1' }),
      qa('What goes in .gitignore and why does it matter?', 'Easy', 'Technical', 'Security awareness.', '.env, credentials, build artifacts, node_modules, __pycache__, .venv, OS files. Prevents leaking secrets and bloating repo. I use .env.example for documentation.', { standOutTip: 'Mention secret scanning in CI if repo ever had leak.' }),
    ],
    unpredictablePlaybook: clarify('Git'),
    convinceInterviewer: convince,
    redFlags,
    mockDialogue: [
      { speaker: 'Interviewer', line: 'Your PR has 40 files changed. Concern?' },
      { speaker: 'Candidate', line: 'Fair question — I would split into smaller PRs for reviewability. This one grew because X; going forward I will feature-flag and slice by layer: schema, API, UI.' },
      { speaker: 'Interviewer', line: 'Merge conflict in package-lock. Steps?' },
      { speaker: 'Candidate', line: 'Pull latest main, reproduce locally, open conflicting files, understand both sides, run npm install to regenerate lock if needed, run full test suite, push resolution.' },
    ],
    practicePlan: ['Answer all 8 questions aloud — 90 sec each', 'Draw Git workflow on paper: branch → PR → CI → merge', 'Practice explaining revert vs reset to a friend', 'Review your GitHub — ensure commit messages are professional', 'Mock: 10 min "Git troubleshooting" with classmate'],
  },

  'output prediction': {
    topic: 'output prediction',
    sessionGoal: 'Master Python output-tracing questions — the most common Python screening round at TCS, Infosys, product startups, and Constel weekly assessments.',
    roundTypes: ['MCQ / output trace (10–15 questions)', 'Live coding with "what prints?" follow-ups', 'Pair programming — predict before running'],
    evaluationRubrics: rubrics('Python output tracing'),
    questions: [
      qa('What is the output?\n```python\na = [1, 2]\nb = a\nb.append(3)\nprint(a)\n```', 'Easy', 'Coding', 'Reference vs copy understanding.', '[1, 2, 3] — a and b reference the same list object; append mutates in place.', { followUps: ['How to copy independently?'], codeSnippet: 'import copy\ndeep = copy.deepcopy(a)' }),
      qa('What is the output?\n```python\nprint(type([]) is list)\nprint(type([]) is type(list()))\n```', 'Medium', 'Coding', 'Identity vs equality, type objects.', 'True\nTrue — list is the class; empty list instance type is list.', { followUps: ['is vs ==?'] }),
      qa('What happens?\n```python\nx = 5\ny = "10"\nprint(x + y)\n```', 'Easy', 'Coding', 'Type safety.', 'TypeError — cannot concatenate int and str. Fix: int(y) or str(x).', { standOutTip: 'Mention this is why validation at API boundaries matters.' }),
      qa('Output?\n```python\nprint(bool([]), bool([0]), bool(0))\n```', 'Medium', 'Coding', 'Truthy/falsy — interview favorite.', 'False True False — empty list falsy; non-empty truthy even with 0; zero falsy.', { followUps: ['bool("")? bool("0")?'] }),
      qa('Output?\n```python\ndef f(x, lst=[]):\n    lst.append(x)\n    return lst\nprint(f(1), f(2))\n```', 'Hard', 'Coding', 'Mutable default argument trap.', '[1] [1, 2] — shared default list across calls. Classic senior-level trap question.', { standOutTip: 'Always explain fix: def f(x, lst=None): lst = lst or []' }),
      qa('Output?\n```python\nfor i in range(3):\n    print(i, end=" ")\n```', 'Easy', 'Coding', 'Loop basics.', '0 1 2 ', { followUps: ['range(3) vs range(1,4)?'] }),
      qa('What is printed?\n```python\nprint(0.1 + 0.2 == 0.3)\n```', 'Medium', 'Coding', 'Float precision awareness.', 'False — IEEE 754 floating point. Use decimal module for money or round/compare with epsilon.', { standOutTip: 'Shows production awareness beyond syntax.' }),
      qa('Explain short-circuit evaluation with example output.', 'Medium', 'Technical', 'Logical operators depth.', 'In `False and print("hi")` nothing prints — and stops at False. In `True or print("hi")` nothing prints — or stops at True. Saves evaluation and prevents errors like None attribute access.', { codeSnippet: 'def valid(u):\n    return u and u.is_active' }),
    ],
    unpredictablePlaybook: clarify('Python output'),
    convinceInterviewer: convince,
    redFlags,
    mockDialogue: [
      { speaker: 'Interviewer', line: 'Why did you get Q5 wrong?' },
      { speaker: 'Candidate', line: 'I treated the default list as fresh each call — mutable defaults are shared at function definition time. I will trace id(lst) next time to verify object identity.' },
      { speaker: 'Interviewer', line: 'How do you practice output questions?' },
      { speaker: 'Candidate', line: 'I run mental traces: bind names, check mutability, step line by line. Then verify in REPL. Weekly Constel quizzes reinforce patterns.' },
    ],
    practicePlan: ['Solve 20 output questions without running code, then verify', 'Drill mutable vs immutable types table from memory', 'Explain 3 wrong answers from weekly quiz aloud', 'Time yourself: 90 sec per hard question'],
  },

  'react fundamentals': {
    topic: 'React fundamentals',
    sessionGoal: 'Answer React screening and internship rounds with confidence — components, state, hooks, rendering, and the questions product companies ask daily.',
    roundTypes: ['Frontend MCQ + conceptual (30 min)', 'Live React coding (build a component)', 'Architecture discussion with senior frontend engineer'],
    evaluationRubrics: rubrics('React'),
    questions: [
      qa('What is React and why do teams use it?', 'Easy', 'Technical', 'Foundation + business value.', 'React is a JavaScript library for building UIs with components. Virtual DOM enables efficient updates. Teams use it for component reuse, huge ecosystem, hiring pool, and strong tooling (Next.js, React Native). Trade-off: needs ecosystem choices for routing, state, data fetching.', { standOutTip: 'Mention you understand it is a library not a full framework unless Next.js.' }),
      qa('Explain state vs props.', 'Easy', 'Technical', 'Core model.', 'Props flow down from parent — read-only for child. State is internal data that triggers re-render when updated via setState/useState. Lift state up when siblings need to share data.', { followUps: ['Can you mutate props?'] }),
      qa('What happens when you call setState/useState?', 'Medium', 'Technical', 'Rendering mental model.', 'React schedules a re-render of that component and typically children. Updates may be batched in event handlers. React diffs virtual DOM and commits minimal changes to real DOM. Async — do not assume immediate value after setState.', { followUps: ['useState vs useReducer?'] }),
      qa('Why do lists need keys?', 'Medium', 'Technical', 'Reconciliation.', 'Keys help React identify which items changed, moved, or deleted — stable identity across renders. Wrong keys cause bugs and performance issues. Use stable IDs not array index when list reorders.', { codeSnippet: '{items.map(item => <Row key={item.id} data={item} />)}' }),
      qa('useEffect — when does it run and cleanup?', 'Medium', 'Technical', 'Hooks depth — very common.', 'Runs after paint. Dependency array controls re-runs: [] once on mount, [dep] when dep changes. Cleanup runs before next effect or unmount — critical for subscriptions, timers, abort controllers.', { followUps: ['Infinite loop causes?'], standOutTip: 'Mention React Strict Mode double-invoke in dev.' }),
      qa('Controlled vs uncontrolled components?', 'Medium', 'Technical', 'Forms pattern.', 'Controlled: React state is source of truth for input value. Uncontrolled: DOM holds value, read via ref. Controlled preferred for validation and predictable behavior.', { followUps: ['File inputs?'] }),
      qa('How do you prevent unnecessary re-renders?', 'Hard', 'Technical', 'Performance awareness.', 'React.memo for pure components, useMemo/useCallback for expensive deps, split context, lift state down, virtualize long lists. Profile with React DevTools first — do not premature optimize.', { standOutTip: 'Say measure first — seniors respect this.' }),
      qa('Describe a React bug you fixed.', 'Medium', 'Behavioral', 'Real experience signal.', 'STAR: In dashboard project, list flickered on filter — stale closure in useEffect missing dependency. Added dep array, used functional update, added loading state. Result: smooth UX, learned eslint exhaustive-deps rule.', { followUps: ['What if no real project? Use Constel lab.'] }),
    ],
    unpredictablePlaybook: clarify('React'),
    convinceInterviewer: convince,
    redFlags,
    mockDialogue: [
      { speaker: 'Interviewer', line: 'Build a counter with increment/decrement.' },
      { speaker: 'Candidate', line: 'I will use useState for count, button onClick handlers, prevent negative if required — may I clarify if count can go below zero?' },
      { speaker: 'Interviewer', line: 'Why not store count in ref?' },
      { speaker: 'Candidate', line: 'Ref would not trigger re-render on change — UI would stay stale unless I force update. State is correct for displayed data.' },
    ],
    practicePlan: ['Build counter, todo, fetch-users without tutorial', 'Explain virtual DOM in 60 sec recorded', 'Practice 5 hook questions whiteboard', 'Review React DevTools Components tab'],
  },

  'rag architecture': {
    topic: 'RAG architecture',
    sessionGoal: 'Defend RAG design decisions in AI engineering interviews — retrieval quality, chunking, evaluation, and production failure modes.',
    roundTypes: ['AI system design (45 min)', 'Technical deep dive on project RAG pipeline', 'Take-home: improve retrieval accuracy'],
    evaluationRubrics: rubrics('RAG systems'),
    questions: [
      qa('Explain RAG in 60 seconds.', 'Easy', 'Technical', 'Can you simplify complex systems?', 'Retrieval-Augmented Generation combines search with LLM. User question → embed query → retrieve relevant document chunks from vector DB → inject into prompt → LLM generates grounded answer. Reduces hallucination vs pure LLM because answer cites retrieved context.', { standOutTip: 'Draw pipeline boxes in interview.' }),
      qa('How do you choose chunk size?', 'Medium', 'System', 'Engineering trade-offs.', 'Too small loses context; too large adds noise and token cost. Start 256–512 tokens with 10–20% overlap. Tune with eval set: measure recall@k and answer accuracy. Structure-aware chunking for markdown/code.', { followUps: ['Fixed vs semantic chunking?'] }),
      qa('What metrics evaluate RAG?', 'Hard', 'Technical', 'Production maturity.', 'Retrieval: recall@k, MRR, nDCG. Generation: faithfulness (grounded in context), relevance, citation accuracy. End-to-end: human eval + LLM-as-judge with caution. Track latency and cost per query.', { standOutTip: 'Mention golden question set you maintain.' }),
      qa('RAG failed in production — users get wrong answers. Debug?', 'Hard', 'System', 'Incident response.', 'Check: retrieval (wrong chunks?), embedding model mismatch, stale index, prompt template, context window overflow, LLM ignoring context. Log retrieved chunks with query. A/B smaller chunks or reranker. Add user feedback thumbs down loop.', { followUps: ['When skip RAG and fine-tune?'] }),
      qa('Vector DB — when pgvector vs dedicated?', 'Medium', 'Technical', 'Architecture choice.', 'pgvector fine for MVP, moderate scale, already on Postgres — simpler ops. Pinecone/Qdrant/Weaviate for high QPS, advanced filtering, managed scaling. Decision: scale, team ops capacity, hybrid search needs.', { standOutTip: 'Tie to Constel capstone stack.' }),
      qa('How prevent prompt injection via retrieved docs?', 'Hard', 'Technical', 'Security awareness.', 'Sanitize ingested content, separate system vs user vs context channels, instruction defense in system prompt, allowlist sources, monitor anomalous outputs, human review for sensitive actions.', { followUps: ['RAG on user-uploaded PDFs?'] }),
      qa('Describe your RAG project architecture.', 'Medium', 'Behavioral', 'Hands-on proof.', 'Ingestion worker embeds docs → vector store with metadata (source, date) → API receives query → retrieve top-k → rerank optional → build prompt → stream response → log chunks for debug. Cached embeddings for static docs.', { standOutTip: 'Quantify: "handles 500 PDFs, p95 2s"' }),
      qa('Hybrid search — why combine keyword + semantic?', 'Medium', 'Technical', 'Advanced retrieval.', 'Semantic catches paraphrases; BM25 catches exact SKUs, error codes, names. Hybrid improves recall when queries mix both. Common in production RAG.', { codeSnippet: 'score = alpha * semantic + (1-alpha) * bm25' }),
    ],
    unpredictablePlaybook: clarify('RAG'),
    convinceInterviewer: convince,
    redFlags,
    mockDialogue: [
      { speaker: 'Interviewer', line: 'Why not just fine-tune the model on our docs?' },
      { speaker: 'Candidate', line: 'Fine-tune helps style and domain language but updating knowledge requires retraining. RAG updates index when docs change — better for fresh policies and lower cost for shifting content.' },
      { speaker: 'Interviewer', line: 'Context window is 128k — why chunk?' },
      { speaker: 'Candidate', line: 'Cost, latency, and needle-in-haystack problem — models attend better to focused relevant chunks than entire corpus dumped in prompt.' },
    ],
    practicePlan: ['Draw RAG pipeline from memory', 'Prepare 2 failure stories with fixes', 'Build eval set of 10 Q&A pairs for a sample doc', 'Practice explaining chunk overlap in 60 sec'],
  },

  'jwt deep dive': {
    topic: 'JWT deep dive',
    sessionGoal: 'Pass security-focused backend interviews on authentication — JWT structure, threats, refresh flows, and convincing answers without oversimplifying.',
    roundTypes: ['Backend security screen', 'System design auth module', 'Live coding: protect an endpoint'],
    evaluationRubrics: rubrics('JWT authentication'),
    questions: [
      qa('Explain JWT structure.', 'Easy', 'Technical', 'Foundation.', 'Three base64 parts: header (alg, typ), payload (claims like sub, exp, iat), signature (HMAC or RSA of header+payload). Signature proves integrity — server verifies with secret/public key. Payload is encoded not encrypted — never store secrets in JWT.', { codeSnippet: 'header.payload.signature' }),
      qa('Access token vs refresh token?', 'Medium', 'Technical', 'Production pattern.', 'Access token short-lived (15min) sent per request. Refresh token long-lived, stored httpOnly cookie or secure storage, used only at /refresh to get new access token. Limits exposure if access token leaked.', { followUps: ['Where store refresh on mobile?'] }),
      qa('JWT vs session cookie?', 'Medium', 'Technical', 'Trade-off articulation.', 'JWT stateless — server verifies signature, scales horizontally without session store. Session ID in cookie — server looks up session server-side, easier revoke. JWT revoke needs blocklist or short expiry + refresh.', { standOutTip: 'No religious answer — pick for context.' }),
      qa('How do you revoke a JWT before expiry?', 'Hard', 'System', 'Real-world gap awareness.', 'Maintain denylist in Redis of jti until exp, or rotate signing keys, or use very short access tokens. Pure stateless JWT cannot revoke instantly without extra infrastructure.', { followUps: ['Logout implementation?'] }),
      qa('Common JWT vulnerabilities?', 'Hard', 'Technical', 'Security depth.', 'alg:none attack, weak secrets, storing sensitive data in payload, localStorage XSS theft, no expiry validation, CSRF if misconfigured cookies. Mitigate: strong secrets, httpOnly cookies, HTTPS, validate alg whitelist.', { standOutTip: 'Mention OWASP JWT cheat sheet.' }),
      qa('Implement auth middleware — describe steps.', 'Medium', 'Coding', 'Practical backend.', 'Extract Bearer token from Authorization header, verify signature and exp, attach user claims to request context, return 401 if invalid, call next(). Role check in route handler or RBAC layer.', { codeSnippet: 'const payload = jwt.verify(token, SECRET);\nreq.user = payload;' }),
      qa('Password storage — never in JWT, but how store passwords?', 'Medium', 'Technical', 'Basics security.', 'bcrypt or argon2 with salt — never plaintext or MD5. Rate limit login, lockout policy, optional MFA for admin.', { followUps: ['Salt per user?'] }),
      qa('Design auth for multi-tenant SaaS.', 'Hard', 'System', 'Senior signal.', 'Tenant ID in claims or resolved from subdomain, isolate data with tenant_id column or schema, RBAC per tenant, audit logs, separate API keys for B2B integrations.', { standOutTip: 'Ask clarifying questions before diving in.' }),
    ],
    unpredictablePlaybook: clarify('JWT auth'),
    convinceInterviewer: convince,
    redFlags,
    mockDialogue: [
      { speaker: 'Interviewer', line: 'Store JWT in localStorage?' },
      { speaker: 'Candidate', line: 'I avoid it for sensitive apps — XSS can exfiltrate. Prefer httpOnly Secure SameSite cookie for refresh, memory or short access token if SPA.' },
      { speaker: 'Interviewer', line: 'Token stolen — response?' },
      { speaker: 'Candidate', line: 'Revoke refresh, rotate keys if needed, invalidate sessions for user, force re-auth, investigate breach window, add anomaly detection.' },
    ],
    practicePlan: ['Decode sample JWT at jwt.io — explain each part', 'Implement verify middleware in lab', 'List 5 JWT attacks from memory', 'Practice STAR story on securing an API'],
  },

  'hr simulations': {
    topic: 'HR simulations',
    sessionGoal: 'Handle HR and managerial rounds with confidence — STAR stories, salary discussions, weakness questions, and convincing non-technical interviewers you will succeed.',
    roundTypes: ['HR phone screen (20 min)', 'Culture fit with hiring manager', 'Final round before offer'],
    evaluationRubrics: [
      { signal: 'Communication', detail: 'Clear, warm, structured — not robotic or overly casual.' },
      { signal: 'Self-awareness', detail: 'Honest strengths/weaknesses with growth actions.' },
      { signal: 'Motivation', detail: 'Why this company and role — specific not generic.' },
      { signal: 'Professionalism', detail: 'Punctuality, dress, camera-on etiquette for video.' },
      { signal: 'Alignment', detail: 'Values match: learning, teamwork, ownership.' },
    ],
    questions: [
      qa('Tell me about yourself.', 'Easy', 'HR', 'Opening pitch — sets tone.', 'Present → Past → Future in 90 sec. "I am a Python engineering student at Constel building backend and automation projects. Recently I shipped a CLI profile manager with validation and tests. I am excited about this internship because your team works on [specific product] and I want to grow in production API development."', { standOutTip: 'End with why them, not why you need any job.' }),
      qa('What is your greatest weakness?', 'Medium', 'HR', 'Self-awareness trap.', 'Pick real weakness + active improvement. "I sometimes over-engineer early — I now timebox spikes and ship MVP first, then iterate from feedback. In my last lab I cut scope to hit deadline and added tests."', { followUps: ['Avoid fake weaknesses like perfectionism cliché without substance.'] }),
      qa('Describe a conflict with a teammate.', 'Medium', 'Behavioral', 'Teamwork maturity.', 'STAR: Group project disagreement on architecture — listened to their view, proposed POC both approaches, measured performance, team chose simpler option. Result: delivered on time, preserved relationship.', { standOutTip: 'Never blame — show collaboration.' }),
      qa('Why should we hire you over others?', 'Medium', 'HR', 'Closing conviction.', 'Three points: technical foundation (Constel track + projects), learning velocity (example of picking up Git/Linux fast), ownership (example of finishing lab + documentation without reminder). Tie to their job description keywords.', { followUps: ['Research company before interview.'] }),
      qa('Where do you see yourself in 5 years?', 'Easy', 'HR', 'Retention signal.', 'Growing into strong software engineer — deepening backend/system design, mentoring juniors, shipping products users rely on. I want depth at a product company like yours before specializing further.', { standOutTip: 'Avoid "CEO in 2 years" unless founder track.' }),
      qa('Expected CTC / salary expectations?', 'Medium', 'HR', 'Negotiation basics.', 'For internships: research market range, give band based on role and city, show flexibility for learning opportunity. "Based on my research and this role scope, I expect X–Y LPA, open to discussion based on full package and growth."', { followUps: ['Ask about learning budget, mentorship.'] }),
      qa('Do you have questions for us?', 'Easy', 'HR', 'Engagement signal — always say yes.', 'Prepare 3: "What does success look like in first 90 days?", "How is code reviewed?", "What stack will I work on day to day?"', { standOutTip: 'Never say "No questions."' }),
      qa('Tell me about a failure.', 'Medium', 'Behavioral', 'Resilience.', 'STAR: Missed deadline on assignment because scope creep — learned to break tasks, daily commits, ask for help at blocker >30 min. Retook assessment, passed 85%. Failure taught estimation and communication.', { followUps: ['Show growth not excuse.'] }),
    ],
    unpredictablePlaybook: [
      '**Pause 2 seconds** — collect thoughts; silence feels long to you only.',
      '**Bridge to prepared story:** "That reminds me of when I…" — redirect ethically if partially related.',
      '**Ask to repeat or clarify:** "Could you help me understand if you mean X or Y?"',
      '**If personal/off-limits:** "I prefer to focus on how I can contribute technically — happy to discuss my projects."',
      '**Salary surprise early:** "I would like to learn more about the role first — can we discuss compensation after we align on fit?"',
      '**Stress question:** Stay calm — "Interesting scenario. I would approach it step by step…"',
      '**Unknown company fact:** "I do not know yet — I researched X and Y on your site; I would love to learn more about Z here."',
    ],
    convinceInterviewer: [
      '**Energy and warmth** — smile, thank them, acknowledge their time.',
      '**Specificity beats generic** — name projects, metrics, technologies.',
      '**Show homework** — mention one recent company product or blog post.',
      '**Ownership language** — "I delivered" not "we were told to."',
      '**Follow up** — thank-you email within 24 hours referencing conversation detail.',
    ],
    redFlags: [...redFlags, 'Lying about skills or experience on resume.', 'Unable to explain anything on your CV.'],
    mockDialogue: [
      { speaker: 'Interviewer', line: 'You seem nervous.' },
      { speaker: 'Candidate', line: 'I care about doing well — I have prepared my projects and I am excited to discuss them. May we start with a technical overview of the team?' },
      { speaker: 'Interviewer', line: 'Why gap in resume / lower grade?' },
      { speaker: 'Candidate', line: 'I used that period to build practical skills through Constel and open source — here is what I shipped and what I learned.' },
    ],
    practicePlan: ['Write STAR stories for 5 scenarios — memorize bullets not script', 'Record 2-min "tell me about yourself"', 'Research 3 target companies deeply', 'Mock HR with friend — 20 min roleplay', 'Prepare 5 questions to ask interviewer'],
  },

  'oop design': {
    topic: 'OOP & Design Patterns',
    sessionGoal: 'Leave this session able to **model real systems** with OOP — not recite textbook definitions. You will defend encapsulation, composition vs inheritance, SOLID, and extensible design under follow-up pressure.',
    roundTypes: ['OOP conceptual screen (20 min)', 'Whiteboard class design (notification, payment, logger)', 'Code review: "refactor this god class"'],
    evaluationRubrics: rubrics('OOP and design patterns'),
    questions: [
      qa('Explain encapsulation, inheritance, and polymorphism with a real example (e.g. payment system).', 'Easy', 'Technical', 'Can you apply pillars to a domain, not just define them?', '**Encapsulation:** hide internal state — PaymentProcessor exposes charge(amount) not raw card fields. **Inheritance:** shared behavior — CreditCardPayment extends PaymentMethod. **Polymorphism:** call payment.process() without knowing concrete type. Production systems favor **composition** ("has-a") over deep inheritance trees.', { followUps: ['When would you NOT use inheritance?', 'How does Python duck typing relate to polymorphism?'], standOutTip: 'Draw 3 boxes on whiteboard — interviewers remember visuals.' }),
      qa('Composition vs inheritance — when do you choose each?', 'Medium', 'Technical', 'Trade-off maturity.', '**Inheritance** when subtype truly is-a base with stable contract (Exception hierarchy). **Composition** when behavior varies or you need multiple capabilities (Car has Engine, has GPS). Rule: prefer composition; deep inheritance creates fragile hierarchies. Strategy/Decorator swap behavior via composition at runtime.', { followUps: ['Example where inheritance caused pain?', 'How do React hooks relate to composition?'] }),
      qa('Explain SOLID — pick two principles and show code smell vs fix.', 'Medium', 'Technical', 'Maintainability mindset.', '**Single Responsibility:** UserService that emails + saves DB → split UserRepository and EmailNotifier. **Open/Closed:** giant if type == pdf switch → Exporter interface + PDFExporter, CSVExporter. Briefly mention Liskov, Interface segregation, Dependency inversion if time.', { followUps: ['Which SOLID matters most in microservices?', 'When is too many interfaces over-engineering?'] }),
      qa('Design a notification system: Email, SMS, Push — extensible for Slack later.', 'Hard', 'System', 'Open/closed principle in practice.', 'NotificationChannel protocol: send(message, recipient). Implement EmailChannel, SMSChannel, PushChannel. NotificationService receives channels via DI. Slack = new class + config registration — no core edits. Production: idempotency keys, retry with backoff, dead-letter queue for failures.', { followUps: ['Test without sending real email?', 'Fan-out to 1M users — what breaks?'], standOutTip: 'Mention async worker queue — shows production thinking.' }),
      qa('What is the Strategy pattern? When is it overkill?', 'Hard', 'Technical', 'Pattern judgment.', 'Strategy encapsulates interchangeable algorithms — PricingStrategy with Regular, Discount, Premium; client calls strategy.calculate(cart). Overkill when one algorithm never changes — YAGNI. Good when rules vary by tenant, region, or promotion calendar.', { followUps: ['Strategy vs plain callback function?', 'staticmethod vs Strategy class in Python?'] }),
      qa('Describe a time you refactored messy code using OOP.', 'Medium', 'Behavioral', 'Real-world application.', 'STAR: Constel lab had one 200-line script. I extracted Validator, Repository, and Service classes. Result: unit tests per class, PR review passed faster, bug in validation isolated in one file.', { standOutTip: 'Quantify: lines removed, tests added.' }),
      qa('What is a code smell that signals bad OOP?', 'Easy', 'Technical', 'Review vocabulary.', 'God class, feature envy, shotgun surgery, primitive obsession, long parameter lists. Fix by extracting classes, introducing value objects, applying SRP. I flag these in peer review before merge.', { followUps: ['Example from open source?'] }),
      qa('How do you test OOP designs?', 'Medium', 'Technical', 'Quality signal.', 'Unit test each class in isolation with mocks for dependencies. Integration test service + real DB. Avoid testing private methods — test public contract. DI makes mocking NotificationChannel trivial.', { codeSnippet: '# pytest with mock channel\nassert service.notify(user) calls channel.send once' }),
    ],
    unpredictablePlaybook: clarify('OOP design'),
    convinceInterviewer: [
      ...convince,
      'Tie OOP to **maintainability** and **team velocity**, not academic purity.',
      'Say: "I would inject interfaces so I can mock channels in unit tests."',
    ],
    redFlags,
    mockDialogue: [
      { speaker: 'Interviewer', line: 'Why not one Notification class with a type field?' },
      { speaker: 'Candidate', line: 'Works for two channels; each new channel adds branches and violates open/closed. Separate classes isolate change and stay testable.' },
      { speaker: 'Interviewer', line: 'Your design looks over-engineered.' },
      { speaker: 'Candidate', line: 'For MVP I would ship a simpler switch. I showed extensibility because you asked about Slack later — happy to scope down.' },
    ],
    practicePlan: ['Redesign one Constel lab with 2+ classes', 'Explain SOLID on one file from your repo', '10-min whiteboard: notification system', 'List 3 code smells from old code and fixes'],
  },

  'big o analysis': {
    topic: 'Time & Space Complexity',
    sessionGoal: 'Analyze loops, hash maps, and recursion **aloud** like a code review — the skill that separates guessers from engineers in Amazon, Flipkart, and product startup rounds.',
    roundTypes: ['Complexity MCQ + trace (15 min)', 'Live coding with "optimize this" follow-up', 'System sketch: "why index this column?"'],
    evaluationRubrics: rubrics('Big-O complexity'),
    questions: [
      qa('What is Big-O? Why do we ignore constants?', 'Easy', 'Technical', 'Asymptotic thinking.', 'Big-O is asymptotic upper bound as input n grows. O(n) means time grows linearly. Constants dropped because at scale n dominates — O(2n) is O(n). We optimize for growth: O(n²) fails where O(n log n) succeeds on millions of rows.', { followUps: ['Best vs average vs worst case?', 'Amortized O(1) for Python list append?'] }),
      qa('Analyze: nested loop where inner runs i times (i from 0 to n).', 'Medium', 'Coding', 'Loop pattern recognition.', 'Iterations: 0+1+2+...+(n-1) = n(n-1)/2 → **O(n²)** time, O(1) extra space. Triangular loops are quadratic. Often optimizable to O(n) with hash map when problem is complement-finding.', { followUps: ['What if inner is log i?', 'How would you profile to verify?'], standOutTip: 'Write the sum formula — shows math confidence.' }),
      qa('Two Sum — brute force vs optimal. Complexity of each?', 'Medium', 'Coding', 'Space-time trade-off.', 'Brute: double loop → **O(n²)** time, O(1) space. Optimal: one-pass hash map storing target - num → **O(n)** time, **O(n)** space. Standard answer: trade memory for speed. Handle duplicates and invalid input explicitly.', { followUps: ['Three Sum approach?', 'Sorted array — two pointers?'] }),
      qa('When is O(n log n) unavoidable?', 'Hard', 'Technical', 'Algorithm lower bounds.', 'Comparison-based sorting lower bound Ω(n log n). Problems reducible to sorting inherit it. Merge sort guaranteed O(n log n); quicksort average same, worst O(n²). Counting/radix sort beat it when keys are bounded integers.', { followUps: ['Sort 1GB on disk?', 'Streaming top-k without full sort?'] }),
      qa('Space complexity: recursive DFS vs iterative BFS on a tree.', 'Hard', 'Technical', 'Memory-aware traversal.', 'DFS recursion: **O(h)** call stack, h = height — O(n) skewed tree, O(log n) balanced BST. BFS queue: **O(w)** max width — bottom level can be n/2 → O(n). Deep skinny trees: prefer iterative DFS with explicit stack.', { followUps: ['Tail recursion in Python?', 'Cycle detection space on graphs?'] }),
      qa('Given n ≤ 10⁴, is O(n²) acceptable?', 'Medium', 'Technical', 'Practical judgment.', '10⁸ operations may pass in 1–2 seconds in Python for simple ops — often yes in interviews if no better approach quickly. At n = 10⁶, O(n²) fails — must optimize. Always state constraint before judging.', { standOutTip: 'Seniors mention constraints before complexity verdict.' }),
      qa('How does a database index change query complexity?', 'Medium', 'System', 'Production link.', 'Full table scan O(n) rows. B-tree index lookup O(log n) — critical at millions of rows. Trade-off: index slows writes, uses disk. I index columns in WHERE/JOIN that appear in hot queries.', { followUps: ['Composite index order?'] }),
      qa('Walk through complexity of your last coding solution.', 'Medium', 'Behavioral', 'Self-analysis habit.', 'In Constel lab I used nested loop first — O(n²). Reviewer asked optimization; I switched to set membership — O(n) time O(n) space. Measured with timing on 10k rows before submitting PR.', { followUps: ['What if interviewer disagrees?'] }),
    ],
    unpredictablePlaybook: clarify('complexity analysis'),
    convinceInterviewer: [
      ...convince,
      'State complexity **after** describing approach — design first, analyze second.',
      'Mention constraints: "For n ≤ 10⁴, O(n²) may pass; at production scale I would index or hash."',
    ],
    redFlags,
    mockDialogue: [
      { speaker: 'Interviewer', line: 'Can you do Two Sum in O(1) space?' },
      { speaker: 'Candidate', line: 'Not on unsorted array in one pass without extra structure. If sorted, two pointers use O(1) extra. Hash map trades O(n) space for O(n) time — standard trade-off.' },
      { speaker: 'Interviewer', line: 'This loop looks O(n) to me but you said O(n log n).' },
      { speaker: 'Candidate', line: 'The inner call is sort on shrinking array — each sort is O(k log k); summed across n gives O(n log n). Happy to re-derive on board.' },
    ],
    practicePlan: ['Analyze 5 loops from Week 4 lessons aloud', 'Solve Two Sum + Three Sum on paper with complexity', 'Explain one DB index as complexity win', 'Mock: interviewer pastes snippet — analyze live'],
  },

  'machine coding': {
    topic: 'Machine Coding Round',
    sessionGoal: 'Ship a **working UI in 90–120 minutes** while thinking aloud — the Flipkart/Amazon/startup round that tests structure, state, and grace under changing requirements.',
    roundTypes: ['90-min live React/Next build (todo, table, filters)', 'Extension round: "add debounced search" with 20 min left', 'Post-build walkthrough of your commits and trade-offs'],
    evaluationRubrics: rubrics('machine coding'),
    questions: [
      qa('How do you approach a 90-minute "build a todo app with filters" round?', 'Medium', 'Coding', 'Time-boxed delivery process.', '**0–10 min:** clarify CRUD, persist, filters. **10–20:** sketch App, TodoList, TodoItem, FilterBar. **20–60:** vertical slice — add todo works. **60–80:** filters + empty states. **80–90:** demo + cleanup. Familiar stack only; skip auth unless required.', { followUps: ['localStorage added mid-round?', 'How show progress to interviewer?'], standOutTip: 'Confirm scope aloud — prevents building wrong thing.' }),
      qa('What folder structure in a timed React app?', 'Medium', 'Technical', 'Pragmatic architecture.', 'Flat-first: components/, hooks/, types/, utils/. One component per file. Extract useTodos when logic grows. No premature features/ layers in 90 min — working demo beats enterprise patterns under clock.', { followUps: ['Context vs prop drilling?', 'TypeScript worth the time?'] }),
      qa('Interviewer adds debounced search with 20 minutes left. Response?', 'Hard', 'Coding', 'Adaptability under pressure.', 'Acknowledge scope: implement debounce on filter input, keep existing logic. useEffect + cleanup or 10-line debounce util — skip heavy libraries. Narrate: "300ms debounce reduces re-filters while typing." Do not refactor entire app silently.', { followUps: ['How test debounce?', 'Client filter vs API search?'] }),
      qa('How show production mindset in machine coding?', 'Hard', 'Behavioral', 'Beyond happy path.', 'Empty states, loading flags, try/catch on fetch, semantic HTML, keyboard focus. Clear naming. Say: "In prod I would add tests for useTodos and API contract." Demonstrates you ship safely.', { followUps: ['Write one test if time left?'] }),
      qa('Stuck on CSS layout — what do you do?', 'Medium', 'Coding', 'Pragmatism.', 'Flexbox quick fix, move on. Say: "Functional layout now; I would polish with design system in prod." Function over pixel-perfect — interviewers reward progress.', { standOutTip: 'Never go silent for 10 minutes on CSS.' }),
      qa('Requirement vague: "make it like Notion". How proceed?', 'Medium', 'System', 'Requirement narrowing.', 'Pick 3 concrete features: create block, edit inline, delete. Confirm: "I will scope to these for today." Prevents scope creep and shows product thinking.', { followUps: ['What if they reject scope?'] }),
      qa('Why not Redux for machine coding?', 'Medium', 'Technical', 'Tooling judgment.', 'For single-page todo, useState + lifted state is enough — less boilerplate in 90 min. Redux Toolkit when many routes share cart/auth state. Right-size tools to time box.', { followUps: ['When would you reach for Zustand?'] }),
      qa('Describe your communication cadence during the round.', 'Easy', 'Behavioral', 'Senior signal.', 'Check-in every 10–15 min: "Next I will wire filters, then edge cases." Ask clarifying questions early. If blocked 5+ min, state hypothesis and ask hint. Silence reads as stuck; narration reads as senior.', { followUps: ['What if interviewer is quiet?'] }),
    ],
    unpredictablePlaybook: clarify('machine coding'),
    convinceInterviewer: [
      ...convince,
      '**Think aloud** — silence reads as stuck; narration reads as senior.',
      'Deliver **MVP first** — working demo beats perfect architecture.',
      'When scope expands, state **what you defer** (auth, pagination) — shows prioritization.',
    ],
    redFlags,
    mockDialogue: [
      { speaker: 'Interviewer', line: 'Why not use Redux?' },
      { speaker: 'Candidate', line: 'For this scope useState is enough — less boilerplate in 90 min. I would use Redux Toolkit if we had shared cart across ten routes.' },
      { speaker: 'Interviewer', line: 'You have 15 minutes — add pagination.' },
      { speaker: 'Candidate', line: 'I will add page state, slice the list client-side, and stub hooks for server pagination — full server-side if we had API contract.' },
    ],
    practicePlan: ['90-min timer: todo + filter + localStorage', '90-min: paginated table mock', 'Practice narrating every 5 min while coding', 'Replicate one public machine-coding walkthrough on YouTube'],
  },
};

/** Topic alias → bank key */
const ALIASES: Record<string, string> = {
  'developer tooling questions': 'git basics',
  'linux troubleshooting scenarios': 'git basics',
  'debugging questions': 'output prediction',
  'python memory & references': 'output prediction',
  'logical coding rounds': 'output prediction',
  'complexity basics in loops': 'output prediction',
  'coding rounds': 'output prediction',
  'python interviews': 'output prediction',
  'debugging interviews': 'output prediction',
  'react performance questions': 'react fundamentals',
  'component design': 'react fundamentals',
  'next.js interviews': 'react fundamentals',
  'rendering strategies': 'react fundamentals',
  'frontend system design': 'react fundamentals',
  'frontend interviews': 'react fundamentals',
  'llm fundamentals': 'rag architecture',
  'transformer architecture': 'rag architecture',
  'embedding interview questions': 'rag architecture',
  'retrieval evaluation': 'rag architecture',
  'chunking trade-offs': 'rag architecture',
  'ai architecture discussions': 'rag architecture',
  'prompt engineering rounds': 'rag architecture',
  'ai engineering interviews': 'rag architecture',
  'security interviews': 'jwt deep dive',
  'owasp api top 10': 'jwt deep dive',
  'backend api design': 'jwt deep dive',
  'middleware patterns': 'jwt deep dive',
  'object-oriented programming': 'oop design',
  'classes & objects': 'oop design',
  'solid principles': 'oop design',
  'design patterns': 'oop design',
  'oop interviews': 'oop design',
  'time & space complexity': 'big o analysis',
  'big-o notation': 'big o analysis',
  'algorithm complexity': 'big o analysis',
  'data structures interviews': 'big o analysis',
  'machine coding round': 'machine coding',
  'ui coding interviews': 'machine coding',
  'live coding frontend': 'machine coding',
  'behavioral & hr': 'hr simulations',
  'hr round': 'hr simulations',
  'tell me about yourself': 'hr simulations',
  'resume preparation': 'hr simulations',
  'github portfolio review': 'git basics',
  'portfolio & resume': 'hr simulations',
  'algorithm optimization': 'big o analysis',
  'big-o interview questions': 'big o analysis',
  'oop design interviews': 'oop design',
  'solid principles scenarios': 'oop design',
  'recursion': 'output prediction',
  'function design questions': 'oop design',
  'aptitude': 'hr simulations',
  'interview consolidation': 'hr simulations',
  'docker interview questions': 'git basics',
  'devops fundamentals': 'git basics',
  'deployment scenarios': 'machine coding',
  'real-time system design': 'react fundamentals',
  'websocket vs sse': 'react fundamentals',
};

function generateFallbackSpec(
  topic: string,
  trackSlug: string,
  trackName: string,
  weekTitle: string,
): InterviewModuleSpec {
  const domain = trackSlug.includes('ai')
    ? 'AI engineering'
    : trackSlug.includes('full-stack')
      ? 'full-stack product engineering'
      : 'Python backend engineering';

  const questions: InterviewQA[] = [
    qa(`Explain ${topic} as if to a junior developer on your team.`, 'Easy', 'Technical', 'Teaching ability and clarity.', `${topic} is a core concept in ${weekTitle}. I would explain: what problem it solves, when to use it, one concrete example from my Constel lab, and one common mistake to avoid. Then I would whiteboard or show code.`, { standOutTip: 'Use analogy — interviewers remember stories.' }),
    qa(`Describe a real scenario where ${topic} mattered in production.`, 'Medium', 'Behavioral', 'Practical relevance.', `In ${domain} work, ${topic} appears when shipping features under deadline. Example: during API integration lab I applied ${topic} to validate inputs and reduce errors before deploy. Impact: fewer failed requests and faster code review.`, { followUps: ['What would you do differently?'] }),
    qa(`What are the top 3 mistakes juniors make with ${topic}?`, 'Medium', 'Technical', 'Depth and mentorship mindset.', 'One: skipping edge cases and error handling. Two: copy-paste without understanding trade-offs. Three: not testing locally before PR. I actively avoid these by checklist and peer review.', { standOutTip: 'Show you learn from others\' code reviews.' }),
    qa(`How would you debug an issue related to ${topic}?`, 'Hard', 'Technical', 'Systematic thinking.', 'Reproduce with minimal input, read logs/stack trace, isolate variables, check recent changes in Git, form hypothesis, test fix, add regression test, document in PR.', { codeSnippet: '# 1 reproduce  2 read error  3 isolate  4 fix  5 test' }),
    qa(`Compare ${topic} to an alternative approach.`, 'Medium', 'Technical', 'Trade-off thinking.', `I would name the main alternative, compare on complexity, performance, maintainability, and team familiarity. For ${topic} I choose it when [criteria]. I would switch when [other criteria]. No silver bullet.`, { followUps: ['Interviewer may push "always use X?" — resist absolutes.'] }),
    qa(`Whiteboard: design a small feature using ${topic}.`, 'Hard', 'System', 'Applied design.', 'Clarify requirements and users. Sketch API/data flow. Identify components. Discuss failure modes and tests. Estimate rough complexity. Mention monitoring if production.', { standOutTip: 'Think aloud entire time.' }),
    qa(`Tell me about a time you did not know the answer involving ${topic}.`, 'Medium', 'Behavioral', 'Honesty under pressure.', 'I said I had not encountered that variant, walked through how I would research official docs, reproduce in sandbox, ask senior with minimal question, and document learnings. I followed up after interview with what I learned.', { followUps: ['Never fake deep expertise.'] }),
    qa(`Why is ${topic} important for ${trackName}?`, 'Easy', 'Technical', 'Program alignment.', `This track builds ${domain} skills. ${topic} connects directly to weekly labs, the 50-question assessment, and capstone delivery. Mastering it accelerates internship productivity in week 1.`, { standOutTip: 'Link to Constel weekly evaluation — shows you take program seriously.' }),
  ];

  return {
    topic,
    sessionGoal: `After this session you will confidently handle ${domain} interview questions on **${topic}** — with model answers, follow-up survival tactics, and the confidence to think aloud when surprised.`,
    roundTypes: [
      'Online aptitude + technical MCQ (30–45 min)',
      `Focused ${topic} deep dive (20 min) with senior engineer`,
      'Live coding or system sketch on shared editor',
      'HR / culture fit (if applicable)',
    ],
    evaluationRubrics: rubrics(topic),
    questions,
    unpredictablePlaybook: clarify(topic),
    convinceInterviewer: convince,
    redFlags,
    mockDialogue: [
      { speaker: 'Interviewer', line: `I will ask something outside the syllabus on ${topic}. Ready?` },
      { speaker: 'Candidate', line: 'I will clarify the question, state what I know confidently, reason through the rest step by step, and flag any assumptions I am making.' },
      { speaker: 'Interviewer', line: 'Your answer differs from textbook. Convince me.' },
      { speaker: 'Candidate', line: 'Textbook describes ideal case — in our lab we hit constraint X, so I chose Y because measurable outcome Z improved. Happy to revisit if your production constraints differ.' },
      { speaker: 'Interviewer', line: 'Any questions?' },
      { speaker: 'Candidate', line: 'What skills distinguish interns who get return offers? And how does the team approach mentorship in the first month?' },
    ],
    practicePlan: [
      `Answer all 8 questions aloud — record and review filler words`,
      `Write bullet STAR story linking ${topic} to a Constel lab`,
      `10-min mock with peer — they probe with "why?" three times each answer`,
      `Review Week lessons on ${weekTitle} — quiz topics overlap interview`,
      `Prepare 3 follow-up questions to ask the interviewer`,
    ],
  };
}

export function getInterviewSpec(
  topic: string,
  trackSlug: string,
  trackName: string,
  weekTitle: string,
): InterviewModuleSpec {
  const key = topic.toLowerCase().trim();
  const bankKey = ALIASES[key] ?? key;
  const spec = SPECS[bankKey];
  if (spec) {
    return { ...spec, topic }; // preserve display title from curriculum
  }
  return generateFallbackSpec(topic, trackSlug, trackName, weekTitle);
}
