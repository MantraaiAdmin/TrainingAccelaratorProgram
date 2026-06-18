/** Full-depth lesson bodies for Python Engineering Foundations — Week 2 */

const wrap = (sections: string) => sections.trim();

export const PYTHON_WEEK2_LESSONS: Record<string, string> = {
  variables: wrap(`
## What is a Variable?

A **variable** is a **name** that refers to a value stored in memory. In Python, variables are not boxes — they are **labels attached to objects**.

When you write:

\`\`\`python
x = 42
\`\`\`

Python does three things:
1. Creates an \`int\` object with value \`42\` in memory
2. Creates the name \`x\`
3. **Binds** \`x\` → that object

> **Memory trick:** Think of variables as **sticky notes on objects**, not containers that hold values.

---

## Why Variables Matter (Industry View)

| Reason | What it means for you |
|--------|------------------------|
| **Readability** | \`monthly_salary_inr\` tells a story; \`x\` does not |
| **Debugging** | Clear names make stack traces and logs easier to trace |
| **Team reviews** | Seniors reject vague names in pull requests |
| **Fewer bugs** | Shared references (\`b = a\`) cause silent data corruption if misunderstood |
| **Interview signal** | You must explain reference vs value in Python screening rounds |

---

## Variables Across Languages (Quick Compare)

| Language | Declaration style | Type on variable? |
|----------|-------------------|-------------------|
| **Python** | \`age = 21\` | No — dynamic typing |
| **Java** | \`int age = 21;\` | Yes — must declare type |
| **C** | \`int age = 21;\` | Yes — fixed at compile time |
| **JavaScript** | \`let age = 21\` | No — like Python (with \`let\`/\`const\`) |

Python trades compile-time type safety for speed of writing — that is why **type hints** and **tests** matter in production teams.

---

## Python Variable Naming Rules

| Rule | Valid | Invalid |
|------|-------|---------|
| Letters, digits, underscore | \`student_name\`, \`score2\` | \`2score\` (starts with digit) |
| Case-sensitive | \`age\` and \`Age\` are different | — |
| No reserved keywords | \`total_marks\` | \`class\`, \`for\`, \`def\` |
| Descriptive names | \`monthly_salary_inr\` | \`x\`, \`temp\`, \`data\` |

**PEP 8 convention:** \`snake_case\` for variables and functions.

\`\`\`python
# Good engineering names
student_id = 101
is_enrolled = True
course_fee_inr = 4999.0

# Avoid single letters except loop counters (i, j, k)
\`\`\`

---

## Assignment & Rebinding

\`\`\`python
a = 10      # a → int object 10
a = 20      # a now → int object 20 (rebinding, not "changing 10 to 20")
a = "hello" # a now → str object (Python is dynamically typed)
\`\`\`

**Multiple assignment:**

\`\`\`python
x = y = z = 0          # all three names → same int 0
width, height = 800, 600   # tuple unpacking
\`\`\`

**Swap without temp variable:**

\`\`\`python
a, b = 5, 10
a, b = b, a   # a=10, b=5
\`\`\`

---

## Variables & Memory (Reference Model)

\`\`\`python
list_a = [1, 2, 3]
list_b = list_a      # both names point to SAME list object
list_b.append(4)
print(list_a)        # [1, 2, 3, 4] — surprising if you think variables are boxes!

print(id(list_a))    # same memory address as id(list_b)
\`\`\`

| Function | Purpose |
|----------|---------|
| \`id(x)\` | Memory identity of the object |
| \`type(x)\` | Class of the object |
| \`isinstance(x, int)\` | Safe type check (preferred) |

**Copy when you need independence:**

\`\`\`python
import copy
original = [[1, 2], [3, 4]]
shallow = copy.copy(original)
deep = copy.deepcopy(original)
\`\`\`

---

## Constants (Convention)

Python has no true \`const\`, but engineers use **UPPER_SNAKE_CASE**:

\`\`\`python
MAX_RETRIES = 3
API_BASE_URL = "https://api.constel.ai"
DEFAULT_PASS_SCORE = 80
\`\`\`

Do not reassign constants — linters and reviewers will flag it.

---

## Dynamic Typing

The **type belongs to the object**, not the variable name:

\`\`\`python
value = 100        # int
value = "Constel"  # now str — completely valid in Python
\`\`\`

This flexibility speeds prototyping but requires **discipline** in production (type hints help).

---

## Type Hints (Engineering Best Practice)

\`\`\`python
def calculate_total(price: float, quantity: int) -> float:
    return price * quantity

student_name: str = "Arjun"
age: int = 21
\`\`\`

Type hints do not enforce types at runtime — they document intent and enable IDE support.

---

## Common Mistakes (Avoid These)

1. **Using reserved keywords** → \`SyntaxError\`
2. **Assuming assignment copies lists/dicts** → accidental shared mutation
3. **Undefined variable** → \`NameError: name 'x' is not defined\`
4. **Shadowing built-ins** → \`list = [1,2,3]\` breaks \`list()\` function
5. **Vague names** → \`n\`, \`val\`, \`stuff\` make code unreadable in teams

---

## Quick Revision Table

| Concept | One-line memory |
|---------|-----------------|
| Variable | Name → object reference |
| \`=\` | Binds name to object |
| Dynamic typing | Type on object, not name |
| \`id()\` | Where object lives in memory |
| \`snake_case\` | Python naming standard |
| UPPER_CASE | Constant convention |

---

## Practice Questions

**Q1.** What does this print?

\`\`\`python
a = [1, 2]
b = a
b.append(3)
print(a)
\`\`\`

> **Answer:** [1, 2, 3] — same list object.

**Q2.** What error occurs?

\`\`\`python
print(undefined_var)
\`\`\`

> **Answer:** NameError — name not bound to any object.

**Q3.** After this code, what is \`x\`?

\`\`\`python
x = 5
x = x + 1
\`\`\`

> **Answer:** 6 — rebound to new int object.

**Q4.** What prints?

\`\`\`python
x = 5
y = "10"
print(x + y)
\`\`\`

> **Answer:** TypeError — cannot add int and str. Variables point to different types; use int(y) or str(x).

**Q5.** How many list objects exist after this?

\`\`\`python
a = [1, 2]
b = [1, 2]
c = a
\`\`\`

> **Answer:** Two list objects. \`a\` and \`c\` share one; \`b\` is a separate object with equal contents.

---

## One-Page Cheat Sheet (Memorize This)

\`\`\`
VARIABLE = name → object (reference, not a box)
=          = bind / rebind (never "store inside")
id(x)      = where the object lives
type(x)    = what class the object is
snake_case = standard Python variable style
UPPER_CASE = constant convention (don't reassign)
a = b      = both names → same object (for mutable types, changes show everywhere)
copy.copy  = shallow copy; copy.deepcopy = full independence
\`\`\`

---

## Lab Connection

Apply variables in **CLI utilities** and **validation systems** labs this week. Every input you read, validate, and store uses the reference model you learned here.
`),

  'memory concepts': wrap(`
## How Python Stores Data in Memory

Python manages memory automatically via **reference counting** and a **garbage collector**. You don't \`malloc\` / \`free\` like C — but engineers still must understand **what happens under the hood** to avoid bugs and memory leaks.

---

## Objects, References, and Names

\`\`\`python
x = 42
\`\`\`

| Component | What it is |
|-----------|------------|
| Object | The actual \`int(42)\` in heap memory |
| Reference | Pointer from name \`x\` to that object |
| Namespace | Table of names in current scope |

\`\`\`python
import sys
x = 42
print(sys.getrefcount(x))  # how many references exist (approx)
print(id(x))               # unique object identity
\`\`\`

---

## Stack vs Heap (Conceptual)

| Stack | Heap |
|-------|------|
| Function calls, local frame info | Objects (lists, dicts, custom classes) |
| Fast, automatic cleanup on return | Managed by Python GC |
| Stores references, not big objects | Where your data actually lives |

When a function returns, its **local names** disappear — but **objects** remain if something else still references them.

---

## Mutable vs Immutable

| Immutable (safe as dict keys) | Mutable (change in place) |
|-------------------------------|---------------------------|
| \`int\`, \`float\`, \`str\`, \`tuple\`, \`frozenset\` | \`list\`, \`dict\`, \`set\`, custom objects |

\`\`\`python
# Immutable — creates NEW object
s = "hello"
s = s + " world"   # new str object, old "hello" may be garbage collected

# Mutable — same object modified
nums = [1, 2, 3]
nums.append(4)     # object mutated in place
\`\`\`

**Interview favorite:** Why can't lists be dictionary keys? → Because they are mutable (unhashable).

---

## Garbage Collection

Python frees objects when **reference count hits zero**.

\`\`\`python
def create_data():
    big_list = [0] * 1_000_000
    return big_list[0]   # big_list eligible for GC after return

# Circular references (rare in beginner code) need cyclic GC
\`\`\`

---

## Shallow vs Deep Copy

\`\`\`python
import copy

matrix = [[1, 2], [3, 4]]
shallow = copy.copy(matrix)
deep = copy.deepcopy(matrix)

matrix[0][0] = 99
print(shallow[0][0])  # 99 — inner lists shared
# deep copy would remain 1
\`\`\`

---

## Memory-Efficient Patterns

\`\`\`python
# Generators — lazy, O(1) memory for large sequences
def read_lines(path):
    with open(path) as f:
        for line in f:
            yield line.strip()

# __slots__ in classes — reduce per-instance memory (advanced)
\`\`\`
`),

  'data types': wrap(`
## What is a Data Type?

A **data type** tells Python:
- What **kind of value** is stored
- Which **operations** are allowed (\`+\` on numbers vs strings)
- Whether the value can **change in place** (mutability)

> **Memory trick:** Data type = **rules of the game** for a piece of data.

---

## Python Built-in Types Overview

| Category | Types | Example |
|----------|-------|---------|
| Numeric | \`int\`, \`float\`, \`complex\` | \`42\`, \`3.14\`, \`2+3j\` |
| Text | \`str\` | \`"Constel Nexus"\` |
| Boolean | \`bool\` | \`True\`, \`False\` |
| Sequence | \`list\`, \`tuple\`, \`range\` | \`[1,2]\`, \`(1,2)\`, \`range(5)\` |
| Mapping | \`dict\` | \`{"name": "Arjun"}\` |
| Set | \`set\`, \`frozenset\` | \`{1, 2, 3}\` |
| Binary | \`bytes\`, \`bytearray\` | Network / file data |
| None | \`NoneType\` | \`None\` — absence of value |

---

## 1. Numeric Types

\`\`\`python
age = 21                    # int — unlimited precision in Python 3
gpa = 9.25                  # float — IEEE 754 (watch rounding!)
price = 4999
tax = 0.18
total = price * (1 + tax)   # float result

# Division always returns float in Python 3
print(10 / 4)    # 2.5
print(10 // 4)   # 2 — floor division
print(10 % 4)    # 2 — modulo
print(2 ** 10)   # 1024 — exponent
\`\`\`

**Float trap (memorize for interviews):**

\`\`\`python
print(0.1 + 0.2)  # 0.30000000000000004 — use decimal module for money
\`\`\`

---

## 2. Strings (\`str\`)

Immutable sequence of Unicode characters.

\`\`\`python
name = "Arjun"
college = 'CIT'
message = """Multi-line
string for docs"""

# Indexing & slicing
print(name[0])      # A
print(name[-1])     # n
print(name[1:3])    # rj
print(len(name))    # 5
\`\`\`

---

## 3. Boolean (\`bool\`)

Subclass of \`int\`: \`True == 1\`, \`False == 0\`.

\`\`\`python
is_active = True
has_paid = False

# Truthy / Falsy — CRITICAL for interviews
falsy = [0, 0.0, "", [], {}, set(), None, False]
# Almost everything else is truthy
\`\`\`

---

## 4. Lists (\`list\`)

Ordered, mutable, allows duplicates.

\`\`\`python
scores = [85, 90, 78, 90]
scores.append(92)
scores.sort()
print(scores[0])       # access O(1)
print(scores[-1])      # last item
\`\`\`

---

## 5. Tuples (\`tuple\`)

Ordered, **immutable** — use for fixed records.

\`\`\`python
student = ("Arjun", 21, "CSE")
name, age, dept = student   # unpacking
# student[0] = "X"  # TypeError — cannot mutate
\`\`\`

---

## 6. Dictionaries (\`dict\`)

Key-value mapping — Python's hash table. Keys must be **immutable**.

\`\`\`python
profile = {
    "name": "Arjun",
    "age": 21,
    "skills": ["Python", "Git"],
}
profile["email"] = "arjun@demo.com"
print(profile.get("phone", "N/A"))  # safe access
\`\`\`

---

## 7. Sets (\`set\`)

Unordered collection of **unique** elements.

\`\`\`python
tags = {"python", "backend", "python"}  # → {"python", "backend"}
tags.add("api")
a = {1, 2, 3}
b = {3, 4, 5}
print(a | b)   # union
print(a & b)   # intersection
\`\`\`

---

## Type Conversion (Casting)

\`\`\`python
# Implicit
x = 5
y = 2.5
result = x + y    # 7.5 — int promoted to float

# Explicit
age_str = "21"
age = int(age_str)
price = float("19.99")
flag = bool(1)    # True

# Invalid — will crash
# int("hello")  # ValueError
\`\`\`

---

## Type Checking

\`\`\`python
value = 42
print(type(value))           # <class 'int'>
print(isinstance(value, int))  # True — preferred
print(isinstance(value, (int, float)))  # True — multiple types
\`\`\`

---

## Why Data Types Matter in Engineering

| Reason | Example |
|--------|---------|
| **Memory** | Use \`set\` for uniqueness checks vs scanning lists |
| **Correctness** | Don't add \`int + str\` without conversion |
| **API contracts** | JSON → Python: objects become \`dict\`, arrays → \`list\` |
| **Performance** | Choose \`dict\` for O(1) lookup vs O(n) list scan |

---

## Practice Questions

**Q1.** Output?

\`\`\`python
x = 5
y = "10"
print(x + y)
\`\`\`

> **Answer:** TypeError — cannot add int and str. Fix with int(y).

**Q2.** Which are mutable?

\`\`\`python
a = (1, 2)
b = [1, 2]
c = "hi"
d = {"k": 1}
\`\`\`

> **Answer:** b (list) and d (dict) only.

**Q3.** Output?

\`\`\`python
print(bool([]), bool([0]), bool(0))
\`\`\`

> **Answer:** False, True, False — empty list falsy, non-empty truthy, zero falsy.
`),

  'string manipulation': wrap(`
## Strings in Python Engineering

Strings are **immutable** sequences — every "change" creates a new string. They appear everywhere: API responses, user input, logs, file paths, SQL queries, and UI text.

---

## Creating & Accessing Strings

\`\`\`python
single = 'Constel'
double = "Nexus"
multi = """Line 1
Line 2"""

# Raw strings — backslashes literal (regex, Windows paths)
path = r"C:\\Users\\student\\project"

print(multi[0])       # L
print(multi[-1])      # last char
print(multi[0:5])     # slice
\`\`\`

---

## Essential String Methods (Memorize Top 15)

| Method | Purpose | Example |
|--------|---------|---------|
| \`.lower() / .upper()\` | Case change | \`"Hi".lower()\` → \`"hi"\` |
| \`.strip()\` | Remove whitespace | \`"  hi  ".strip()\` |
| \`.split(sep)\` | String → list | \`"a,b".split(",")\` |
| \`.join(iter)\` | List → string | \`",".join(["a","b"])\` |
| \`.replace(old,new)\` | Substitute | \`"cat".replace("c","b")\` |
| \`.find(sub)\` | Index or -1 | \`"hello".find("l")\` → 2 |
| \`.startswith / .endswith\` | Prefix/suffix test | validation |
| \`.isdigit()\` | All digits? | input validation |
| \`.isalpha()\` | All letters? | name validation |
| \`.count(sub)\` | Occurrences | \`"aaa".count("a")\` → 3 |
| \`.format()\` | Template (legacy) | see f-strings |
| \`in\` operator | Substring test | \`"py" in "python"\` |

---

## Split & Join Pattern (Very Common)

\`\`\`python
csv_line = "Arjun,21,CSE"
fields = csv_line.split(",")
# ['Arjun', '21', 'CSE']

rebuilt = "|".join(fields)
# Arjun|21|CSE
\`\`\`

---

## Validation Example (Real Engineering)

\`\`\`python
def validate_email(email: str) -> bool:
    email = email.strip().lower()
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        return False
    local, _, domain = email.partition("@")
    return bool(local) and "." in domain

print(validate_email("  Student@Demo.COM  "))  # True
\`\`\`

---

## String Immutability

\`\`\`python
s = "hello"
# s[0] = "H"  # TypeError!
s = "H" + s[1:]  # create new string
\`\`\`

For many concatenations in loops, use \`list\` + \`join\` (O(n)) instead of \`+=\` in tight loops on huge data.

---

## Encoding (Production Awareness)

\`\`\`python
text = "Constel ₹4999"
encoded = text.encode("utf-8")   # bytes for network/storage
decoded = encoded.decode("utf-8")
\`\`\`

Always use **UTF-8** for web APIs and files.

---

## Practice

\`\`\`python
# Reverse words in a sentence
sentence = "Python engineering foundations"
words = sentence.split()
reversed_words = " ".join(reversed(words))
print(reversed_words)
# foundations engineering Python
\`\`\`
`),

  formatting: wrap(`
## String Formatting in Python

Displaying data clearly is essential for CLIs, logs, reports, and user-facing apps. Python offers three main approaches — **f-strings are the industry standard** (Python 3.6+).

---

## 1. f-strings (Preferred)

\`\`\`python
name = "Arjun"
score = 87.456
week = 2

print(f"Student: {name}, Score: {score:.1f}%, Week: {week}")
# Student: Arjun, Score: 87.5%, Week: 2
\`\`\`

### Format specifiers (memorize)

| Spec | Meaning | Example |
|------|---------|---------|
| \`:.2f\` | 2 decimal floats | \`f"{3.14159:.2f}"\` → \`3.14\` |
| \`:,\` (comma) | Thousands separator | \`f"{1000000:,}"\` → 1,000,000 |
| \`:>10\` | Right-align width 10 | tables |
| \`:<10\` | Left-align | tables |
| \`:^10\` | Center | headers |
| \`:05d\` | Zero-pad int | \`f"{7:05d}"\` → 00007 |
| \`:.1%\` | Percentage | \`f"{0.856:.1%}"\` → 85.6% |

---

## 2. \`.format()\` method (Legacy but common in older code)

\`\`\`python
"{} scored {}%".format("Arjun", 87)
"{name} scored {score}%".format(name="Arjun", score=87)
\`\`\`

---

## 3. % operator (Old C-style — avoid in new code)

\`\`\`python
"Student: %s, Age: %d" % ("Arjun", 21)
\`\`\`

---

## Engineering Tables (CLI Output)

\`\`\`python
students = [
    ("Arjun", 87.5, "PASS"),
    ("Priya", 92.0, "PASS"),
    ("Ravi", 71.0, "FAIL"),
]

print(f"{'Name':<12} {'Score':>8} {'Status':>8}")
print("-" * 30)
for name, score, status in students:
    print(f"{name:<12} {score:>8.1f} {status:>8}")
\`\`\`

Output:
\`\`\`
Name            Score   Status
------------------------------
Arjun             87.5     PASS
Priya             92.0     PASS
Ravi              71.0     FAIL
\`\`\`

---

## Formatting Dates & Currency

\`\`\`python
from datetime import datetime

now = datetime.now()
print(f"Report generated: {now:%Y-%m-%d %H:%M}")

fee_inr = 4999
print(f"Course fee: ₹{fee_inr:,}")
\`\`\`

---

## Debug f-strings (Python 3.8+)

\`\`\`python
score = 42
print(f"{score=}")   # score=42 — quick debugging
\`\`\`
`),

  'pythonic coding': wrap(`
## What Does "Pythonic" Mean?

**Pythonic code** follows the philosophy of the Python language: **readable, simple, explicit** — often summarized as *"There should be one obvious way to do it."*

Non-Pythonic code works but fights the language. Pythonic code is what senior engineers expect in reviews.

---

## Zen of Python (Run \`import this\`)

Key principles:
- Beautiful is better than ugly
- Explicit is better than implicit
- Simple is better than complex
- Readability counts

---

## Pythonic Patterns

### 1. List comprehensions (instead of verbose loops)

\`\`\`python
# Non-Pythonic
squares = []
for n in range(10):
    squares.append(n ** 2)

# Pythonic
squares = [n ** 2 for n in range(10)]
evens = [n for n in range(20) if n % 2 == 0]
\`\`\`

### 2. Enumerate (index + value)

\`\`\`python
# Non-Pythonic
i = 0
for item in items:
    print(i, item)
    i += 1

# Pythonic
for i, item in enumerate(items):
    print(i, item)
\`\`\`

### 3. \`with\` for files (context managers)

\`\`\`python
# Non-Pythonic — may leak file handle on error
f = open("data.txt")
data = f.read()
f.close()

# Pythonic
with open("data.txt") as f:
    data = f.read()
\`\`\`

### 4. Truthiness

\`\`\`python
# Non-Pythonic
if len(items) > 0:
    process(items)

# Pythonic
if items:
    process(items)
\`\`\`

### 5. \`dict.get\` for safe access

\`\`\`python
# Non-Pythonic
if "key" in config:
    value = config["key"]
else:
    value = "default"

# Pythonic
value = config.get("key", "default")
\`\`\`

### 6. Unpacking

\`\`\`python
first, *middle, last = [1, 2, 3, 4, 5]
# first=1, middle=[2,3,4], last=5
\`\`\`

### 7. \`any\` / \`all\`

\`\`\`python
scores = [78, 85, 92, 88]
passed = all(s >= 80 for s in scores)
has_perfect = any(s == 100 for s in scores)
\`\`\`

---

## PEP 8 Style Summary

| Rule | Example |
|------|---------|
| Indent 4 spaces | not tabs |
| Max line ~88-100 chars | use Black formatter |
| 2 blank lines before top-level functions | readability |
| Docstrings on public functions | \`"""Explain purpose."""\` |
| Imports: stdlib → third-party → local | grouped |

---

## Anti-patterns to Avoid

\`\`\`python
# Don't compare to True/False explicitly
if is_active == True:   # bad
if is_active:           # good

# Don't use mutable default arguments
def add_item(item, lst=[]):  # BUG — shared list!
    lst.append(item)

def add_item(item, lst=None):  # good
    if lst is None:
        lst = []
    lst.append(item)
    return lst
\`\`\`

---

## Interview Tip

When asked "write Python to solve X", prefer:
1. Readable names
2. Built-ins over manual loops
3. Edge case handling
4. Brief comment only where logic is non-obvious
`),
};
