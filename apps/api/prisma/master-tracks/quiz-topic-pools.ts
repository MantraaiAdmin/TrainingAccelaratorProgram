/**
 * Topic-specific quiz question pools — substantive questions aligned with lesson content.
 */
import { QuizQuestionType } from '@prisma/client';
import { GeneratedQuestion } from './types';

type Q = GeneratedQuestion;

function mcq(q: string, options: string[], correct: string, explanation: string, code?: string): Q {
  return { type: QuizQuestionType.MCQ, question: q, options, correctAnswer: correct, explanation, code, points: 2 };
}

function debug(q: string, options: string[], correct: string, explanation: string, code?: string): Q {
  return { type: QuizQuestionType.DEBUGGING, question: q, options, correctAnswer: correct, explanation, code, points: 2 };
}

function output(q: string, options: string[], correct: string, explanation: string, code: string): Q {
  return { type: QuizQuestionType.CODE_OUTPUT, question: q, options, correctAnswer: correct, explanation, code, points: 2 };
}

/** Python track — topic-specific pools */
const PYTHON_POOLS: Record<string, Q[]> = {
  variables: [
    mcq('What is a Python variable?', ['A name bound to an object', 'A memory box storing bytes', 'A compile-time type declaration', 'A hardware register'], 'A name bound to an object', 'Python variables are references to objects.'),
    debug('After `b = a` on a list, `b.append(1)` changes `a`. Why?', ['Lists are mutable and b references same object', 'Python copies on assignment', 'Bug in interpreter', 'a and b are always independent'], 'Lists are mutable and b references same object', 'Assignment binds names to objects — no automatic copy.', 'a = [1]\nb = a\nb.append(2)'),
    output('What prints?', ['[1, 2]', '[1]', '[2]', 'Error'], '[1, 2]', 'Same list object mutated.', 'a = [1]\nb = a\nb.append(2)\nprint(a)'),
    mcq('Which naming follows PEP 8?', ['student_name', 'StudentName', '2name', 'class'], 'student_name', 'snake_case for variables and functions.'),
    output('What error?', ['NameError', 'TypeError', 'SyntaxError', '42'], 'NameError', 'Variable not defined.', 'print(x)'),
  ],
  'data types': [
    mcq('Which types are mutable?', ['list and dict', 'int and str', 'tuple and str', 'int and tuple'], 'list and dict', 'Mutable: list, dict, set. Immutable: int, str, tuple.'),
    output('Result of 5 + "10"?', ['TypeError', '15', '"510"', '510'], 'TypeError', 'Cannot add int and str without conversion.', 'x = 5\ny = "10"\nprint(x + y)'),
    output('bool([]), bool([0]), bool(0)?', ['False True False', 'True True False', 'False False False', 'True False True'], 'False True False', 'Empty list falsy; non-empty truthy; zero falsy.', 'print(bool([]), bool([0]), bool(0))'),
    mcq('Division 10 / 4 in Python 3?', ['2.5', '2', '2.0 with remainder 2', 'Error'], '2.5', 'True division always returns float in Python 3.'),
    debug('float(0.1) + float(0.2) != 0.3 due to?', ['IEEE 754 floating point representation', 'Python bug', 'Integer overflow', 'Wrong operator'], 'IEEE 754 floating point representation', 'Use decimal module for money calculations.'),
  ],
  loops: [
    output('Output of loop?', ['0 1 2 3 4', '1 2 3 4 5', '01234', 'Error'], '0 1 2 3 4', 'range(5) yields 0-4.', 'for i in range(5):\n    print(i, end=" ")'),
    mcq('Which loop for unknown iterations until condition?', ['while', 'for', 'do-while', 'foreach'], 'while', 'while loops continue until condition is false.'),
    output('Sum 1+2+3?', ['6', '3', '123', '0'], '6', 'Accumulation in loop.', 'total = 0\nfor n in [1, 2, 3]:\n    total += n\nprint(total)'),
    debug('Infinite loop likely caused by?', ['Condition never becomes false', 'Using for instead of while', 'Too many variables', 'Python version'], 'Condition never becomes false', 'Ensure loop variable progresses toward exit condition.'),
  ],
  functions: [
    mcq('Problem with `def f(x=[])`?', ['Shared mutable default across calls', 'Syntax error', 'Faster performance', 'None — valid pattern'], 'Shared mutable default across calls', 'Use None sentinel: def f(x=None): x = x or []'),
    output('Output?', ['Hello, Arjun', 'Hello Arjun', 'Error', 'None'], 'Hello, Arjun', 'Default parameter used.', 'def greet(name="Guest"):\n    return f"Hello, {name}"\nprint(greet("Arjun"))'),
    mcq('What does return without value return?', ['None', '0', 'False', 'Error'], 'None', 'Bare return exits with None.'),
  ],
  oop: [
    mcq('self in instance methods means?', ['Current instance reference', 'Class name', 'Static variable', 'Global scope'], 'Current instance reference', 'self is conventional first parameter for instance methods.'),
    mcq('Duck typing means?', ['Behavior matters not explicit type', 'Only ducks can be objects', 'Compile-time type check', 'No polymorphism'], 'Behavior matters not explicit type', 'If it has the method, it works.'),
    output('Method call output?', ['Woof', '...', 'Error', 'None'], 'Woof', 'Subclass overrides speak.', 'class Dog:\n    def speak(self): return "Woof"\nd = Dog()\nprint(d.speak())'),
  ],
  'rest apis': [
    mcq('HTTP method to create resource?', ['POST', 'GET', 'DELETE', 'HEAD'], 'POST', 'POST typically creates; GET reads.'),
    mcq('Status code for not found?', ['404', '200', '401', '500'], '404', '404 = resource not found.'),
    mcq('Idempotent method?', ['GET', 'POST', 'POST with side effects', 'None'], 'GET', 'GET should not change server state.'),
  ],
  'git & github': [
    mcq('Command to stage all changes?', ['git add .', 'git stage all', 'git commit -a', 'git push .'], 'git add .', 'git add stages; commit saves snapshot.'),
    mcq('Purpose of .gitignore?', ['Exclude files from Git tracking', 'Ignore compiler errors', 'Delete files', 'Encrypt secrets'], 'Exclude files from Git tracking', 'Never commit .env, node_modules, __pycache__.'),
  ],
};

/** Generic substantive questions when no topic pool exists */
function genericPool(topic: string, trackName: string, weekNum: number, trackSlug: string): Q[] {
  const lang = trackSlug.includes('full-stack') ? 'typescript' : 'python';
  const codeSample = lang === 'typescript'
    ? `const result = process("${topic}");\nconsole.log(result);`
    : `result = process("${topic}")\nprint(result)`;

  return [
    mcq(`In ${trackName} Week ${weekNum}, "${topic}" is best described as:`, [
      `A core concept engineers apply in production`,
      'Unrelated to software engineering',
      'Only theoretical with no practical use',
      'Deprecated and never used in industry',
    ], 'A core concept engineers apply in production', `${topic} is covered in Week ${weekNum} curriculum.`),
    debug(`A bug appears when implementing "${topic}". First step?`, [
      'Reproduce with minimal input and read the error',
      'Rewrite entire codebase',
      'Ignore and deploy',
      'Change programming language',
    ], 'Reproduce with minimal input and read the error', 'Systematic debugging beats random changes.'),
    output(`Given valid ${topic} logic, expected result status?`, ['ok', 'error', 'null', 'undefined'], 'ok', 'Valid implementation completes successfully.', codeSample),
    mcq(`Scenario: ${topic} fails before deadline. Best action?`, [
      'Reproduce locally, isolate smallest failing case, fix root cause',
      'Delete the feature silently',
      'Blame tooling without investigation',
      'Skip tests and merge',
    ], 'Reproduce locally, isolate smallest failing case, fix root cause', 'Production engineering prioritizes reproducible fixes.'),
  ];
}

function normalizeTopic(topic: string): string {
  return topic.toLowerCase().trim();
}

export function getQuestionsForTopic(
  topic: string,
  trackSlug: string,
  trackName: string,
  weekNum: number,
  type: QuizQuestionType,
  index: number,
): GeneratedQuestion {
  const key = normalizeTopic(topic);
  const pool = (trackSlug === 'python-engineering-foundations' ? PYTHON_POOLS[key] : null)
    ?? genericPool(topic, trackName, weekNum, trackSlug);

  const typed = pool.filter((q) => q.type === type);
  const source = typed.length > 0 ? typed : pool;
  const picked = source[index % source.length];

  return {
    ...picked,
    question: `[${topic}] ${picked.question}`,
  };
}

export function buildWeeklyQuestions(
  trackSlug: string,
  trackName: string,
  weekTitle: string,
  weekNum: number,
  topics: string[],
): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];
  const topic = (i: number) => topics[i % topics.length] || weekTitle;

  const blocks: Array<{ count: number; type: QuizQuestionType }> = [
    { count: 15, type: QuizQuestionType.MCQ },
    { count: 10, type: QuizQuestionType.DEBUGGING },
    { count: 10, type: QuizQuestionType.CODE_OUTPUT },
    { count: 5, type: QuizQuestionType.MCQ },
    { count: 5, type: QuizQuestionType.MCQ },
    { count: 5, type: QuizQuestionType.MCQ },
  ];

  let globalIdx = 0;
  for (const block of blocks) {
    for (let i = 0; i < block.count; i++) {
      const t = topic(globalIdx);
      const typeIdx = Math.floor(i / Math.max(1, topics.length));
      questions.push(getQuestionsForTopic(t, trackSlug, trackName, weekNum, block.type, typeIdx + i));
      globalIdx++;
    }
  }

  return questions;
}
