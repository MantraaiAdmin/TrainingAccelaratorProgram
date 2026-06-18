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
      wm('Capstone', 'Final sprint projects combine multiple topics — weak fundamentals show immediately.'),
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

  'relational databases': k({
    definition: '**Relational databases** store structured data in tables with rows and columns, linked by keys — PostgreSQL, MySQL, and SQLite are common engines.',
    memoryTrick: 'Tables + relationships + SQL queries = relational model.',
    whyMatters: [wm('Backend', 'Most apps persist data in RDBMS.'), wm('Data', 'Foundation for analytics pipelines.'), wm('Interviews', 'SQL and schema design are standard rounds.')],
    sections: [{ heading: 'Core Concepts', content: 'Table, row, column, primary key, foreign key, constraint, index, schema' }],
    codeExamples: [{ lang: 'sql', code: 'CREATE TABLE students (\n  id INTEGER PRIMARY KEY,\n  email TEXT UNIQUE NOT NULL,\n  name TEXT NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);' }],
    pitfalls: ['No primary keys.', 'Storing everything in one wide table.', 'Ignoring constraints at DB level.'],
    practice: [{ question: 'Primary key purpose?', answer: 'Uniquely identifies each row — required for relationships and updates.' }],
    cheatSheet: ['tables + keys', 'normalize design', 'constraints enforce rules'],
  }),

  'sql fundamentals': k({
    definition: '**SQL** (Structured Query Language) is the standard language to create, read, update, and delete data in relational databases.',
    memoryTrick: 'CRUD = SELECT, INSERT, UPDATE, DELETE.',
    whyMatters: [wm('Every backend role', 'SQL appears daily in logs, reports, and debugging.'), wm('Data science', 'Pandas often mirrors SQL operations.'), wm('Interviews', 'Write JOIN queries on whiteboard.')],
    sections: [{ heading: 'Essential Clauses', content: 'SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, JOIN' }],
    codeExamples: [{ lang: 'sql', code: 'SELECT department, AVG(score) AS avg_score\nFROM results\nWHERE year = 2025\nGROUP BY department\nHAVING AVG(score) >= 70\nORDER BY avg_score DESC;' }],
    pitfalls: ['SELECT * in production.', 'Missing WHERE on UPDATE/DELETE.', 'Ambiguous column names without aliases.'],
    practice: [{ question: 'GROUP BY vs WHERE?', answer: 'WHERE filters rows before grouping; HAVING filters groups after aggregation.' }],
    cheatSheet: ['SELECT columns', 'WHERE filters rows', 'JOIN links tables', 'GROUP BY aggregates'],
  }),

  postgresql: k({
    definition: '**PostgreSQL** is a production-grade open-source relational database — use it with Python via psycopg2, asyncpg, or SQLAlchemy for scalable apps.',
    memoryTrick: 'SQLite for local prototypes; PostgreSQL for production multi-user apps.',
    whyMatters: [wm('Industry', 'Default choice for Python web backends.'), wm('Data', 'JSON columns, full-text search, extensions like pgvector.'), wm('Career', 'SQL + Postgres appear in most backend job specs.')],
    sections: [{ heading: 'Python Connection', content: 'SQLAlchemy engine with postgresql:// URL; use parameterized queries; run migrations with Alembic' }],
    codeExamples: [{ lang: 'python', code: '# SQLAlchemy + Postgres\nfrom sqlalchemy import create_engine, text\n\nengine = create_engine("postgresql://user:pass@localhost:5432/mydb")\nwith engine.connect() as conn:\n    result = conn.execute(text("SELECT COUNT(*) FROM students"))\n    print(result.scalar())' }],
    pitfalls: ['Hardcoding credentials — use env vars.', 'No connection pooling in production.', 'Running migrations manually without version control.'],
    practice: [{ question: 'SQLite vs PostgreSQL?', answer: 'SQLite = single-file, embedded; Postgres = server, concurrent users, production scale.' }],
    cheatSheet: ['postgres for production', 'SQLAlchemy engine', 'env DATABASE_URL', 'Alembic migrations'],
  }),

  'select queries': k({
    definition: '**SELECT queries** retrieve data from one or more tables — filtering, sorting, limiting, and projecting columns.',
    memoryTrick: 'SELECT what FROM where ORDER BY how many.',
    whyMatters: [wm('Debugging', 'Inspect production data safely with read-only queries.'), wm('Reports', 'Every dashboard starts with SELECT.'), wm('Performance', 'Bad SELECTs slow entire systems.')],
    sections: [{ heading: 'Patterns', content: 'Distinct, aliases, BETWEEN, IN, LIKE, NULL checks (IS NULL), subqueries' }],
    codeExamples: [{ lang: 'sql', code: "SELECT name, email FROM students WHERE name LIKE 'A%' AND email IS NOT NULL ORDER BY name LIMIT 20;" }],
    pitfalls: ['No LIMIT on exploratory queries.', 'LIKE without index on huge tables.', 'Forgetting NULL is not = NULL.'],
    practice: [{ question: 'Find rows where email is missing?', answer: 'WHERE email IS NULL (not = NULL).' }],
    cheatSheet: ['project columns', 'filter with WHERE', 'ORDER BY + LIMIT'],
  }),

  'insert update delete': k({
    definition: '**INSERT, UPDATE, DELETE** modify database rows — always use transactions and WHERE clauses to avoid mass accidents.',
    memoryTrick: 'UPDATE/DELETE without WHERE = career-limiting move.',
    whyMatters: [wm('Data integrity', 'Apps mutate state through these statements.'), wm('Incidents', 'One missing WHERE deleted millions of rows — real stories.'), wm('ORMs', 'Prisma/SQLAlchemy generate these under the hood.')],
    sections: [{ heading: 'Safe Patterns', content: 'BEGIN → test SELECT with same WHERE → UPDATE/DELETE → verify → COMMIT' }],
    codeExamples: [{ lang: 'sql', code: 'INSERT INTO students (email, name) VALUES (\'arjun@demo.com\', \'Arjun\');\nUPDATE students SET name = \'Arjun K.\' WHERE email = \'arjun@demo.com\';\nDELETE FROM students WHERE email = \'old@demo.com\';' }],
    pitfalls: ['No WHERE on UPDATE/DELETE.', 'No backup before bulk changes.', 'Violating UNIQUE constraints.'],
    practice: [{ question: 'Safer bulk update workflow?', answer: 'Run SELECT with same WHERE first, wrap in transaction, verify row count.' }],
    cheatSheet: ['always WHERE on update/delete', 'use transactions', 'test with SELECT first'],
  }),

  'joins & relationships': k({
    definition: '**JOINs** combine rows from related tables using foreign keys — INNER, LEFT, RIGHT, and FULL joins answer different questions.',
    memoryTrick: 'INNER = only matches; LEFT = keep all from left table.',
    whyMatters: [wm('Reporting', 'Real data lives across multiple tables.'), wm('ORMs', 'include/join maps to SQL JOIN.'), wm('Interviews', 'Classic JOIN question every week.')],
    sections: [{ heading: 'Join Types', content: 'INNER JOIN — matching rows only\nLEFT JOIN — all left + matching right (NULL if no match)\nOne-to-many, many-to-many via junction table' }],
    codeExamples: [{ lang: 'sql', code: 'SELECT s.name, c.title\nFROM students s\nINNER JOIN enrollments e ON e.student_id = s.id\nINNER JOIN courses c ON c.id = e.course_id\nWHERE s.is_active = true;' }],
    pitfalls: ['Cartesian product from missing ON clause.', 'Joining on wrong column.', 'Many-to-many without junction table.'],
    practice: [{ question: 'LEFT JOIN use case?', answer: 'List all students even if they have zero enrollments — NULL for course columns.' }],
    cheatSheet: ['INNER = intersection', 'LEFT = keep all left', 'FK links tables'],
  }),

  'database normalization': k({
    definition: '**Normalization** organizes columns into tables to reduce redundancy — 1NF, 2NF, 3NF are the classic forms; denormalize deliberately for read speed.',
    memoryTrick: 'One fact, one place — unless you measure and need speed.',
    whyMatters: [wm('Integrity', 'Update anomalies disappear with proper design.'), wm('Interviews', 'Explain 1NF–3NF with example.'), wm('Scale', 'Bad schema is expensive to fix later.')],
    sections: [{ heading: 'Forms', content: '1NF: atomic values\n2NF: no partial dependency on composite key\n3NF: no transitive dependency\nDenormalize for read-heavy analytics with care' }],
    codeExamples: [{ lang: 'text', code: 'Bad: students(student_id, name, course1, course2)\nGood: students(id, name) + enrollments(student_id, course_id) + courses(id, title)' }],
    pitfalls: ['Over-normalizing tiny apps.', 'Denormalizing without documenting why.', 'No FK constraints.'],
    practice: [{ question: 'Why split courses to separate table?', answer: 'Avoid repeating course data per student row — single source of truth.' }],
    cheatSheet: ['1NF atomic', '2NF no partial deps', '3NF no transitive', 'denormalize consciously'],
  }),

  'indexes & query performance': k({
    definition: '**Indexes** speed up reads by creating lookup structures — B-tree indexes on WHERE/JOIN columns; EXPLAIN shows if queries scan full tables.',
    memoryTrick: 'Index the columns you filter and join on — verify with EXPLAIN.',
    whyMatters: [wm('Production', 'Slow queries at scale cost money and users.'), wm('SQLite/Postgres', 'Same principles everywhere.'), wm('Interviews', 'Explain index trade-offs.')],
    sections: [{ heading: 'Trade-offs', content: 'Indexes speed SELECT but slow INSERT/UPDATE; composite index column order matters' }],
    codeExamples: [{ lang: 'sql', code: 'CREATE INDEX idx_students_email ON students(email);\nEXPLAIN QUERY PLAN SELECT * FROM students WHERE email = ?;' }],
    pitfalls: ['Indexing every column.', 'Wrong composite order.', 'Never checking query plans.'],
    practice: [{ question: 'When skip index?', answer: 'Tiny tables, low-cardinality columns alone, write-heavy cold columns.' }],
    cheatSheet: ['index filter/join cols', 'EXPLAIN plans', 'composite order matters'],
  }),

  'sqlite with python': k({
    definition: '**SQLite** is a file-based SQL database built into Python via **`sqlite3`** — perfect for local apps, prototypes, and CLI tools.',
    memoryTrick: 'sqlite3.connect("app.db") → cursor → execute → commit.',
    whyMatters: [wm('Prototyping', 'Ship DB-backed CLI without server setup.'), wm('Testing', 'In-memory SQLite for fast tests.'), wm('Mobile/edge', 'SQLite powers many embedded apps.')],
    sections: [{ heading: 'Python Pattern', content: 'Use context managers, parameterized queries (? placeholders), commit after writes' }],
    codeExamples: [{ lang: 'python', code: 'import sqlite3\n\nwith sqlite3.connect("students.db") as conn:\n    conn.execute("CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY, email TEXT UNIQUE, name TEXT)")\n    conn.execute("INSERT INTO students (email, name) VALUES (?, ?)", ("a@demo.com", "Arjun"))\n    rows = conn.execute("SELECT * FROM students WHERE email = ?", ("a@demo.com",)).fetchall()\n    print(rows)' }],
    pitfalls: ['String concatenation in SQL — SQL injection risk.', 'Forgetting commit().', 'No connection context manager.'],
    practice: [{ question: 'Why parameterized queries?', answer: 'Separates SQL structure from user data — prevents injection.' }],
    cheatSheet: ['sqlite3.connect', 'use ? placeholders', 'with conn:', 'commit writes'],
  }),

  'sqlalchemy basics': k({
    definition: '**SQLAlchemy** is Python\'s dominant SQL toolkit — Core for raw SQL, ORM for mapping classes to tables with sessions and migrations.',
    memoryTrick: 'Engine → Session → Model classes → query API.',
    whyMatters: [wm('Python backends', 'FastAPI/Django often use SQLAlchemy or similar.'), wm('Safety', 'Typed models reduce raw SQL errors.'), wm('Migrations', 'Alembic pairs with SQLAlchemy for schema evolution.')],
    sections: [{ heading: 'ORM Workflow', content: 'Define models → create engine → SessionLocal → query/add/commit' }],
    codeExamples: [{ lang: 'python', code: 'from sqlalchemy import create_engine, Column, Integer, String\nfrom sqlalchemy.orm import declarative_base, Session\n\nBase = declarative_base()\n\nclass Student(Base):\n    __tablename__ = "students"\n    id = Column(Integer, primary_key=True)\n    email = Column(String, unique=True)\n\nengine = create_engine("sqlite:///students.db")\nBase.metadata.create_all(engine)\n\nwith Session(engine) as session:\n    session.add(Student(email="a@demo.com"))\n    session.commit()' }],
    pitfalls: ['N+1 queries from lazy loading.', 'Session not closed — connection leaks.', 'Mixing raw SQL without parameterization.'],
    practice: [{ question: 'ORM vs raw SQL?', answer: 'ORM for CRUD and type safety; raw SQL for complex reports and performance tuning.' }],
    cheatSheet: ['declarative models', 'Session commit', 'Alembic migrations'],
  }),

  'crud with python': k({
    definition: '**CRUD with Python** implements Create, Read, Update, Delete against a database using sqlite3, SQLAlchemy, or an API layer.',
    memoryTrick: 'Repository pattern: one function per operation, parameterized SQL.',
    whyMatters: [wm('Apps', 'Every feature is CRUD plus business rules.'), wm('Internships', 'First task is often "build CRUD for X".'), wm('Testing', 'Test each operation in isolation.')],
    sections: [{ heading: 'Layered Design', content: 'Route/handler → service → repository → DB — keeps SQL out of UI code' }],
    codeExamples: [{ lang: 'python', code: 'def create_student(conn, email: str, name: str) -> int:\n    cur = conn.execute("INSERT INTO students (email, name) VALUES (?, ?)", (email, name))\n    conn.commit()\n    return cur.lastrowid\n\ndef get_student_by_email(conn, email: str):\n    return conn.execute("SELECT * FROM students WHERE email = ?", (email,)).fetchone()' }],
    pitfalls: ['SQL in every route handler.', 'No validation before INSERT.', 'Returning passwords in Read.'],
    practice: [{ question: 'Where to put SQL strings?', answer: 'Repository/data layer — not in CLI or HTTP handlers directly.' }],
    cheatSheet: ['repository layer', 'parameterized SQL', 'validate before write'],
  }),

  'database migrations intro': k({
    definition: '**Database migrations** version-control schema changes — each migration is a forward (and sometimes reverse) script applied in order.',
    memoryTrick: 'Never ALTER production by hand without a migration file.',
    whyMatters: [wm('Teams', 'Everyone gets same schema via migrate.'), wm('Deploy', 'CI runs migrations before app start.'), wm('Rollback', 'Documented history of schema evolution.')],
    sections: [{ heading: 'Workflow', content: 'Change model → generate migration → review SQL → apply dev → apply staging → apply prod' }],
    codeExamples: [{ lang: 'bash', code: '# Alembic (SQLAlchemy)\nalembic revision --autogenerate -m "add students table"\nalembic upgrade head' }],
    pitfalls: ['Editing old migrations after deploy.', 'Destructive migrations without backup.', 'Skipping migration in CI.'],
    practice: [{ question: 'Why not edit DB manually in prod?', answer: 'No reproducibility — other envs drift, team cannot replay changes.' }],
    cheatSheet: ['versioned migrations', 'review before apply', 'backup before destructive'],
  }),

  'transactions & acid': k({
    definition: '**Transactions** group multiple SQL statements atomically — **ACID** (Atomicity, Consistency, Isolation, Durability) guarantees reliable commits.',
    memoryTrick: 'All succeed or all rollback — critical for transfers and inventory.',
    whyMatters: [wm('Money', 'Partial updates corrupt balances.'), wm('Python', 'conn.commit() / rollback() or SQLAlchemy session.transaction.'), wm('Interviews', 'Explain ACID with bank transfer example.')],
    sections: [{ heading: 'Python sqlite3', content: 'conn.execute("BEGIN") → operations → commit() or rollback() on exception' }],
    codeExamples: [{ lang: 'python', code: 'try:\n    conn.execute("BEGIN")\n    conn.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (100, 1))\n    conn.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (100, 2))\n    conn.commit()\nexcept Exception:\n    conn.rollback()\n    raise' }],
    pitfalls: ['Long transactions lock rows.', 'No idempotency on retried HTTP requests.'],
    practice: [{ question: 'ACID letters?', answer: 'Atomicity, Consistency, Isolation, Durability.' }],
    cheatSheet: ['BEGIN/COMMIT/ROLLBACK', 'keep transactions short', 'use on multi-step writes'],
  }),

  'schema design patterns': k({
    definition: '**Schema design patterns** model domains with entities, relationships, constraints, and indexes matched to query patterns.',
    memoryTrick: 'Entities → relationships → constraints → indexes for hot queries.',
    whyMatters: [wm('Capstone', 'Reviewers ask for ER diagram.'), wm('Scale', 'Wrong schema is painful to migrate.'), wm('Data science', 'Clean schema = clean joins for analytics.')],
    sections: [{ heading: 'Checklist', content: 'PK on every table, FK for relationships, UNIQUE where needed, timestamps, soft-delete flag optional' }],
    codeExamples: [{ lang: 'text', code: 'students ──< enrollments >── courses\nusers ──< orders >── products' }],
    pitfalls: ['Polymorphic mega-table anti-pattern.', 'No FK constraints "for speed".', 'Storing lists in CSV columns.'],
    practice: [{ question: 'Many-to-many pattern?', answer: 'Junction table with two FKs, e.g. enrollments(student_id, course_id).' }],
    cheatSheet: ['ER diagram first', 'FK constraints', 'index hot queries'],
  }),

  'data science workflow': k({
    definition: 'The **data science workflow** moves from business question → data collection → cleaning → EDA → modeling → communication of insights.',
    memoryTrick: 'Question → data → clean → explore → model → tell story.',
    whyMatters: [wm('Internships', 'Analytics tasks follow this loop weekly.'), wm('AI', 'Garbage in = garbage out before any ML.'), wm('Stakeholders', 'Insights must be actionable, not just charts.')],
    sections: [{ heading: 'Steps', content: '1. Define question\n2. Acquire data (CSV, API, DB)\n3. Clean & validate\n4. EDA & visualization\n5. Model (optional)\n6. Report & recommend' }],
    codeExamples: [{ lang: 'python', code: '# Typical notebook sections\n# 1. Load data\n# 2. df.info(), df.describe()\n# 3. Handle missing values\n# 4. Plot distributions\n# 5. Groupby aggregations\n# 6. Conclusion markdown cell' }],
    pitfalls: ['Jumping to ML without EDA.', 'No train/test split.', 'Cherry-picking charts.'],
    practice: [{ question: 'First step after loading CSV?', answer: 'Inspect shape, dtypes, missing values, duplicates — df.info() and head().' }],
    cheatSheet: ['define question first', 'clean before model', 'document assumptions'],
  }),

  numpy: k({
    definition: '**NumPy** provides fast n-dimensional arrays and vectorized math — the foundation of Pandas and scikit-learn in Python data work.',
    memoryTrick: 'Arrays beat Python loops — vectorize with NumPy.',
    whyMatters: [wm('Performance', '100x faster than pure Python loops on numeric data.'), wm('ML', 'Feature matrices are NumPy arrays.'), wm('Interviews', 'Broadcasting and shape questions.')],
    sections: [{ heading: 'Core Operations', content: 'ndarray, shape, dtype, slicing, broadcasting, np.mean/sum/dot, boolean masking' }],
    codeExamples: [{ lang: 'python', code: 'import numpy as np\n\nscores = np.array([85, 90, 78, 92])\nprint(scores.mean(), scores.std())\nmask = scores >= 85\nprint(scores[mask])' }],
    pitfalls: ['Shape mismatch in operations.', 'Modifying views unexpectedly.', 'Using lists for large numeric computation.'],
    practice: [{ question: 'Why NumPy over list for math?', answer: 'Vectorized C implementations — no Python loop overhead.' }],
    cheatSheet: ['np.array', 'shape/dtype', 'boolean mask', 'vectorize ops'],
  }),

  'numpy arrays': k({
    definition: '**NumPy arrays** are homogeneous typed containers with shape — 1D vectors, 2D matrices, and n-dimensional tensors for numeric computation.',
    memoryTrick: 'Check .shape and .dtype before every operation.',
    whyMatters: [wm('Data', 'Images, time series, and tables convert to arrays.'), wm('ML', 'Models expect float32/float64 matrices.'), wm('Debugging', 'Shape errors are the #1 NumPy bug.')],
    sections: [{ heading: 'Creation & Reshape', content: 'np.array, np.zeros, np.arange, reshape, flatten, concatenate' }],
    codeExamples: [{ lang: 'python', code: 'import numpy as np\n\nmatrix = np.arange(12).reshape(3, 4)\nprint(matrix.shape)  # (3, 4)\nprint(matrix[1, 2:4])' }],
    pitfalls: ['Reshape without matching size.', 'Integer vs float dtype surprises.', 'Off-by-one slicing.'],
    practice: [{ question: 'Shape of (3,4) matrix after flatten?', answer: '(12,) — one-dimensional length 12.' }],
    cheatSheet: ['check shape', 'reshape total size constant', 'slice rows then cols'],
  }),

  pandas: k({
    definition: '**Pandas** provides **DataFrame** and **Series** for tabular data — load CSV, clean, filter, group, and merge like SQL in Python.',
    memoryTrick: 'df.head(), df.info(), df.describe() — always start here.',
    whyMatters: [wm('Analytics', 'Default tool for CSV/Excel analysis.'), wm('Data roles', 'Pandas in most Python data job descriptions.'), wm('ML prep', 'Feature tables before scikit-learn.')],
    sections: [{ heading: 'Core API', content: 'read_csv, loc/iloc, filter, assign, groupby, merge, to_csv' }],
    codeExamples: [{ lang: 'python', code: 'import pandas as pd\n\ndf = pd.read_csv("sales.csv")\nprint(df.head())\nprint(df.groupby("region")["revenue"].sum().sort_values(ascending=False))' }],
    pitfalls: ['SettingWithCopyWarning — use .loc.', 'Not parsing dates on read.', 'Chained indexing bugs.'],
    practice: [{ question: 'Group revenue by region?', answer: 'df.groupby("region")["revenue"].sum()' }],
    cheatSheet: ['read_csv', 'head/info/describe', 'groupby', 'merge'],
  }),

  'pandas dataframes': k({
    definition: 'A **Pandas DataFrame** is a 2D labeled table with columns of potentially different dtypes — rows indexed, columns named.',
    memoryTrick: 'Think spreadsheet in Python with SQL-like operations.',
    whyMatters: [wm('EDA', 'Primary structure for exploration.'), wm('Pipelines', 'ETL steps are DataFrame transforms.'), wm('Interviews', 'Filter, groupby, merge questions.')],
    sections: [{ heading: 'Selection', content: 'df["col"], df.loc[mask, cols], df.iloc[row, col], df.query("age > 18")' }],
    codeExamples: [{ lang: 'python', code: 'import pandas as pd\n\ndf = pd.DataFrame({"name": ["A", "B"], "score": [90, 85]})\ndf.loc[df["score"] >= 88, ["name", "score"]]' }],
    pitfalls: ['Modifying slice copy not original.', 'Mixed types in one column.', 'Huge DataFrames in memory without dtypes optimization.'],
    practice: [{ question: 'loc vs iloc?', answer: 'loc uses labels; iloc uses integer positions.' }],
    cheatSheet: ['loc = labels', 'iloc = positions', 'avoid chained indexing'],
  }),

  'data cleaning & missing values': k({
    definition: '**Data cleaning** fixes missing values, duplicates, wrong types, and outliers before analysis — most real projects spend 60–80% of time here.',
    memoryTrick: 'Missing data is a signal — don\'t delete blindly, document strategy.',
    whyMatters: [wm('Quality', 'Bad data → wrong business decisions.'), wm('ML', 'Models fail silently on NaN.'), wm('Trust', 'Stakeholders ask how you handled gaps.')],
    sections: [{ heading: 'Strategies', content: 'dropna, fillna (mean/median/mode), interpolate, flag with indicator column, validate ranges' }],
    codeExamples: [{ lang: 'python', code: 'import pandas as pd\n\ndf = pd.read_csv("data.csv")\nprint(df.isna().sum())\ndf = df.drop_duplicates()\ndf["age"] = df["age"].fillna(df["age"].median())' }],
    pitfalls: ['Filling with mean on skewed data.', 'Dropping too many rows.', 'Not fixing dtypes (dates as strings).'],
    practice: [{ question: 'When median over mean for fill?', answer: 'Skewed distributions or outliers — median is robust.' }],
    cheatSheet: ['isna().sum()', 'drop_duplicates', 'fillna with strategy', 'fix dtypes'],
  }),

  'exploratory data analysis': k({
    definition: '**Exploratory Data Analysis (EDA)** investigates datasets with statistics and visuals to find patterns, anomalies, and hypotheses before modeling.',
    memoryTrick: 'Summarize → visualize → question → iterate.',
    whyMatters: [wm('Discovery', 'Find insights stakeholders care about.'), wm('ML', 'Feature ideas come from EDA.'), wm('Interviews', 'Walk through EDA on a dataset.')],
    sections: [{ heading: 'EDA Toolkit', content: 'describe(), value_counts(), histograms, boxplots, scatter plots, correlation matrix' }],
    codeExamples: [{ lang: 'python', code: 'import pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv("sales.csv")\nprint(df.describe())\ndf["revenue"].hist(bins=20)\nplt.title("Revenue distribution")\nplt.show()' }],
    pitfalls: ['Confirmation bias — only looking for expected patterns.', 'Ignoring outliers.', 'No documentation of findings.'],
    practice: [{ question: 'First three EDA steps?', answer: 'Shape/dtypes/missing, univariate stats, visualizations for distributions and relationships.' }],
    cheatSheet: ['describe + hist', 'scatter for relationships', 'document findings'],
  }),

  'data visualization with matplotlib': k({
    definition: '**Matplotlib** is Python\'s foundational plotting library — line, bar, scatter, histogram charts for reports and notebooks.',
    memoryTrick: 'plt.figure → plot → labels → plt.show() (or savefig).',
    whyMatters: [wm('Communication', 'Charts beat tables for stakeholders.'), wm('EDA', 'See outliers and trends instantly.'), wm('Portfolio', 'Notebooks with clear plots stand out.')],
    sections: [{ heading: 'Chart Types', content: 'plot (line), bar, hist, scatter, subplots for dashboards' }],
    codeExamples: [{ lang: 'python', code: 'import matplotlib.pyplot as plt\n\nregions = ["North", "South", "East"]\nrevenue = [120, 95, 140]\nplt.bar(regions, revenue)\nplt.ylabel("Revenue (₹ Lakhs)")\nplt.title("Revenue by Region")\nplt.savefig("revenue_by_region.png", dpi=150, bbox_inches="tight")' }],
    pitfalls: ['Unlabeled axes.', 'Misleading y-axis truncation.', 'Too many categories in one chart.'],
    practice: [{ question: 'Compare categories visually?', answer: 'Bar chart for categorical comparison; line for time series.' }],
    cheatSheet: ['label axes', 'title every chart', 'savefig for reports'],
  }),

  'descriptive statistics': k({
    definition: '**Descriptive statistics** summarize data — mean, median, mode, std, percentiles, and counts — without inferring population conclusions.',
    memoryTrick: 'Center (mean/median), spread (std/IQR), shape (skew).',
    whyMatters: [wm('Reports', 'KPI summaries for leadership.'), wm('ML', 'Feature scaling needs mean/std.'), wm('Quality', 'Detect drift with summary stats over time.')],
    sections: [{ heading: 'When to Use What', content: 'Mean — symmetric data; Median — skew/outliers; Mode — categorical; Std — spread' }],
    codeExamples: [{ lang: 'python', code: 'import pandas as pd\n\ndf = pd.read_csv("scores.csv")\nprint(df["score"].mean(), df["score"].median(), df["score"].std())\nprint(df["score"].quantile([0.25, 0.5, 0.75]))' }],
    pitfalls: ['Mean on heavily skewed revenue data.', 'Ignoring sample size.', 'Confusing correlation with causation.'],
    practice: [{ question: 'Salary data with few huge outliers — mean or median?', answer: 'Median — robust to outliers.' }],
    cheatSheet: ['mean/median/mode', 'std for spread', 'quantiles for percentiles'],
  }),

  'feature engineering basics': k({
    definition: '**Feature engineering** creates useful input columns from raw data — dates to day-of-week, text to counts, categories to one-hot encoding.',
    memoryTrick: 'Better features beat fancier models.',
    whyMatters: [wm('ML', 'Most Kaggle wins are feature work.'), wm('Tabular AI', 'scikit-learn needs numeric matrices.'), wm('Interviews', 'Explain encoding categorical variables.')],
    sections: [{ heading: 'Common Transforms', content: 'One-hot encoding, label encoding, binning, log transform, datetime features, text length/count' }],
    codeExamples: [{ lang: 'python', code: 'import pandas as pd\n\ndf = pd.read_csv("events.csv")\ndf["event_date"] = pd.to_datetime(df["event_date"])\ndf["day_of_week"] = df["event_date"].dt.dayofweek\npd.get_dummies(df, columns=["region"], prefix="region")' }],
    pitfalls: ['Leakage — using future information in features.', 'One-hot explosion on high-cardinality columns.', 'Not fitting encoders on train only.'],
    practice: [{ question: 'Feature leakage example?', answer: 'Using target-derived stats on full dataset before split — fit on train only.' }],
    cheatSheet: ['encode categories', 'extract datetime parts', 'avoid leakage'],
  }),

  'csv & json data loading': k({
    definition: 'Loading **CSV** and **JSON** files is the entry point for most Python data projects — `pandas.read_csv` and `json.load` / `read_json`.',
    memoryTrick: 'Always check encoding, separators, and date columns on load.',
    whyMatters: [wm('APIs', 'JSON is the web data format.'), wm('Exports', 'Business data arrives as CSV/Excel.'), wm('Pipelines', 'Ingest step before clean/EDA.')],
    sections: [{ heading: 'Load Options', content: 'parse_dates, dtype, usecols, na_values for CSV; orient and lines for JSON' }],
    codeExamples: [{ lang: 'python', code: 'import pandas as pd\nimport json\n\ndf = pd.read_csv("sales.csv", parse_dates=["order_date"])\nwith open("config.json") as f:\n    config = json.load(f)\nrecords = pd.read_json("data.json", orient="records")' }],
    pitfalls: ['Wrong delimiter (semicolon vs comma).', 'Large JSON loaded entirely into memory.', 'Not specifying UTF-8 encoding.'],
    practice: [{ question: 'Parse date column on CSV load?', answer: 'pd.read_csv(..., parse_dates=["order_date"])' }],
    cheatSheet: ['read_csv parse_dates', 'json.load for files', 'check dtypes after load'],
  }),

  'grouping & aggregation': k({
    definition: '**Grouping & aggregation** splits data by keys and computes summaries — Pandas `groupby` mirrors SQL GROUP BY.',
    memoryTrick: 'Split → apply → combine — groupby is split-apply-combine.',
    whyMatters: [wm('Analytics', 'Revenue by region, scores by class — daily questions.'), wm('SQL bridge', 'groupby translates SQL thinking to Python.'), wm('Interviews', 'Top-N per group problems.')],
    sections: [{ heading: 'Patterns', content: 'groupby().agg(), multiple aggregations, transform vs aggregate, size/count' }],
    codeExamples: [{ lang: 'python', code: 'import pandas as pd\n\ndf = pd.read_csv("sales.csv")\nsummary = df.groupby("region").agg(\n    total_revenue=("revenue", "sum"),\n    avg_order=("revenue", "mean"),\n    orders=("order_id", "count"),\n)\nprint(summary.sort_values("total_revenue", ascending=False))' }],
    pitfalls: ['Forgetting reset_index after groupby.', 'Aggregating wrong column dtype.', 'Confusing transform vs agg.'],
    practice: [{ question: 'SQL equivalent of groupby sum?', answer: 'SELECT region, SUM(revenue) FROM sales GROUP BY region' }],
    cheatSheet: ['groupby key', 'agg dict syntax', 'sort_values on result'],
  }),

  'correlation analysis': k({
    definition: '**Correlation analysis** measures linear relationships between numeric variables — Pearson coefficient from -1 to +1; not causation.',
    memoryTrick: 'Correlation ≠ causation — always say that in interviews.',
    whyMatters: [wm('EDA', 'Find related metrics for features.'), wm('Business', 'Spot redundant KPIs.'), wm('ML', 'Highly correlated features may be dropped.')],
    sections: [{ heading: 'Interpretation', content: 'Near +1: move together; near -1: inverse; near 0: weak linear relation; use heatmap for many columns' }],
    codeExamples: [{ lang: 'python', code: 'import pandas as pd\n\ndf = pd.read_csv("metrics.csv")\nprint(df[["hours_studied", "exam_score"]].corr())\nprint(df.corr(numeric_only=True))' }],
    pitfalls: ['Assuming causation from correlation.', 'Non-linear relationships missed by Pearson.', 'Outliers distort correlation.'],
    practice: [{ question: 'corr() = 0.9 between ads spend and revenue means?', answer: 'Strong positive linear association — not proof ads caused revenue.' }],
    cheatSheet: ['df.corr()', 'correlation ≠ causation', 'check scatter plot too'],
  }),

  'intro to scikit-learn': k({
    definition: '**scikit-learn** is Python\'s standard ML library — train/test split, models (regression, classification), metrics, and pipelines with a consistent API.',
    memoryTrick: 'fit on train, predict on test — never evaluate on training data.',
    whyMatters: [wm('ML entry', 'First library for tabular ML.'), wm('Internships', 'Baseline model expectations.'), wm('AI track prep', 'Foundation before deep learning.')],
    sections: [{ heading: 'Minimal Workflow', content: 'train_test_split → model.fit(X_train, y_train) → model.predict(X_test) → accuracy_score / rmse' }],
    codeExamples: [{ lang: 'python', code: 'from sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score\nimport pandas as pd\n\ndf = pd.read_csv("churn.csv")\nX = pd.get_dummies(df.drop("churned", axis=1))\ny = df["churned"]\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\nmodel = LogisticRegression(max_iter=1000).fit(X_train, y_train)\nprint(accuracy_score(y_test, model.predict(X_test)))' }],
    pitfalls: ['Evaluating on training set.', 'No stratify on imbalanced classification.', 'Leakage through preprocessing on full data.'],
    practice: [{ question: 'Why train_test_split?', answer: 'Estimate performance on unseen data — detect overfitting.' }],
    cheatSheet: ['train_test_split', 'fit/predict', 'metrics on test set', 'Pipeline for preprocessing'],
  }),
};

export function getPythonKnowledge(topic: string): TopicKnowledge | null {
  return PYTHON_KNOWLEDGE[topic.toLowerCase().trim()] ?? null;
}
