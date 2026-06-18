/**
 * Topic knowledge registry — compact specs expanded into full lessons by lesson-builder.
 */
import { TopicKnowledge } from '../lesson-builder';

type KnowledgeMap = Record<string, TopicKnowledge>;

const wm = (reason: string, detail: string) => ({ reason, detail });

function k(partial: TopicKnowledge): TopicKnowledge {
  return partial;
}

/** Shared fallback when no exact match — still expanded by depth-enricher */
export function defaultKnowledge(topic: string, trackName: string, lang: string): TopicKnowledge {
  return k({
    definition: `**${topic}** is a production-grade skill in ${trackName}. Unlike surface tutorials, this lesson trains you to **use** the concept: run commands, write code, debug failures, and explain trade-offs in code review — the same loop used across a 6-month internship.`,
    memoryTrick: `Associate "${topic}" with one terminal command + one code file you can demo without notes.`,
    whyMatters: [
      wm('Daily work', `Teams reference ${topic} in standups, PRs, and incident channels weekly.`),
      wm('Interviews', `Expect conceptual, output-prediction, and "debug this" questions on ${topic}.`),
      wm('Capstone', 'Week 8 projects combine multiple topics — weak fundamentals show immediately.'),
      wm('Career velocity', 'Engineers who master fundamentals ship features in week 1 of internships.'),
      wm('Debugging', 'Most production bugs are misunderstood basics, not magic framework issues.'),
    ],
    sections: [
      {
        heading: 'Concept Breakdown',
        content: `| Layer | You learn |\n|-------|----------|\n| **What** | Precise definition of ${topic} |\n| **Why** | Business and technical reason it exists |\n| **How** | Commands + code patterns below |\n| **When** | Situations to use vs avoid |\n| **Pitfalls** | Mistakes seniors see in junior code |`,
      },
      {
        heading: 'How Professionals Learn This',
        content: `1. Read this lesson (15–25 min)\n2. Run **every CLI command** in your terminal (10 min)\n3. Type **Example 1–3** without copy-paste (30 min)\n4. Break code intentionally — read errors (10 min)\n5. Answer practice questions closed-book (10 min)\n6. Connect to weekly lab (60+ min)\n\nThat is ~2–3 hours per topic — the pace of a 6-month program compressed into an intensive week.`,
      },
      {
        heading: 'Integration With This Week',
        content: `${topic} connects to other topics in the same module. In your weekly **50-question assessment**, expect MCQ, debugging, output prediction, and scenario questions tagged with this topic. Quizzes pull from lesson content — skimming guarantees failure.`,
      },
    ],
    codeExamples: [
      {
        lang,
        caption: 'Example 1 — Minimal working version',
        code: lang === 'python'
          ? `#!/usr/bin/env python3\n"""${topic} — Example 1"""\n\ndef main():\n    result = demonstrate_${topic.replace(/\W+/g, '_').toLowerCase()}()\n    print(result)\n\ndef demonstrate_${topic.replace(/\W+/g, '_').toLowerCase()}():\n    return {"topic": "${topic}", "status": "ok"}\n\nif __name__ == "__main__":\n    main()`
          : `// ${topic} — Example 1\nexport function demo${topic.replace(/\W+/g, '')}() {\n  return { topic: "${topic}", status: "ok" };\n}\n\nconsole.log(demo${topic.replace(/\W+/g, '')}());`,
      },
    ],
    pitfalls: [
      'Reading without running commands — you will fail labs and quizzes.',
      'Skipping edge cases (empty input, null, timeout, permissions).',
      'Not reading full error messages / stack traces.',
      'Copy-pasting from docs without understanding variable names and flow.',
      'Waiting until capstone week to practice — compound learning beats cramming.',
    ],
    practice: [
      { question: `Define ${topic} in one sentence a recruiter would understand.`, answer: 'Plain English + outcome, no internal jargon.' },
      { question: `Which CLI command from this lesson helps verify ${topic}?`, answer: 'Name command + what output proves success.' },
      { question: `One bug you could introduce if you misuse ${topic}?`, answer: 'Specific failure mode + how to detect it.' },
    ],
    cheatSheet: [
      `${topic}: definition + CLI + Example 2 + lab`,
      '2–3 hours per topic at internship pace',
      'Quiz = lesson content — no shortcuts',
    ],
  });
}

export const PYTHON_KNOWLEDGE: KnowledgeMap = {
  'linux basics': k({
    definition: '**Linux** is the open-source Unix-like OS kernel powering most cloud servers, Android, and developer machines. Engineers interact with Linux via the **shell** (bash/zsh) for deployment, debugging, and automation.',
    memoryTrick: 'Linux = where your code **runs in production** — learn the terminal early.',
    whyMatters: [
      wm('Cloud', 'AWS, GCP, Azure VMs run Linux — SSH is daily work.'),
      wm('Docker', 'Containers are Linux namespaces — files live at /app, /etc, /var.'),
      wm('CI/CD', 'GitHub Actions runners are Linux — scripts must be portable.'),
      wm('Interviews', '"How do you debug a production server?" expects Linux fluency.'),
    ],
    sections: [
      {
        heading: 'Filesystem Hierarchy (Memorize)',
        content: '| Path | Purpose |\n|------|--------|\n| `/home/user` | Your files |\n| `/etc` | Config files |\n| `/var/log` | Application logs |\n| `/tmp` | Temporary files |\n| `/usr/bin` | Installed programs |',
      },
      {
        heading: 'Permissions (rwx)',
        content: 'Every file has **user / group / others** permissions: read (r), write (w), execute (x). Use `chmod 755 script.sh` and `chown user:group file`. Never develop as **root** in production.',
      },
    ],
    codeExamples: [{ lang: 'bash', caption: 'Essential commands', code: 'pwd\nls -la\ncd ~/projects\nmkdir -p app/{src,tests}\ncat /var/log/syslog | tail -20\ngrep -r "ERROR" ./logs\nfind . -name "*.py"' }],
    comparisonTable: { headers: ['Command', 'Purpose'], rows: [['pwd', 'Print working directory'], ['ls -la', 'List all files with details'], ['chmod', 'Change permissions'], ['grep', 'Search text in files']] },
    pitfalls: ['Running `rm -rf /` or wrong path — double-check paths.', 'Ignoring permission denied — fix with chmod/chown, not sudo habit.', 'Not knowing where logs live — check /var/log first.'],
    practice: [
      { question: 'What does `ls -la` show that `ls` does not?', answer: 'Hidden files (.) and detailed metadata (permissions, size, date).' },
      { question: 'Where are system logs typically stored?', answer: '/var/log (e.g. syslog, nginx, app logs).' },
    ],
    cheatSheet: ['pwd = where am I', 'ls -la = list all', '/etc = config', '/var/log = logs', 'never rm -rf without verifying path'],
  }),

  'terminal usage': k({
    definition: 'The **terminal** (shell) is a text interface to your OS. Engineers chain commands, script workflows, and automate tasks faster than GUI clicks.',
    memoryTrick: 'Terminal = **speed + repeatability** — anything you do twice, script it.',
    whyMatters: [wm('Automation', 'Deploy, test, grep logs — all terminal-first.'), wm('Remote work', 'SSH has no GUI — terminal is your only UI.'), wm('Git', 'All version control flows through shell commands.')],
    sections: [
      { heading: 'Pipes & Redirection', content: '`|` passes output to next command. `>` writes stdout to file. `2>&1` merges stderr. Example: `python app.py 2>&1 | tee run.log`' },
      { heading: 'Environment Variables', content: '`export API_KEY=xxx` sets vars for child processes. `.env` files load secrets — never commit them to Git.' },
    ],
    codeExamples: [{ lang: 'bash', code: 'history | grep git\nwhich python3\necho $PATH\npython script.py > out.txt 2> err.txt\ncat file | wc -l' }],
    pitfalls: ['Spaces in paths without quotes.', 'Forgetting `chmod +x` on scripts.', 'Not using tab completion.'],
    practice: [{ question: 'What does `cmd1 | cmd2` do?', answer: 'Pipes stdout of cmd1 as stdin to cmd2.' }],
    cheatSheet: ['| = pipe', '> = redirect out', '2> = redirect errors', 'export VAR=val', 'man cmd = manual'],
  }),

  'vs code mastery': k({
    definition: '**VS Code** is the industry-standard editor with extensions for Python, Git, Docker, and remote development. Mastery means keyboard shortcuts, debugging, and integrated terminal — not just typing code.',
    memoryTrick: 'F5 = debug, Ctrl+` = terminal, Ctrl+Shift+P = command palette.',
    whyMatters: [wm('Speed', 'Shortcuts save hours per week.'), wm('Debugging', 'Breakpoints beat print() in production code.'), wm('Teams', 'Shared settings and extensions reduce onboarding friction.')],
    sections: [
      { heading: 'Must-Know Features', content: '- **Integrated terminal** — run tests without leaving editor\n- **Debugger** — breakpoints, watch variables, call stack\n- **Git lens** — blame, diff, stage from sidebar\n- **Extensions** — Python, Pylance, Prettier, ESLint\n- **Multi-cursor** — Alt+Click for bulk edits' },
    ],
    codeExamples: [{ lang: 'json', caption: 'launch.json snippet', code: '{\n  "version": "0.2.0",\n  "configurations": [{\n    "name": "Python: Current File",\n    "type": "debugpy",\n    "request": "launch",\n    "program": "${file}"\n  }]\n}' }],
    pitfalls: ['Not using a venv — wrong Python interpreter.', 'Ignoring linter squiggles until PR rejection.', 'No format-on-save — inconsistent style.'],
    practice: [{ question: 'How do you set a breakpoint?', answer: 'Click gutter left of line number or F9 — run with F5.' }],
    cheatSheet: ['Ctrl+` = terminal', 'F5 = debug', 'Ctrl+Shift+P = commands', 'Ctrl+P = open file'],
  }),

  'git & github': k({
    definition: '**Git** tracks every code change locally; **GitHub** hosts remotes for collaboration via branches, pull requests, and code review.',
    memoryTrick: 'Commit = save snapshot. Branch = parallel timeline. PR = ask team to merge.',
    whyMatters: [wm('Collaboration', 'No Git = no team software job.'), wm('Rollback', 'Revert bad deploys from history.'), wm('Portfolio', 'Internship reviewers check your GitHub activity.')],
    sections: [
      { heading: 'Daily Workflow', content: '`git pull` → edit → `git add` → `git commit -m "msg"` → `git push` → open **Pull Request** → address review → merge.' },
      { heading: 'Branching Model', content: '`main` = production-ready. `feature/login` = your work. Never commit secrets. Use `.gitignore` for `.env`, `node_modules`, `__pycache__`.' },
    ],
    codeExamples: [{ lang: 'bash', code: 'git clone https://github.com/org/repo.git\ngit checkout -b feature/cli-tool\ngit add .\ngit commit -m "feat: add validation module"\ngit push -u origin feature/cli-tool\ngit log --oneline -5\ngit diff main' }],
    comparisonTable: { headers: ['Command', 'Action'], rows: [['git status', 'See changed files'], ['git add', 'Stage changes'], ['git commit', 'Save snapshot'], ['git push', 'Upload to remote'], ['git pull', 'Download + merge remote']] },
    pitfalls: ['Committing `.env` with API keys.', 'Huge commits without messages.', 'Working on main instead of feature branch.'],
    practice: [{ question: 'Difference between merge and rebase?', answer: 'Merge preserves branch history with merge commit; rebase replays commits linearly on top of target branch.' }],
    cheatSheet: ['pull → edit → add → commit → push → PR', 'main = sacred', '.gitignore secrets'],
  }),

  'python environment setup': k({
    definition: 'A **Python environment** isolates project dependencies (packages, Python version) so projects do not conflict. Standard tools: **venv**, **pip**, and optionally **pyenv** or **conda**.',
    memoryTrick: 'One project = one venv. Activate before pip install.',
    whyMatters: [wm('Reproducibility', 'requirements.txt pins versions for teammates.'), wm('CI/CD', 'Build servers recreate your venv exactly.'), wm('Debugging', 'Wrong package version causes mysterious import errors.')],
    sections: [{ heading: 'Standard Setup', content: '1. Install Python 3.11+\n2. `python3 -m venv .venv`\n3. `source .venv/bin/activate` (Mac/Linux)\n4. `pip install -r requirements.txt`\n5. Select interpreter in VS Code' }],
    codeExamples: [{ lang: 'bash', code: 'python3 --version\npython3 -m venv .venv\nsource .venv/bin/activate\npip install requests pytest\npip freeze > requirements.txt' }],
    pitfalls: ['Installing globally without venv.', 'Not pinning versions in requirements.txt.', 'Python 2 vs 3 confusion — always use 3.'],
    practice: [{ question: 'Why use venv?', answer: 'Isolates dependencies per project — avoids version conflicts between projects.' }],
    cheatSheet: ['python3 -m venv .venv', 'source .venv/bin/activate', 'pip freeze > requirements.txt'],
  }),

  'debugging mindset': k({
    definition: '**Debugging** is systematic problem-solving: reproduce → isolate → hypothesize → test → fix. It is a skill, not guessing.',
    memoryTrick: 'Read the **full** error message — the last line is a clue, the stack trace is the map.',
    whyMatters: [wm('Productivity', 'Senior engineers debug faster — same tools, better process.'), wm('Interviews', '"How did you fix a bug?" is guaranteed.'), wm('Production', 'Incidents need calm, reproducible diagnosis.')],
    sections: [
      { heading: 'The IDE Loop', content: '**I**nput — what should happen?\n**D**ebug — reproduce minimally\n**E**xecute — fix and add test\n**R**egress — ensure fix does not break other cases' },
      { heading: 'Tools', content: 'print/logging, breakpoints, `pdb`, rubber duck (explain aloud), git bisect for "when did this break?"' },
    ],
    codeExamples: [{ lang: 'python', code: 'import logging\nlogging.basicConfig(level=logging.DEBUG)\n\ndef divide(a, b):\n    logging.debug(f"divide({a}, {b})")\n    if b == 0:\n        raise ValueError("b cannot be zero")\n    return a / b' }],
    pitfalls: ['Changing multiple things at once.', 'Ignoring edge cases.', 'Not writing a test after fixing.'],
    practice: [{ question: 'First step when code fails?', answer: 'Reproduce with smallest input; read full traceback.' }],
    cheatSheet: ['reproduce → read error → isolate → fix → test'],
  }),

  'computational thinking': k({
    definition: '**Computational thinking** decomposes problems into patterns: decomposition, abstraction, algorithms, and evaluation — before writing code.',
    memoryTrick: 'Pseudocode first, Python second.',
    whyMatters: [wm('Design', 'Bad structure cannot be saved by syntax.'), wm('Interviews', 'Explain approach before coding.'), wm('Scalability', 'Right algorithm beats faster hardware.')],
    sections: [{ heading: 'Four Pillars', content: '1. **Decomposition** — break into sub-problems\n2. **Pattern recognition** — reuse known solutions\n3. **Abstraction** — hide details behind interfaces\n4. **Algorithm design** — step-by-step procedure with clear stop condition' }],
    codeExamples: [{ lang: 'python', code: '# Decompose: validate → process → format\ndef pipeline(raw):\n    clean = validate(raw)\n    result = transform(clean)\n    return format_output(result)' }],
    pitfalls: ['Jumping to code without plan.', 'Over-engineering first version.', 'No complexity analysis.'],
    practice: [{ question: 'Decompose "ATM withdrawal".', answer: 'Check balance → validate amount → dispense → log transaction → update balance.' }],
    cheatSheet: ['decompose → pattern → abstract → algorithm → code'],
  }),

  loops: k({
    definition: '**Loops** repeat code until a condition is met. Python has `for` (iterate sequences) and `while` (condition-driven).',
    memoryTrick: 'for = known iterations. while = unknown until condition false.',
    whyMatters: [wm('Data processing', 'Every list/file/API batch uses loops.'), wm('Performance', 'Wrong loop structure = O(n²) disasters.'), wm('Interviews', 'Output prediction on loops is very common.')],
    sections: [
      { heading: 'for vs while', content: '| Loop | Use when |\n|------|----------|\n| `for x in seq` | Known collection or range |\n| `while cond` | Wait for event / unknown count |\n| `break` | Exit loop early |\n| `continue` | Skip to next iteration |' },
    ],
    codeExamples: [{ lang: 'python', code: 'for i in range(5):\n    print(i, end=" ")  # 0 1 2 3 4\n\ntotal = 0\nfor score in [85, 90, 78]:\n    total += score\nprint(total)  # 253\n\nn = 3\nwhile n > 0:\n    print(n)\n    n -= 1' }],
    pitfalls: ['Infinite while loops — ensure condition changes.', 'Modifying list while iterating — use copy or comprehension.', 'Off-by-one errors with range.'],
    practice: [
      { question: 'Output?', code: 'for i in range(3):\n    print(i * 2)', answer: '0, 2, 4 (each on new line).' },
      { question: 'Sum 1 to 5 using loop?', answer: 'Use total=0; for i in range(1,6): total += i → 15.' },
    ],
    cheatSheet: ['for x in seq', 'while cond', 'break/continue', 'range(start, stop, step)'],
  }),

  conditions: k({
    definition: '**Conditionals** (`if` / `elif` / `else`) branch execution based on boolean expressions. Combined with truthy/falsy rules they control program flow.',
    memoryTrick: 'if asks a yes/no question — only one branch runs.',
    whyMatters: [wm('Validation', 'All user input checks use conditionals.'), wm('Business logic', 'Pricing, auth, feature flags = if chains.'), wm('Readability', 'Deep nesting is a code smell — refactor early.')],
    sections: [{ heading: 'Truthy / Falsy', content: 'Falsy: `0`, `0.0`, `""`, `[]`, `{}`, `set()`, `None`, `False`. Everything else is truthy — including `[0]` and `"0"`.' }],
    codeExamples: [{ lang: 'python', code: 'score = 85\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelse:\n    grade = "C"\n\n# Ternary\nstatus = "pass" if score >= 40 else "fail"' }],
    pitfalls: ['Using `=` instead of `==`.', 'Chained comparisons: `0 < x < 10` is Pythonic.', 'Not handling else/edge cases.'],
    practice: [{ question: 'bool([]) and bool([0])?', answer: 'False and True — empty list falsy, non-empty truthy.' }],
    cheatSheet: ['if / elif / else', 'falsy: 0, "", [], {}, None', 'x if cond else y'],
  }),

  'nested logic': k({
    definition: '**Nested logic** combines loops and conditionals inside each other — pattern matching, grids, filters, and validation pipelines.',
    memoryTrick: 'Each nesting level = one more dimension of data.',
    whyMatters: [wm('Algorithms', 'Matrix ops, tree traversal start here.'), wm('Readability', 'Extract inner logic to functions when depth > 2.'), wm('Bugs', 'Off-by-one errors multiply with nesting.')],
    sections: [{ heading: 'Refactor Pattern', content: 'Instead of 4-level nesting, use **early continue** or **helper functions**:\n`for row in grid:\n    if not valid(row): continue\n    process(row)`' }],
    codeExamples: [{ lang: 'python', code: 'matrix = [[1,2],[3,4]]\nfor row in matrix:\n    for val in row:\n        print(val, end=" ")\n    print()\n\n# FizzBuzz\nfor n in range(1, 16):\n    if n % 15 == 0: print("FizzBuzz")\n    elif n % 3 == 0: print("Fizz")\n    elif n % 5 == 0: print("Buzz")\n    else: print(n)' }],
    pitfalls: ['God-nested if pyramids — extract functions.', 'Wrong indent = logic bugs in Python.'],
    practice: [{ question: 'Print matrix diagonal', answer: 'for i in range(len(m)): print(m[i][i])' }],
    cheatSheet: ['indent = block scope', 'early continue reduces nesting', 'extract helpers'],
  }),

  'computational optimization': k({
    definition: '**Optimization** improves time/space efficiency without changing correctness — choose better algorithms and data structures first, micro-optimize last.',
    memoryTrick: 'Measure before optimizing — premature optimization wastes time.',
    whyMatters: [wm('Scale', 'O(n²) breaks at 1M rows.'), wm('Cost', 'Cloud bills tie to CPU/memory.'), wm('Interviews', 'Always state complexity.')],
    sections: [{ heading: 'Big-O Quick Reference', content: '| Notation | Name | Example |\n|----------|------|--------|\n| O(1) | Constant | dict lookup |\n| O(log n) | Logarithmic | binary search |\n| O(n) | Linear | single loop |\n| O(n log n) | Linearithmic | sort |\n| O(n²) | Quadratic | nested loops |' }],
    codeExamples: [{ lang: 'python', code: '# Slow: O(n²) duplicate check\n# for x in arr:\n#     if x in arr2:  # list scan\n\n# Fast: O(n) with set\nseen = set(arr2)\nfor x in arr:\n    if x in seen:  # O(1)\n        print(x)' }],
    pitfalls: ['Optimizing before profiling.', 'Using list for membership in hot loop — use set.'],
    practice: [{ question: 'Complexity of nested loop over n?', answer: 'O(n²) if both iterate n items.' }],
    cheatSheet: ['profile first', 'set/dict for O(1) lookup', 'state Big-O in interviews'],
  }),

  'algorithm thinking': k({
    definition: '**Algorithm thinking** is designing step-by-step procedures with defined inputs, outputs, invariants, and termination — the bridge between problem and code.',
    memoryTrick: 'Invariant = what stays true each loop iteration.',
    whyMatters: [wm('DSA rounds', 'Required for product company interviews.'), wm('System design', 'Algorithms inside services (rate limit, cache).'), wm('Correctness', 'Proof of termination prevents infinite loops.')],
    sections: [{ heading: 'Design Steps', content: '1. Restate problem with examples\n2. Identify edge cases\n3. Choose data structure\n4. Write pseudocode\n5. Analyze complexity\n6. Code + test' }],
    codeExamples: [{ lang: 'python', code: 'def binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target: return mid\n        if arr[mid] < target: lo = mid + 1\n        else: hi = mid - 1\n    return -1' }],
    pitfalls: ['No edge case list.', 'Wrong loop condition in binary search.'],
    practice: [{ question: 'Find max in list — approach?', answer: 'Single pass O(n): max_val = arr[0]; for x in arr: max_val = max(max_val, x)' }],
    cheatSheet: ['examples → edges → DS → pseudocode → Big-O → code'],
  }),

  functions: k({
    definition: 'A **function** is a reusable named block with parameters and return value. Functions are first-class objects in Python — passed as arguments, stored in variables.',
    memoryTrick: 'def = define recipe. return = send result back. None = implicit return.',
    whyMatters: [wm('DRY', "Don't Repeat Yourself — extract repeated logic."), wm('Testing', 'Small functions = unit testable.'), wm('APIs', 'Every endpoint handler is a function.')],
    sections: [{ heading: 'Signature Best Practices', content: '- Type hints on public functions\n- Docstrings explain purpose + params\n- Pure functions when possible (no side effects)\n- Default args: never use mutable defaults like `def f(x=[])`' }],
    codeExamples: [{ lang: 'python', code: 'def greet(name: str, excited: bool = False) -> str:\n    """Return greeting string."""\n    msg = f"Hello, {name}"\n    return msg + "!" if excited else msg\n\nprint(greet("Arjun"))\nprint(greet("Priya", excited=True))' }],
    pitfalls: ['Mutable default arguments.', 'Functions that do too many things.', 'No return vs return None.'],
    practice: [{ question: 'What is wrong with def f(x=[])?', answer: 'Same list shared across calls — use None sentinel instead.' }],
    cheatSheet: ['def name(params) -> type', 'return value', 'avoid mutable defaults', 'docstring + type hints'],
  }),

  recursion: k({
    definition: '**Recursion** solves problems by calling itself on smaller sub-problems until a **base case** stops the chain.',
    memoryTrick: 'Every recursion needs base case + progress toward base case.',
    whyMatters: [wm('Trees/Graphs', 'Natural fit for nested structures.'), wm('Interviews', 'Factorial, Fibonacci, tree traversal staples.'), wm('Elegance', 'Some problems simpler recursive — but watch stack depth.')],
    sections: [{ heading: 'vs Iteration', content: 'Recursion uses call stack — deep recursion can hit limit. Tail recursion not optimized in Python — prefer iteration for deep loops.' }],
    codeExamples: [{ lang: 'python', code: 'def factorial(n: int) -> int:\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\ndef sum_list(nums, i=0):\n    if i >= len(nums):\n        return 0\n    return nums[i] + sum_list(nums, i + 1)' }],
    pitfalls: ['Missing base case → RecursionError.', 'Exponential Fibonacci without memoization.'],
    practice: [{ question: 'factorial(4)?', answer: '24' }],
    cheatSheet: ['base case required', 'smaller input each call', 'memoize repeated subproblems'],
  }),

  lambda: k({
    definition: '**Lambda** is an anonymous one-expression function: `lambda args: expression`. Used for short callbacks in `sorted()`, `map()`, GUI events.',
    memoryTrick: 'Lambda = one-liner only — complex logic needs def.',
    whyMatters: [wm('Sorting', 'key=lambda x: x[1] for custom sort.'), wm('FP style', 'Pairs with map/filter.'), wm('Readability', 'Overuse hurts — name important logic.')],
    sections: [{ heading: 'When to Use', content: 'Good: sort keys, simple map. Bad: 5-line lambda — use def instead.' }],
    codeExamples: [{ lang: 'python', code: 'pairs = [("b", 2), ("a", 3)]\nsorted_pairs = sorted(pairs, key=lambda p: p[1])\n\ndouble = lambda x: x * 2\nprint(list(map(double, [1, 2, 3])))  # [2, 4, 6]' }],
    pitfalls: ['Multi-statement lambdas — invalid in Python.', 'Unreadable nested lambdas.'],
    practice: [{ question: 'Sort strings by length', answer: 'sorted(words, key=lambda s: len(s))' }],
    cheatSheet: ['lambda x: expr', 'use with sorted/map/filter', 'prefer def if complex'],
  }),

  'map/filter/reduce': k({
    definition: '**map** transforms each item, **filter** keeps items matching predicate, **reduce** (functools.reduce) folds sequence to single value — functional patterns for clean data pipelines.',
    memoryTrick: 'map = transform all. filter = keep some. reduce = combine to one.',
    whyMatters: [wm('Data pipelines', 'ETL and API response shaping.'), wm('Readability', 'List comprehensions often clearer in Python.'), wm('Interviews', 'Explain map vs comprehension trade-offs.')],
    sections: [{ heading: 'Comprehension Equivalent', content: '`[f(x) for x in items if pred(x)]` often replaces map+filter — more Pythonic.' }],
    codeExamples: [{ lang: 'python', code: 'from functools import reduce\n\nnums = [1, 2, 3, 4, 5]\nevens = list(filter(lambda x: x % 2 == 0, nums))\nsquared = list(map(lambda x: x ** 2, nums))\ntotal = reduce(lambda a, b: a + b, nums)\n\n# Pythonic\nsquared2 = [x ** 2 for x in nums if x % 2 == 1]' }],
    pitfalls: ['map(lambda...) when comprehension clearer.', 'reduce overuse — sum() built-in exists.'],
    practice: [{ question: 'Filter positive from list', answer: '[x for x in nums if x > 0] or list(filter(lambda x: x>0, nums))' }],
    cheatSheet: ['map(fn, iter)', 'filter(pred, iter)', 'reduce(fn, iter, init)', 'prefer comprehensions'],
  }),

  'modular architecture': k({
    definition: '**Modular architecture** splits code into packages/modules with clear boundaries — each file has one responsibility, imports form a directed graph without cycles.',
    memoryTrick: 'If a file needs a comment "this does everything" — split it.',
    whyMatters: [wm('Teams', 'Modules = ownership boundaries.'), wm('Testing', 'Mock at module boundaries.'), wm('Onboarding', 'New devs navigate by folder structure.')],
    sections: [{ heading: 'Python Package Layout', content: '```\nproject/\n  src/\n    app/\n      __init__.py\n      models.py\n      services.py\n      cli.py\n  tests/\n  requirements.txt\n```' }],
    codeExamples: [{ lang: 'python', code: '# services/user_service.py\nfrom models.user import User\n\ndef get_user(user_id: str) -> User:\n    ...\n\n# cli.py\nfrom services.user_service import get_user' }],
    pitfalls: ['Circular imports.', 'Giant single file.', 'No __init__.py in packages (older Python).'],
    practice: [{ question: 'Sign of good module?', answer: 'Single responsibility, clear public API, testable in isolation.' }],
    cheatSheet: ['one job per module', 'no circular imports', 'tests mirror src layout'],
  }),

  arrays: k({
    definition: 'In Python, **arrays** are typically **`list`** (dynamic) or **`array.array`** (typed C-style). Lists are the default sequential container.',
    memoryTrick: 'list = Python array — append O(1) amortized, insert middle O(n).',
    whyMatters: [wm('DSA', 'Foundation for stacks, queues, matrices.'), wm('APIs', 'JSON arrays → Python lists.'), wm('Performance', 'Wrong structure = slow scans.')],
    sections: [{ heading: 'List Operations', content: '| Op | Complexity |\n|----|------------|\n| index access | O(1) |\n| append | O(1) amortized |\n| insert middle | O(n) |\n| search unsorted | O(n) |' }],
    codeExamples: [{ lang: 'python', code: 'nums = [10, 20, 30]\nnums.append(40)\nnums.insert(0, 5)\nprint(nums[1:3])  # slice\nprint(len(nums))' }],
    pitfalls: ['Using list as queue — use collections.deque.', 'Shallow copy vs deep copy confusion.'],
    practice: [{ question: 'Reverse list without reverse()', answer: 'nums[::-1] or two-pointer swap.' }],
    cheatSheet: ['[] list', 'append/pop', 'slice [start:stop]', 'len(), in O(n)'],
  }),

  stacks: k({
    definition: 'A **stack** is LIFO (Last In, First Out) — push/pop from one end. Use `list` with append/pop or `collections.deque`.',
    memoryTrick: 'Stack = plate stack — take from top.',
    whyMatters: [wm('Parsing', 'Bracket matching, undo systems.'), wm('DFS', 'Graph traversal uses stack.'), wm('Interviews', 'Classic stack problems common.')],
    sections: [{ heading: 'Use Cases', content: '- Valid parentheses\n- Browser back button\n- Call stack in recursion\n- Expression evaluation' }],
    codeExamples: [{ lang: 'python', code: 'stack = []\nstack.append(1)\nstack.append(2)\ntop = stack.pop()  # 2\n\ndef is_valid_parens(s):\n    stack = []\n    pairs = {")": "(", "]": "[", "}": "{"}\n    for c in s:\n        if c in pairs.values(): stack.append(c)\n        elif c in pairs:\n            if not stack or stack.pop() != pairs[c]: return False\n    return not stack' }],
    pitfalls: ['pop from empty stack → IndexError.', 'Using insert(0) as stack — O(n).'],
    practice: [{ question: 'is_valid_parens("()[]")?', answer: 'True' }],
    cheatSheet: ['LIFO', 'append + pop', 'deque for performance'],
  }),

  queues: k({
    definition: 'A **queue** is FIFO (First In, First Out) — enqueue back, dequeue front. Use `collections.deque`, not list.pop(0).',
    memoryTrick: 'Queue = ticket line — first come, first served.',
    whyMatters: [wm('BFS', 'Graph level-order traversal.'), wm('Systems', 'Job queues, message brokers.'), wm('Async', 'Task scheduling patterns.')],
    sections: [{ heading: 'deque Pattern', content: '`from collections import deque`\n`q = deque()`\n`q.append(item)` enqueue\n`q.popleft()` dequeue O(1)' }],
    codeExamples: [{ lang: 'python', code: 'from collections import deque\n\nq = deque(["task1", "task2"])\nq.append("task3")\nfirst = q.popleft()  # task1' }],
    pitfalls: ['list.pop(0) is O(n) — use deque.'],
    practice: [{ question: 'Why not list for queue?', answer: 'pop(0) shifts all elements — O(n) per dequeue.' }],
    cheatSheet: ['FIFO', 'deque append + popleft', 'BFS uses queue'],
  }),

  dictionaries: k({
    definition: 'Python **dict** is a hash map — O(1) average lookup by key. Keys must be immutable (str, int, tuple).',
    memoryTrick: 'dict = real-world dictionary — word (key) → definition (value).',
    whyMatters: [wm('JSON', 'API payloads are dicts.'), wm('Caching', 'Key-value stores mirror dicts.'), wm('Counting', 'freq[key] += 1 pattern everywhere.')],
    sections: [{ heading: 'Essential Methods', content: '`.get(k, default)` safe access\n`.keys()`, `.values()`, `.items()` iteration\n`.update(other)` merge\n`dict comprehension` for transforms' }],
    codeExamples: [{ lang: 'python', code: 'freq = {}\nfor word in ["a", "b", "a"]:\n    freq[word] = freq.get(word, 0) + 1\n\nuser = {"name": "Arjun", "role": "student"}\nprint(user.get("email", "N/A"))' }],
    pitfalls: ['KeyError on missing key — use .get().', 'Mutable keys forbidden.', 'Relying on insertion order before 3.7 (now guaranteed).'],
    practice: [{ question: 'Count char frequency', answer: 'Loop + dict with get or collections.Counter.' }],
    cheatSheet: ['{} dict', 'O(1) lookup', '.get safe', 'keys immutable'],
  }),

  sets: k({
    definition: 'A **set** stores unique unordered elements with O(1) average membership test.',
    memoryTrick: 'set = bag of unique items — duplicates vanish.',
    whyMatters: [wm('Dedup', 'Remove duplicates fast.'), wm('Logic', 'Union/intersection for tags, permissions.'), wm('Performance', 'O(1) in vs O(n) list scan.')],
    sections: [{ heading: 'Set Operations', content: '| Op | Syntax |\n|----|--------|\n| union | a \\| b |\n| intersection | a & b |\n| difference | a - b |\n| symmetric diff | a ^ b |' }],
    codeExamples: [{ lang: 'python', code: 'a = {1, 2, 3}\nb = {3, 4, 5}\nprint(a & b)  # {3}\nprint(a | b)  # {1,2,3,4,5}\n\nseen = set()\nfor x in data:\n    if x in seen: print("dup", x)\n    seen.add(x)' }],
    pitfalls: ['Sets are unordered — no indexing.', 'Only hashable elements.'],
    practice: [{ question: 'Remove duplicates from list', answer: 'list(set(items)) — order may change; use dict.fromkeys for order.' }],
    cheatSheet: ['{} or set()', 'unique only', '| & - ^ ops', 'O(1) in'],
  }),

  'searching/sorting': k({
    definition: '**Searching** finds elements (linear, binary). **Sorting** orders data (Timsort in Python — O(n log n)). Binary search requires sorted input.',
    memoryTrick: 'Sort first → binary search. Unsorted → linear scan or hash map.',
    whyMatters: [wm('Interviews', 'Binary search variants everywhere.'), wm('Databases', 'Indexes enable fast search.'), wm('UX', 'Sorted data = better tables and reports.')],
    sections: [{ heading: 'Algorithms', content: '- Linear search: O(n)\n- Binary search: O(log n) on sorted array\n- Python: `sorted()`, `.sort()`, `bisect` module' }],
    codeExamples: [{ lang: 'python', code: 'nums = sorted([3, 1, 4, 1, 5])\nprint(nums)\n\nimport bisect\nidx = bisect.bisect_left(nums, 4)\nprint(idx)' }],
    pitfalls: ['Binary search on unsorted data.', 'Off-by-one in bisect bounds.'],
    practice: [{ question: 'Complexity of sorted()?', answer: 'O(n log n)' }],
    cheatSheet: ['sorted() new list', '.sort() in-place', 'binary search needs sorted', 'bisect module'],
  }),

  'time complexity': k({
    definition: '**Time complexity** (Big-O) describes how runtime grows with input size n — independent of hardware constant factors.',
    memoryTrick: 'Drop constants and lower terms: O(2n + 5) → O(n).',
    whyMatters: [wm('Scale', '1M users expose bad algorithms.'), wm('Interviews', 'Required for every coding answer.'), wm('Architecture', 'Choose DB indexes based on query complexity.')],
    sections: [{ heading: 'Analyze Code', content: '1 loop → O(n). Nested loops → O(n²). Halving each step → O(log n). Dict/set lookup → O(1) average.' }],
    codeExamples: [{ lang: 'python', code: '# O(n)\ndef find_max(arr):\n    m = arr[0]\n    for x in arr:\n        if x > m: m = x\n    return m\n\n# O(n²)\ndef has_duplicate_slow(arr):\n    for i in range(len(arr)):\n        for j in range(i+1, len(arr)):\n            if arr[i] == arr[j]: return True\n    return False' }],
    pitfalls: ['Calling O(n) inside loop without noticing O(n²).', 'Ignoring space complexity.'],
    practice: [{ question: 'Complexity of dict lookup?', answer: 'O(1) average, O(n) worst case (hash collisions — rare).' }],
    cheatSheet: ['O(1) < O(log n) < O(n) < O(n log n) < O(n²)', 'state Big-O aloud'],
  }),

  oop: k({
    definition: '**Object-Oriented Programming** models entities as **objects** with **attributes** (data) and **methods** (behavior). Python supports classes, inheritance, and duck typing.',
    memoryTrick: 'Class = blueprint. Object = house built from blueprint.',
    whyMatters: [wm('Frameworks', 'Django, FastAPI models are classes.'), wm('Design', 'Model real domains (User, Order, Payment).'), wm('Interviews', 'OOP design questions standard.')],
    sections: [{ heading: 'Four Pillars', content: '1. **Encapsulation** — hide internal state\n2. **Abstraction** — simple interface, complex inside\n3. **Inheritance** — reuse via IS-A relationship\n4. **Polymorphism** — same interface, different behavior' }],
    codeExamples: [{ lang: 'python', code: 'class Student:\n    def __init__(self, name: str, age: int):\n        self.name = name\n        self.age = age\n\n    def greet(self) -> str:\n        return f"Hi, I am {self.name}"\n\ns = Student("Arjun", 21)\nprint(s.greet())' }],
    pitfalls: ['God classes with 20 methods.', 'Inheritance when composition better.', 'No __init__ super() in subclasses.'],
    practice: [{ question: 'self in methods?', answer: 'Reference to current instance — passed implicitly.' }],
    cheatSheet: ['class Name:', '__init__ = constructor', 'self = instance', 'method = function on object'],
  }),

  inheritance: k({
    definition: '**Inheritance** lets a child class reuse and extend parent class attributes/methods: `class Dog(Animal)`.',
    memoryTrick: 'IS-A relationship: Dog IS-A Animal.',
    whyMatters: [wm('Frameworks', 'Override hooks in Django/FastAPI.'), wm('DRY', 'Shared behavior in base class.'), wm('Design', 'Prefer composition if HAS-A not IS-A.')],
    sections: [{ heading: 'Method Resolution Order (MRO)', content: 'Python uses C3 linearization — `ClassName.__mro__` shows lookup order for multiple inheritance.' }],
    codeExamples: [{ lang: 'python', code: 'class Animal:\n    def speak(self): return "..."\n\nclass Dog(Animal):\n    def speak(self):\n        return "Woof"\n\nd = Dog()\nprint(d.speak())  # polymorphism' }],
    pitfalls: ['Deep inheritance hierarchies.', 'Forgetting super().__init__().', 'Multiple inheritance complexity.'],
    practice: [{ question: 'Override vs overload?', answer: 'Python overrides at runtime; no compile-time overload — use default args or *args.' }],
    cheatSheet: ['class Child(Parent)', 'super() call parent', 'override = same method name'],
  }),

  polymorphism: k({
    definition: '**Polymorphism** — same interface, different implementations. Duck typing: "if it walks and quacks like a duck, it is a duck."',
    memoryTrick: 'One function, many types — def process(item): item.run()',
    whyMatters: [wm('Extensibility', 'Add new types without changing caller.'), wm('Testing', 'Mock objects implement same interface.'), wm('APIs', 'Plugin architectures rely on polymorphism.')],
    sections: [{ heading: 'Duck Typing Example', content: 'Any object with `.read()` works in a function expecting a file — no inheritance required.' }],
    codeExamples: [{ lang: 'python', code: 'class Cat:\n    def speak(self): return "Meow"\n\nclass Dog:\n    def speak(self): return "Woof"\n\ndef animal_sound(animal):\n    return animal.speak()\n\nprint(animal_sound(Cat()))\nprint(animal_sound(Dog()))' }],
    pitfalls: ['Assuming type without protocol documentation.', 'isinstance checks everywhere — sometimes smell.'],
    practice: [{ question: 'Duck typing meaning?', answer: 'Behavior matters, not explicit type — if object has needed methods, it works.' }],
    cheatSheet: ['same method name', 'duck typing', 'ABC for strict contracts'],
  }),

  abstraction: k({
    definition: '**Abstraction** hides complexity behind a simple interface — users call `send_email()` without knowing SMTP details.',
    memoryTrick: 'Abstraction = steering wheel. Implementation = engine.',
    whyMatters: [wm('APIs', 'Good APIs are abstract boundaries.'), wm('Maintenance', 'Change internals without breaking clients.'), wm('Teams', 'Modules communicate via abstract interfaces.')],
    sections: [{ heading: 'Python Tools', content: '- **ABC** (abstract base classes) with `@abstractmethod`\n- **Protocols** (typing.Protocol) for structural subtyping\n- Private convention: `_internal_method`' }],
    codeExamples: [{ lang: 'python', code: 'from abc import ABC, abstractmethod\n\nclass PaymentGateway(ABC):\n    @abstractmethod\n    def charge(self, amount: float) -> bool:\n        ...\n\nclass StripeGateway(PaymentGateway):\n    def charge(self, amount: float) -> bool:\n        # Stripe API call\n        return True' }],
    pitfalls: ['Leaking implementation details in public API.', 'Over-abstracting too early.'],
    practice: [{ question: 'Why abstract PaymentGateway?', answer: 'Swap Stripe/Razorpay without changing checkout code.' }],
    cheatSheet: ['hide complexity', 'ABC @abstractmethod', 'stable public API'],
  }),

  encapsulation: k({
    definition: '**Encapsulation** bundles data and methods, controlling access — Python uses `_single` and `__double` underscore conventions (not true private).',
    memoryTrick: '_name = "please do not touch from outside"',
    whyMatters: [wm('Integrity', 'Prevent invalid state changes.'), wm('Refactoring', 'Change internals safely.'), wm('Security', 'Do not expose secrets on objects.')],
    sections: [{ heading: 'Property Pattern', content: 'Use `@property` for getters/setters with validation instead of public attributes.' }],
    codeExamples: [{ lang: 'python', code: 'class BankAccount:\n    def __init__(self, balance: float):\n        self._balance = balance\n\n    @property\n    def balance(self) -> float:\n        return self._balance\n\n    def deposit(self, amount: float):\n        if amount <= 0:\n            raise ValueError("positive only")\n        self._balance += amount' }],
    pitfalls: ['Everything public — no invariants.', 'Python name mangling confusion (__foo).'],
    practice: [{ question: 'Why @property?', answer: 'Validate on set, compute on get — controlled access to attribute.' }],
    cheatSheet: ['_protected convention', '@property for access control', 'validate in setters'],
  }),

  'solid basics': k({
    definition: '**SOLID** — five OOP design principles: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion.',
    memoryTrick: 'S-O-L-I-D — one principle per design decision in code review.',
    whyMatters: [wm('Maintainability', 'Code survives team turnover.'), wm('Senior reviews', 'Violations get PR comments.'), wm('Architecture', 'Foundation for clean architecture.')],
    sections: [
      { heading: 'Quick Definitions', content: '| Letter | Principle |\n|--------|----------|\n| S | One class, one reason to change |\n| O | Open for extension, closed for modification |\n| L | Subtypes must be substitutable |\n| I | Small specific interfaces |\n| D | Depend on abstractions, not concretions |' },
    ],
    codeExamples: [{ lang: 'python', code: '# S — separate EmailSender from UserService\nclass UserService:\n    def __init__(self, mailer):\n        self.mailer = mailer  # D — inject dependency\n\n    def register(self, user):\n        ...\n        self.mailer.send(user.email, "Welcome")' }],
    pitfalls: ['Single god service class.', 'Hard-coding concrete classes everywhere.'],
    practice: [{ question: 'SRP example violation?', answer: 'UserService that also sends emails, logs, and handles HTTP — split responsibilities.' }],
    cheatSheet: ['S=one job', 'O=extend not edit', 'L=subtypes work', 'I=small interfaces', 'D=inject abstractions'],
  }),

  'rest apis': k({
    definition: '**REST** (Representational State Transfer) uses HTTP methods on resources identified by URLs — GET read, POST create, PUT/PATCH update, DELETE remove.',
    memoryTrick: 'URL = noun. HTTP method = verb.',
    whyMatters: [wm('Backend jobs', '90% of junior work touches REST APIs.'), wm('Integration', 'Mobile, web, AI services all consume REST.'), wm('Debugging', 'Postman/curl skills essential.')],
    sections: [{ heading: 'HTTP Status Codes', content: '| Code | Meaning |\n|------|--------|\n| 200 | OK |\n| 201 | Created |\n| 400 | Bad request |\n| 401 | Unauthorized |\n| 404 | Not found |\n| 500 | Server error |' }],
    codeExamples: [{ lang: 'python', code: 'import requests\n\nresp = requests.get("https://api.example.com/users/1")\nprint(resp.status_code)\nprint(resp.json())\n\nnew_user = requests.post("https://api.example.com/users", json={"name": "Arjun"})' }],
    pitfalls: ['GET with side effects.', 'No error handling on non-2xx.', 'Returning 200 with error in body.'],
    practice: [{ question: 'Idempotent methods?', answer: 'GET, PUT, DELETE idempotent; POST typically not.' }],
    cheatSheet: ['GET read', 'POST create', 'PUT/PATCH update', 'DELETE remove', 'check status_code'],
  }),

  json: k({
    definition: '**JSON** (JavaScript Object Notation) is the standard text format for API data — maps to Python dict/list via `json` module.',
    memoryTrick: 'JSON keys must be double-quoted strings.',
    whyMatters: [wm('APIs', 'Every REST payload is JSON.'), wm('Config', 'package.json, settings files.'), wm('Debugging', 'Read raw JSON in network tab.')],
    sections: [{ heading: 'Python json Module', content: '`json.loads(str)` → Python object\n`json.dumps(obj)` → string\n`indent=2` for pretty print' }],
    codeExamples: [{ lang: 'python', code: 'import json\n\ndata = {"name": "Arjun", "scores": [85, 90]}\ntext = json.dumps(data, indent=2)\nparsed = json.loads(text)\nprint(parsed["scores"][0])' }],
    pitfalls: ['JSON vs Python: true/false/null lowercase.', 'datetime not serializable by default.', 'Trailing commas invalid in JSON.'],
    practice: [{ question: 'Parse JSON string to dict?', answer: 'json.loads(s)' }],
    cheatSheet: ['loads = parse', 'dumps = serialize', 'double quotes only'],
  }),

  requests: k({
    definition: 'The **`requests`** library is the standard Python HTTP client — simpler than urllib for GET/POST with headers, auth, and timeouts.',
    memoryTrick: 'Always set timeout= — never hang forever.',
    whyMatters: [wm('Automation', 'Script integrations with SaaS APIs.'), wm('Data', 'Fetch datasets for analysis.'), wm('Testing', 'Hit your own API in integration tests.')],
    sections: [{ heading: 'Production Checklist', content: '- Set `timeout`\n- Handle `requests.exceptions`\n- Use session for connection pooling\n- Never log full API keys' }],
    codeExamples: [{ lang: 'python', code: 'import requests\n\ntry:\n    r = requests.get("https://httpbin.org/get", timeout=5)\n    r.raise_for_status()\n    print(r.json())\nexcept requests.RequestException as e:\n    print("Request failed:", e)' }],
    pitfalls: ['No timeout.', 'Ignoring SSL in production.', 'Hardcoded secrets.'],
    practice: [{ question: 'raise_for_status() purpose?', answer: 'Raises HTTPError for 4xx/5xx — fail fast instead of silent bad data.' }],
    cheatSheet: ['requests.get/post', 'timeout= required', 'raise_for_status()', 'r.json()'],
  }),

  'automation scripting': k({
    definition: '**Automation scripts** eliminate repetitive manual tasks — file processing, report generation, deployment hooks, cron jobs.',
    memoryTrick: 'If you did it twice manually, script it the third time.',
    whyMatters: [wm('DevOps', 'CI pipelines are scripted automation.'), wm('Productivity', 'Interns who automate stand out.'), wm('Reliability', 'Scripts run the same every time.')],
    sections: [{ heading: 'Building Blocks', content: 'argparse for CLI args, pathlib for paths, logging not print in production, schedule/cron for timing.' }],
    codeExamples: [{ lang: 'python', code: 'from pathlib import Path\nimport csv\n\ndef summarize_logs(folder: str):\n    total_errors = 0\n    for path in Path(folder).glob("*.log"):\n        text = path.read_text()\n        total_errors += text.count("ERROR")\n    return total_errors' }],
    pitfalls: ['No idempotency — script run twice causes duplicate actions.', 'Hardcoded paths.'],
    practice: [{ question: 'pathlib vs os.path?', answer: 'pathlib is OOP, cleaner / operator for join — preferred in modern Python.' }],
    cheatSheet: ['pathlib.Path', 'argparse CLI', 'logging module', 'cron for schedule'],
  }),

  'web scraping': k({
    definition: '**Web scraping** extracts data from HTML pages programmatically — use **BeautifulSoup** / **httpx** ethically and legally (check robots.txt, ToS).',
    memoryTrick: 'Scrape responsibly — rate limit and respect terms of service.',
    whyMatters: [wm('Data', 'Aggregate public datasets for projects.'), wm('Monitoring', 'Price/availability trackers.'), wm('Legal', 'Unauthorized scraping can violate law/ToS.')],
    sections: [{ heading: 'Ethics & Legal', content: 'Read robots.txt. Add delays between requests. Prefer official APIs when available. Never scrape personal data without consent.' }],
    codeExamples: [{ lang: 'python', code: 'import httpx\nfrom bs4 import BeautifulSoup\n\nhtml = httpx.get("https://example.com", timeout=10).text\nsoup = BeautifulSoup(html, "html.parser")\ntitle = soup.find("title").get_text()\nprint(title)' }],
    pitfalls: ['No rate limiting — IP ban.', 'Brittle selectors break on redesign.', 'Ignoring legal constraints.'],
    practice: [{ question: 'First check before scraping?', answer: 'robots.txt, ToS, and whether an API exists.' }],
    cheatSheet: ['check robots.txt', 'rate limit', 'prefer API', 'BeautifulSoup parse'],
  }),

  schedulers: k({
    definition: '**Schedulers** run tasks at intervals — cron (Linux), APScheduler (Python), Celery beat (distributed), GitHub Actions cron.',
    memoryTrick: 'cron: minute hour day month weekday',
    whyMatters: [wm('Ops', 'Backups, reports, cache refresh on schedule.'), wm('Reliability', 'Missed jobs need monitoring.'), wm('Scale', 'Move from cron to queue workers at growth.')],
    sections: [{ heading: 'Cron Example', content: '`0 2 * * *` = daily at 2 AM\n`*/15 * * * *` = every 15 minutes' }],
    codeExamples: [{ lang: 'python', code: '# APScheduler snippet\nfrom apscheduler.schedulers.blocking import BlockingScheduler\n\nsched = BlockingScheduler()\n\n@sched.scheduled_job("interval", minutes=30)\ndef refresh_cache():\n    print("Cache refreshed")\n\n# sched.start()' }],
    pitfalls: ['Overlapping long jobs.', 'No alerting on failure.', 'Timezone confusion.'],
    practice: [{ question: 'cron 0 0 * * 0?', answer: 'Midnight every Sunday.' }],
    cheatSheet: ['cron 5 fields', 'APScheduler for Python', 'monitor job failures'],
  }),

  'capstone planning': k({
    definition: '**Capstone planning** defines scope, milestones, risks, and success criteria before coding — prevents deadline disasters.',
    memoryTrick: 'Plan the capstone like a mini startup MVP — scope small, ship working.',
    whyMatters: [wm('Delivery', 'Plans get you to demo day.'), wm('Reviews', 'Mentors evaluate planning skill.'), wm('Portfolio', 'Documented plan shows professionalism.')],
    sections: [{ heading: 'Milestone Template', content: 'Week 1: requirements + wireframes\nWeek 2: core API + DB\nWeek 3: frontend integration\nWeek 4: deploy + docs + presentation' }],
    codeExamples: [{ lang: 'markdown', code: '# Capstone Plan\n## Problem\n## Users\n## MVP Features (max 5)\n## Out of Scope\n## Milestones\n## Risks + Mitigations' }],
    pitfalls: ['Scope creep — adding features daily.', 'No demoable milestone until last day.'],
    practice: [{ question: 'MVP definition?', answer: 'Smallest version that delivers core user value end-to-end.' }],
    cheatSheet: ['MVP first', 'weekly milestones', 'document out-of-scope'],
  }),

  'architecture design': k({
    definition: '**Architecture design** maps components (frontend, API, DB, cache, queue) and how data flows between them — before writing code.',
    memoryTrick: 'Draw boxes and arrows — if you cannot draw it, you cannot build it.',
    whyMatters: [wm('Interviews', 'System design rounds start with boxes.'), wm('Capstone', 'Reviewers want architecture diagram.'), wm('Scale', 'Wrong architecture is expensive to fix.')],
    sections: [{ heading: 'C4 Levels', content: '1. Context — system vs users\n2. Container — web, API, DB\n3. Component — modules inside API\n4. Code — classes (optional)' }],
    codeExamples: [{ lang: 'text', code: '[User] --> [Next.js Web] --> [FastAPI] --> [PostgreSQL]\n                      |\n                      +--> [Redis Cache]' }],
    pitfalls: ['Microservices too early.', 'No data model thinking.', 'Ignoring auth and observability.'],
    practice: [{ question: 'Monolith vs microservices for capstone?', answer: 'Monolith — faster to ship; split only when needed.' }],
    cheatSheet: ['context diagram first', 'monolith for MVP', 'label data flows'],
  }),

  deployment: k({
    definition: '**Deployment** ships your application to a server users can reach — Docker, VPS, PaaS (Railway, Render), or cloud (AWS/GCP).',
    memoryTrick: 'Deploy = code + config + secrets + health check.',
    whyMatters: [wm('Portfolio', 'Live URL beats README-only projects.'), wm('Internships', 'Ship to staging week 1 expectation.'), wm('Debugging', 'Production differs from local — env vars matter.')],
    sections: [{ heading: 'Checklist', content: '- Environment variables set\n- Database migrations run\n- HTTPS enabled\n- Health endpoint `/health`\n- Logs accessible\n- Rollback plan documented' }],
    codeExamples: [{ lang: 'bash', code: 'docker build -t myapp .\ndocker run -p 8000:8000 --env-file .env myapp\ncurl http://localhost:8000/health' }],
    pitfalls: ['Secrets in image.', 'No health checks.', 'Debug=True in production.'],
    practice: [{ question: 'Why Docker?', answer: 'Same environment dev → prod — reproducible deploys.' }],
    cheatSheet: ['env vars not in Git', 'health check', 'HTTPS', 'rollback plan'],
  }),

  documentation: k({
    definition: '**Documentation** includes README, API docs, architecture notes, and inline docstrings — enables others (and future you) to use your system.',
    memoryTrick: 'README answers: what, why, how to run, how to test in 5 minutes.',
    whyMatters: [wm('Hiring', 'Recruiters read README first.'), wm('Teams', 'No docs = bus factor 1.'), wm('Grading', 'Capstone rubrics include documentation.')],
    sections: [{ heading: 'README Sections', content: '1. Title + one-liner\n2. Demo screenshot/GIF\n3. Setup (prerequisites, install, env)\n4. Usage examples\n5. Architecture link\n6. License' }],
    codeExamples: [{ lang: 'markdown', code: '# Project Name\n\nOne-line description.\n\n## Quick Start\n```bash\npip install -r requirements.txt\npython -m app\n```\n\n## Environment\n| Variable | Description |\n|----------|-------------|\n| DATABASE_URL | Postgres connection |' }],
    pitfalls: ['Outdated setup steps.', 'No .env.example.', 'Missing architecture diagram.'],
    practice: [{ question: 'Minimum README for internship project?', answer: 'Setup, run, test, env vars, demo link.' }],
    cheatSheet: ['README = first impression', '.env.example', 'keep setup steps tested'],
  }),

  'presentation skills': k({
    definition: '**Presentation skills** communicate your technical work clearly — structure, demo, metrics, and Q&A handling for capstone and interviews.',
    memoryTrick: 'Tell them what you built, why it matters, show demo, then how you built it.',
    whyMatters: [wm('Capstone', 'Demo day grades presentation.'), wm('Interviews', 'Explain projects in 2 minutes.'), wm('Career', 'Senior engineers present to stakeholders.')],
    sections: [{ heading: '5-Minute Structure', content: '1. Problem (30s)\n2. Solution demo (2min)\n3. Architecture (1min)\n4. Challenges learned (1min)\n5. Q&A prep' }],
    codeExamples: [{ lang: 'text', code: 'Slide 1: Problem + user\nSlide 2: Live demo (not slides!)\nSlide 3: Architecture diagram\nSlide 4: Metrics (users, latency, tests)\nSlide 5: Next steps' }],
    pitfalls: ['Reading slides word-for-word.', 'No live demo backup video.', 'Too much jargon.'],
    practice: [{ question: 'First 30 seconds of capstone pitch?', answer: 'User problem in plain language + why you cared.' }],
    cheatSheet: ['problem → demo → architecture → learnings', 'practice aloud', 'backup video'],
  }),
};

export function getPythonKnowledge(topic: string): TopicKnowledge | null {
  return PYTHON_KNOWLEDGE[topic.toLowerCase().trim()] ?? null;
}
