import { TopicKnowledge } from '../lesson-builder';
import { defaultKnowledge } from './python-knowledge';

type KnowledgeMap = Record<string, TopicKnowledge>;
const wm = (reason: string, detail: string) => ({ reason, detail });
const k = (p: TopicKnowledge) => p;

export const FULLSTACK_KNOWLEDGE: KnowledgeMap = {
  'react internals': k({
    definition: '**React internals** cover how React reconciles UI updates via the Virtual DOM, fiber architecture, and the render/commit phases.',
    memoryTrick: 'State change → re-render → diff → patch real DOM.',
    whyMatters: [wm('Performance', 'Avoid unnecessary re-renders.'), wm('Interviews', 'Explain useState batching and keys.'), wm('Debugging', 'React DevTools trace update causes.')],
    sections: [{ heading: 'Render Cycle', content: '1. Trigger (setState)\n2. Render phase (pure, can abort)\n3. Commit phase (DOM updates, effects run)' }],
    codeExamples: [{ lang: 'tsx', code: 'function Counter() {\n  const [n, setN] = useState(0);\n  return (\n    <button onClick={() => setN(n + 1)}>\n      Count: {n}\n    </button>\n  );\n}' }],
    pitfalls: ['Mutating state directly.', 'Missing key in lists.', 'Creating objects in render causing child re-renders.'],
    practice: [{ question: 'Why keys in lists?', answer: 'Help React identify items across reorders — stable identity.' }],
    cheatSheet: ['Virtual DOM diff', 'fiber = work unit', 'keys on lists', 'never mutate state'],
  }),

  'component architecture': k({
    definition: '**Component architecture** organizes UI into composable, reusable pieces — containers vs presentational, atomic design, and clear prop contracts.',
    memoryTrick: 'Smart container fetches data; dumb component renders UI.',
    whyMatters: [wm('Maintainability', 'Large apps need structure.'), wm('Reuse', 'Design systems share components.'), wm('Testing', 'Pure components easy to test.')],
    sections: [{ heading: 'Composition', content: 'Prefer `children` and slots over prop drilling. Use context sparingly for theme/auth.' }],
    codeExamples: [{ lang: 'tsx', code: 'type ButtonProps = { variant: "primary" | "ghost"; onClick: () => void; children: React.ReactNode };\n\nexport function Button({ variant, onClick, children }: ButtonProps) {\n  return <button className={`btn btn-${variant}`} onClick={onClick}>{children}</button>;\n}' }],
    pitfalls: ['God components 500+ lines.', 'Prop drilling 5 levels — use context or composition.'],
    practice: [{ question: 'Presentational vs container?', answer: 'Presentational = UI only; container = data + logic.' }],
    cheatSheet: ['small components', 'typed props', 'composition > inheritance'],
  }),

  hooks: k({
    definition: '**Hooks** let function components use state and lifecycle: `useState`, `useEffect`, `useMemo`, `useCallback`, custom hooks.',
    memoryTrick: 'Rules of Hooks: top level only, React functions only.',
    whyMatters: [wm('Modern React', 'Class components legacy in new code.'), wm('Reuse', 'Custom hooks share logic.'), wm('Bugs', 'useEffect deps wrong = infinite loop.')],
    sections: [{ heading: 'Common Hooks', content: '| Hook | Purpose |\n|------|--------|\n| useState | Local state |\n| useEffect | Side effects |\n| useMemo | Expensive compute cache |\n| useCallback | Stable function ref |\n| useRef | DOM / mutable box |' }],
    codeExamples: [{ lang: 'tsx', code: 'useEffect(() => {\n  const ctrl = new AbortController();\n  fetch("/api/user", { signal: ctrl.signal })\n    .then(r => r.json())\n    .then(setUser);\n  return () => ctrl.abort();\n}, []);' }],
    pitfalls: ['Missing effect cleanup.', 'Stale closure in effects.', 'useMemo everywhere without need.'],
    practice: [{ question: 'useEffect empty deps []?', answer: 'Run once on mount; cleanup on unmount.' }],
    cheatSheet: ['useState', 'useEffect + deps', 'custom hooks extract logic'],
  }),

  typescript: k({
    definition: '**TypeScript** adds static types to JavaScript — catch errors at compile time, improve IDE autocomplete, document APIs via interfaces.',
    memoryTrick: 'interface = contract. type = alias. unknown > any.',
    whyMatters: [wm('Scale', 'Large codebases need types.'), wm('Refactor', 'Rename safely across project.'), wm('Jobs', 'Most React jobs require TS.')],
    sections: [{ heading: 'Core Types', content: 'Primitives, unions `A | B`, generics `Array<T>`, `interface` vs `type`, strict null checks.' }],
    codeExamples: [{ lang: 'typescript', code: 'interface User {\n  id: string;\n  name: string;\n  role: "admin" | "student";\n}\n\nfunction greet(user: User): string {\n  return `Hello, ${user.name}`;\n}' }],
    pitfalls: ['Using any defeats purpose.', 'Not narrowing union types.', 'Ignoring strict mode errors.'],
    practice: [{ question: 'interface vs type?', answer: 'interface extendable/mergeable; type for unions/intersections — both work for objects.' }],
    cheatSheet: ['strict mode on', 'avoid any', 'union narrowing', 'generics for reuse'],
  }),

  'reusable systems': k({
    definition: '**Reusable systems** are design tokens, component libraries, and shared hooks that enforce consistency across product surfaces.',
    memoryTrick: 'Design once — use everywhere (Button, Input, Modal).',
    whyMatters: [wm('Speed', 'Ship features faster with library.'), wm('Brand', 'Consistent UX.'), wm('Quality', 'Fix bug once, fix everywhere.')],
    sections: [{ heading: 'Design System Layers', content: 'Tokens (colors, spacing) → Primitives (Button) → Patterns (LoginForm) → Pages' }],
    codeExamples: [{ lang: 'tsx', code: 'export const tokens = { spacing: { sm: 4, md: 8, lg: 16 }, colors: { primary: "#6366f1" } };\n\nexport function Card({ title, children }: { title: string; children: React.ReactNode }) {\n  return <section className="rounded-lg border p-4">{title && <h3>{title}</h3>}{children}</section>;\n}' }],
    pitfalls: ['Over-abstracting before second use.', 'No documentation for components.'],
    practice: [{ question: 'When extract component?', answer: 'Second copy-paste or clear single responsibility boundary.' }],
    cheatSheet: ['tokens → primitives → patterns', 'document props', 'Storybook optional'],
  }),

  'next.js app router': k({
    definition: '**Next.js App Router** (app/) uses file-system routing, React Server Components, layouts, and loading/error boundaries.',
    memoryTrick: 'page.tsx = route. layout.tsx = shared shell. loading.tsx = suspense fallback.',
    whyMatters: [wm('Industry', 'Default for new Next projects.'), wm('Performance', 'RSC reduce client JS.'), wm('SEO', 'Server rendering built-in.')],
    sections: [{ heading: 'File Conventions', content: '`app/dashboard/page.tsx` → /dashboard\n`layout.tsx` wraps children\n`route.ts` for API handlers' }],
    codeExamples: [{ lang: 'tsx', code: '// app/learn/[slug]/page.tsx\nexport default async function Page({ params }: { params: { slug: string } }) {\n  const data = await fetchCourse(params.slug);\n  return <CourseView data={data} />;\n}' }],
    pitfalls: ['Client component by default confusion — add "use client".', 'Fetching in client what should be server.'],
    practice: [{ question: 'Server vs Client component?', answer: 'Server: data fetch, no hooks. Client: interactivity, useState, useEffect.' }],
    cheatSheet: ['app/ directory', 'page.tsx = route', 'use client for hooks', 'layouts nest'],
  }),

  'ssr/csr': k({
    definition: '**SSR** renders HTML on server per request; **CSR** renders in browser; **SSG** pre-renders at build; **ISR** revalidates static pages.',
    memoryTrick: 'SSR = fresh + SEO. CSR = interactive SPA. SSG = fast static.',
    whyMatters: [wm('SEO', 'Marketing pages need SSR/SSG.'), wm('TTFB', 'Balance server cost vs client load.'), wm('Interviews', 'Compare rendering strategies.')],
    sections: [{ heading: 'When to Choose', content: '| Strategy | Best for |\n|----------|----------|\n| SSR | Personalized, SEO |\n| CSR | Dashboards behind auth |\n| SSG | Docs, blogs |\n| ISR | E-commerce catalog |' }],
    codeExamples: [{ lang: 'tsx', code: '// Server Component — SSR by default in App Router\nexport default async function Products() {\n  const products = await db.product.findMany();\n  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>;\n}' }],
    pitfalls: ['SSR for heavy client-only widgets.', 'Hydration mismatch errors.'],
    practice: [{ question: 'Hydration?', answer: 'React attaches event listeners to server HTML — mismatch causes errors.' }],
    cheatSheet: ['SSR server render', 'CSR client render', 'SSG build time', 'match strategy to page'],
  }),

  'auth flows': k({
    definition: '**Auth flows** cover login, registration, session/JWT management, protected routes, and logout — typically cookie or Bearer token based.',
    memoryTrick: 'Never store JWT in localStorage if XSS risk — httpOnly cookies safer.',
    whyMatters: [wm('Security', 'Auth bugs = data breaches.'), wm('UX', 'Smooth login retains users.'), wm('Compliance', 'Session timeout requirements.')],
    sections: [{ heading: 'Flow Steps', content: '1. User submits credentials\n2. Server validates + issues token/session\n3. Client stores securely\n4. Middleware guards routes\n5. Refresh/expire handling' }],
    codeExamples: [{ lang: 'typescript', code: '// middleware.ts sketch\nexport function middleware(req: NextRequest) {\n  const token = req.cookies.get("session")?.value;\n  if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {\n    return NextResponse.redirect(new URL("/login", req.url));\n  }\n}' }],
    pitfalls: ['Tokens in localStorage.', 'No CSRF protection on cookies.', 'Weak password validation.'],
    practice: [{ question: 'httpOnly cookie benefit?', answer: 'JavaScript cannot read it — reduces XSS token theft.' }],
    cheatSheet: ['httpOnly cookies', 'protect routes', 'hash passwords server-side', 'refresh token pattern'],
  }),

  'frontend optimization': k({
    definition: '**Frontend optimization** improves Core Web Vitals — LCP, FID/INP, CLS — via code splitting, image optimization, caching, and bundle analysis.',
    memoryTrick: 'Measure with Lighthouse — optimize largest bottleneck first.',
    whyMatters: [wm('UX', 'Slow sites lose users.'), wm('SEO', 'Google ranks faster pages.'), wm('Mobile', 'India market = slower networks.')],
    sections: [{ heading: 'Techniques', content: '- `next/image` for responsive images\n- Dynamic import for heavy components\n- Memoization where profiling shows need\n- CDN for static assets' }],
    codeExamples: [{ lang: 'tsx', code: 'import dynamic from "next/dynamic";\n\nconst HeavyChart = dynamic(() => import("./HeavyChart"), { loading: () => <p>Loading...</p> });' }],
    pitfalls: ['Premature memo everywhere.', 'Huge unoptimized images.', 'No lazy loading below fold.'],
    practice: [{ question: 'LCP?', answer: 'Largest Contentful Paint — time until main content visible.' }],
    cheatSheet: ['Lighthouse audit', 'next/image', 'dynamic import', 'analyze bundle'],
  }),

  'nestjs/express': k({
    definition: '**Express** is minimal Node HTTP framework; **NestJS** adds structure with modules, DI, decorators — enterprise-style TypeScript backends.',
    memoryTrick: 'NestJS = Angular-style architecture for Node.',
    whyMatters: [wm('APIs', 'Backend internship work.'), wm('Structure', 'Nest scales with teams.'), wm('TypeScript', 'End-to-end typing with frontend.')],
    sections: [{ heading: 'Nest Module Pattern', content: 'Module → Controller (routes) → Service (business logic) → Repository/Prisma (data)' }],
    codeExamples: [{ lang: 'typescript', code: '@Controller("users")\nexport class UsersController {\n  constructor(private readonly users: UsersService) {}\n\n  @Get(":id")\n  findOne(@Param("id") id: string) {\n    return this.users.findOne(id);\n  }\n}' }],
    pitfalls: ['Fat controllers — logic belongs in services.', 'No DTO validation.', 'Missing global exception filter.'],
    practice: [{ question: 'DI in NestJS?', answer: 'Constructor injection — framework provides service instances.' }],
    cheatSheet: ['Module/Controller/Service', 'DTO + class-validator', 'thin controllers'],
  }),

  'modular backend systems': k({
    definition: '**Modular backends** split domains into bounded modules — users, billing, notifications — each with own routes, services, and tests.',
    memoryTrick: 'One module = one business domain.',
    whyMatters: [wm('Teams', 'Parallel development.'), wm('Testing', 'Module-level integration tests.'), wm('Deploy', 'Future microservice extraction.')],
    sections: [{ heading: 'Folder Layout', content: '```\nsrc/\n  users/\n    users.module.ts\n    users.controller.ts\n    users.service.ts\n  auth/\n  common/\n```' }],
    codeExamples: [{ lang: 'typescript', code: '@Module({\n  imports: [PrismaModule],\n  controllers: [OrdersController],\n  providers: [OrdersService],\n  exports: [OrdersService],\n})\nexport class OrdersModule {}' }],
    pitfalls: ['Circular module imports.', 'Shared global state anti-pattern.'],
    practice: [{ question: 'Bounded context?', answer: 'Module owns its data and rules — minimal cross-module coupling.' }],
    cheatSheet: ['domain modules', 'export services', 'avoid circular deps'],
  }),

  middleware: k({
    definition: '**Middleware** runs between request and handler — auth, logging, rate limiting, CORS, body parsing.',
    memoryTrick: 'Request → middleware chain → route handler → response.',
    whyMatters: [wm('Security', 'Auth middleware guards all routes.'), wm('Observability', 'Log every request ID.'), wm('DX', 'Centralized cross-cutting logic.')],
    sections: [{ heading: 'Order Matters', content: 'CORS → body parser → auth → validation → controller' }],
    codeExamples: [{ lang: 'typescript', code: 'export function authMiddleware(req, res, next) {\n  const token = req.headers.authorization?.split(" ")[1];\n  if (!token) return res.status(401).json({ error: "Unauthorized" });\n  req.user = verify(token);\n  next();\n}' }],
    pitfalls: ['Forgetting next() — request hangs.', 'Heavy logic in middleware blocking event loop.'],
    practice: [{ question: 'next() purpose?', answer: 'Pass control to next middleware or route handler.' }],
    cheatSheet: ['chain of functions', 'call next()', 'auth early in chain'],
  }),

  validation: k({
    definition: '**Validation** ensures API inputs match schema before business logic — use class-validator, Zod, or Joi; never trust client data.',
    memoryTrick: 'Validate at the boundary — API edge is a firewall.',
    whyMatters: [wm('Security', 'Injection and bad data attacks.'), wm('Stability', 'Prevent 500s from bad input.'), wm('Contracts', 'OpenAPI docs match validation.')],
    sections: [{ heading: 'DTO Pattern', content: 'Define CreateUserDto with decorators → ValidationPipe transforms and rejects bad payloads with 400.' }],
    codeExamples: [{ lang: 'typescript', code: 'import { IsEmail, IsString, MinLength } from "class-validator";\n\nexport class CreateUserDto {\n  @IsEmail() email: string;\n  @IsString() @MinLength(8) password: string;\n}' }],
    pitfalls: ['Validating only on frontend.', 'Leaking validation error internals to client.'],
    practice: [{ question: 'HTTP status for bad input?', answer: '400 Bad Request with clear field errors.' }],
    cheatSheet: ['DTO classes', 'validate before service', '400 on failure'],
  }),

  'scalable apis': k({
    definition: '**Scalable APIs** handle growth via stateless design, pagination, caching, connection pooling, horizontal scaling, and async jobs for heavy work.',
    memoryTrick: 'Stateless servers + database indexes + cache hot reads.',
    whyMatters: [wm('Traffic spikes', 'Launch day load.'), wm('Cost', 'Efficient APIs cheaper at scale.'), wm('Interviews', 'System design staple.')],
    sections: [{ heading: 'Patterns', content: '- Cursor pagination not offset for large tables\n- Redis cache for read-heavy endpoints\n- Queue for emails/exports\n- Idempotency keys for POST retries' }],
    codeExamples: [{ lang: 'typescript', code: '@Get()\nasync list(@Query("cursor") cursor?: string, @Query("limit") limit = 20) {\n  return this.service.findPage({ cursor, limit: Math.min(limit, 100) });\n}' }],
    pitfalls: ['N+1 queries.', 'Unbounded list endpoints.', 'No rate limiting.'],
    practice: [{ question: 'Why cursor pagination?', answer: 'Stable performance on large tables — offset skips rows expensively.' }],
    cheatSheet: ['paginate everything', 'cache reads', 'queue writes', 'index DB columns'],
  }),

  postgresql: k({
    definition: '**PostgreSQL** is a powerful open-source relational DB — ACID transactions, JSON columns, full-text search, extensions.',
    memoryTrick: 'SQL = ask questions of structured data. Postgres = production default.',
    whyMatters: [wm('Jobs', 'Most backend roles use Postgres.'), wm('Reliability', 'ACID for money and orders.'), wm('Prisma', 'ORM maps to Postgres schemas.')],
    sections: [{ heading: 'Core SQL', content: 'SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY, HAVING, transactions BEGIN/COMMIT' }],
    codeExamples: [{ lang: 'sql', code: 'SELECT u.name, COUNT(o.id) AS orders\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.id\nHAVING COUNT(o.id) > 5\nORDER BY orders DESC\nLIMIT 10;' }],
    pitfalls: ['SELECT * in production hot paths.', 'Missing indexes on WHERE/JOIN columns.', 'No migrations discipline.'],
    practice: [{ question: 'LEFT JOIN vs INNER?', answer: 'INNER keeps matching rows only; LEFT keeps all left rows with NULLs for non-matches.' }],
    cheatSheet: ['normalize design', 'index FKs', 'use transactions', 'migrate with Prisma'],
  }),

  indexing: k({
    definition: '**Indexes** speed up reads by creating sorted lookup structures — B-tree default in Postgres; trade write speed for read speed.',
    memoryTrick: 'Index columns in WHERE, JOIN, ORDER BY — EXPLAIN ANALYZE proves it.',
    whyMatters: [wm('Performance', 'Full table scan kills at scale.'), wm('Cost', 'Slow queries = bigger DB bills.'), wm('Interviews', 'Explain index trade-offs.')],
    sections: [{ heading: 'Index Types', content: 'B-tree (equality/range), GIN (JSON/full-text), partial indexes, composite indexes (a, b)' }],
    codeExamples: [{ lang: 'sql', code: 'CREATE INDEX idx_users_email ON users(email);\nCREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);\nEXPLAIN ANALYZE SELECT * FROM users WHERE email = $1;' }],
    pitfalls: ['Over-indexing slows writes.', 'Wrong column order in composite index.'],
    practice: [{ question: 'When not to index?', answer: 'Low-cardinality columns alone, tiny tables, write-heavy cold columns.' }],
    cheatSheet: ['index filter/join cols', 'EXPLAIN ANALYZE', 'composite order matters'],
  }),

  'prisma orm': k({
    definition: '**Prisma** is a TypeScript ORM — schema.prisma defines models, generates type-safe client, handles migrations.',
    memoryTrick: 'schema → migrate → PrismaClient — types follow schema.',
    whyMatters: [wm('DX', 'Autocomplete on queries.'), wm('Safety', 'Compile-time query errors.'), wm('Migrations', 'Version-controlled schema evolution.')],
    sections: [{ heading: 'Workflow', content: 'Edit schema.prisma → `npx prisma migrate dev` → use `@prisma/client` in services' }],
    codeExamples: [{ lang: 'typescript', code: 'const user = await prisma.user.findUnique({\n  where: { email: "student@demo.com" },\n  include: { progress: true },\n});\n\nawait prisma.user.create({ data: { email, name, passwordHash } });' }],
    pitfalls: ['N+1 — use include/select wisely.', 'Raw SQL needed for complex reports sometimes.'],
    practice: [{ question: 'migrate dev vs deploy?', answer: 'dev creates migration locally; deploy applies pending migrations in production.' }],
    cheatSheet: ['schema.prisma', 'migrate dev', 'typed client', 'watch N+1'],
  }),

  'schema optimization': k({
    definition: '**Schema optimization** designs normalized tables, proper types, constraints, and relationships for query patterns and integrity.',
    memoryTrick: 'Model the domain first — optimize queries second with indexes.',
    whyMatters: [wm('Integrity', 'Foreign keys prevent orphans.'), wm('Performance', 'Right types save space.'), wm('Evolution', 'Migrations easier on clean schema.')],
    sections: [{ heading: 'Normalization', content: '1NF atomic values → 2NF no partial deps → 3NF no transitive deps. Denormalize deliberately for read perf.' }],
    codeExamples: [{ lang: 'prisma', code: 'model User {\n  id        String   @id @default(uuid())\n  email     String   @unique\n  posts     Post[]\n  createdAt DateTime @default(now())\n}\n\nmodel Post {\n  id       String @id @default(uuid())\n  authorId String\n  author   User   @relation(fields: [authorId], references: [id])\n}' }],
    pitfalls: ['String IDs without index on FK.', 'Storing JSON when relational fit better.'],
    practice: [{ question: 'Unique constraint why?', answer: 'DB enforces uniqueness — race-safe vs app-only check.' }],
    cheatSheet: ['normalize first', 'FK constraints', 'match types to data', 'denormalize consciously'],
  }),

  transactions: k({
    definition: '**Transactions** group SQL operations atomically — all commit or all rollback (ACID). Critical for transfers, inventory, enrollments.',
    memoryTrick: 'BEGIN → work → COMMIT or ROLLBACK on error.',
    whyMatters: [wm('Money', 'Double-spend bugs without transactions.'), wm('Consistency', 'Partial updates corrupt data.'), wm('Prisma', '$transaction API wraps multi-step ops.')],
    sections: [{ heading: 'Isolation Levels', content: 'Read Committed (default), Repeatable Read, Serializable — higher = safer, slower.' }],
    codeExamples: [{ lang: 'typescript', code: 'await prisma.$transaction(async (tx) => {\n  const account = await tx.account.update({ where: { id }, data: { balance: { decrement: amount } } });\n  if (account.balance < 0) throw new Error("Insufficient funds");\n  await tx.transfer.create({ data: { fromId: id, amount } });\n});' }],
    pitfalls: ['Long transactions lock rows.', 'No idempotency on retried requests.'],
    practice: [{ question: 'ACID?', answer: 'Atomicity, Consistency, Isolation, Durability.' }],
    cheatSheet: ['use $transaction', 'rollback on error', 'keep transactions short'],
  }),

  jwt: k({
    definition: '**JWT** (JSON Web Token) is a signed compact token carrying claims — used for stateless auth between client and API.',
    memoryTrick: 'header.payload.signature — verify signature before trusting payload.',
    whyMatters: [wm('APIs', 'Standard for SPAs and mobile.'), wm('Microservices', 'Pass identity between services.'), wm('Security', 'Short expiry + refresh tokens.')],
    sections: [{ heading: 'Structure', content: 'Claims: sub (user id), exp (expiry), iat (issued). Sign with HS256 or RS256 secret/key.' }],
    codeExamples: [{ lang: 'typescript', code: 'import jwt from "jsonwebtoken";\n\nconst token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "15m" });\nconst payload = jwt.verify(token, process.env.JWT_SECRET!);' }],
    pitfalls: ['Algorithm none attack.', 'Long-lived access tokens.', 'Secret in repo.'],
    practice: [{ question: 'JWT vs session cookie?', answer: 'JWT stateless on client; session ID server-side — JWT easier for mobile/API, session easier to revoke.' }],
    cheatSheet: ['short expiry', 'refresh token', 'verify signature', 'never expose secret'],
  }),

  rbac: k({
    definition: '**RBAC** (Role-Based Access Control) assigns permissions to roles (admin, student) — users get roles, roles get permissions.',
    memoryTrick: 'User → Role → Permission → Resource action.',
    whyMatters: [wm('Enterprise', 'Every B2B app needs RBAC.'), wm('Security', 'Least privilege principle.'), wm('Audit', 'Who can delete users?')],
    sections: [{ heading: 'Implementation', content: 'Store roles in DB. Guard routes with `@Roles("admin")`. Check permission in service layer too — never UI-only.' }],
    codeExamples: [{ lang: 'typescript', code: 'function canAccess(user: User, action: string, resource: string): boolean {\n  return user.role.permissions.some(p => p.action === action && p.resource === resource);\n}' }],
    pitfalls: ['Authorization only on frontend.', 'Hardcoded role strings everywhere — use enum/constants.'],
    practice: [{ question: 'RBAC vs ABAC?', answer: 'RBAC role-based; ABAC attribute-based (department, time) — ABAC more flexible, complex.' }],
    cheatSheet: ['roles in DB', 'guard server-side', 'least privilege'],
  }),

  oauth: k({
    definition: '**OAuth 2.0** delegates authorization — "Login with Google" without sharing password. OpenID Connect adds identity layer on OAuth.',
    memoryTrick: 'OAuth = authorization. OIDC = authentication (who are you).',
    whyMatters: [wm('UX', 'One-click social login.'), wm('Security', 'No password storage for Google users.'), wm('Integrations', 'Third-party API access tokens.')],
    sections: [{ heading: 'Authorization Code Flow', content: '1. Redirect to provider\n2. User consents\n3. Code exchanged server-side for tokens\n4. Store refresh token securely' }],
    codeExamples: [{ lang: 'text', code: 'User → App → Google Login → Redirect with code → Server exchanges code → Access + Refresh tokens' }],
    pitfalls: ['Implicit flow in SPAs (deprecated).', 'Client secret in frontend.', 'Not validating state param (CSRF).'],
    practice: [{ question: 'Why authorization code flow?', answer: 'Tokens exchanged server-side — client secret never exposed in browser.' }],
    cheatSheet: ['auth code flow', 'state param CSRF', 'server-side token exchange'],
  }),

  'rate limiting': k({
    definition: '**Rate limiting** caps requests per IP/user/time window — prevents abuse, DDoS, and runaway API costs.',
    memoryTrick: 'Token bucket or sliding window — return 429 Too Many Requests.',
    whyMatters: [wm('Security', 'Brute force login protection.'), wm('Cost', 'AI APIs billed per call.'), wm('Stability', 'Fair usage under load.')],
    sections: [{ heading: 'Strategies', content: 'Fixed window, sliding window, token bucket. Store counters in Redis for distributed apps.' }],
    codeExamples: [{ lang: 'typescript', code: '// NestJS @nestjs/throttler\n@Throttle({ default: { limit: 100, ttl: 60000 } })\n@Controller("api")\nexport class ApiController {}' }],
    pitfalls: ['Rate limit only on gateway not app.', 'No Retry-After header.'],
    practice: [{ question: 'HTTP 429?', answer: 'Too Many Requests — client should backoff/retry after delay.' }],
    cheatSheet: ['limit per IP/user', 'Redis counters', '429 + Retry-After'],
  }),

  'api security': k({
    definition: '**API security** covers HTTPS, auth, input validation, CORS, CSRF, headers (Helmet), secrets management, and audit logging.',
    memoryTrick: 'Defense in depth — no single layer enough.',
    whyMatters: [wm('Compliance', 'Data breaches have legal cost.'), wm('Trust', 'Users expect privacy.'), wm('Interviews', 'Security round common.')],
    sections: [{ heading: 'OWASP API Top Risks', content: 'Broken auth, excessive data exposure, lack of rate limiting, injection, misconfiguration.' }],
    codeExamples: [{ lang: 'typescript', code: 'app.use(helmet());\napp.enableCors({ origin: process.env.WEB_URL, credentials: true });\n// Never: eval(userInput), SQL string concat' }],
    pitfalls: ['CORS * with credentials.', 'Verbose error stacks in production.'],
    practice: [{ question: 'SQL injection prevention?', answer: 'Parameterized queries / ORM — never concatenate user input into SQL.' }],
    cheatSheet: ['HTTPS always', 'validate input', 'parameterized queries', 'least privilege'],
  }),

  websockets: k({
    definition: '**WebSockets** provide full-duplex persistent connection — server can push messages without polling.',
    memoryTrick: 'HTTP = request-response. WebSocket = open phone call.',
    whyMatters: [wm('Real-time', 'Chat, notifications, live dashboards.'), wm('Efficiency', 'No polling overhead.'), wm('Products', 'Collaboration tools need WS.')],
    sections: [{ heading: 'Socket.io Pattern', content: 'Connect → authenticate → join rooms → emit/listen events → disconnect cleanup' }],
    codeExamples: [{ lang: 'typescript', code: 'io.on("connection", (socket) => {\n  socket.on("join", (room) => socket.join(room));\n  socket.on("message", (msg) => io.to(msg.room).emit("message", msg));\n});' }],
    pitfalls: ['No auth on socket connection.', 'Memory leaks from uncleaned listeners.'],
    practice: [{ question: 'WS vs SSE?', answer: 'WS bidirectional; SSE server→client only over HTTP — SSE simpler for notifications.' }],
    cheatSheet: ['authenticate on connect', 'rooms for broadcast', 'handle disconnect'],
  }),

  redis: k({
    definition: '**Redis** is in-memory data store — cache, session store, pub/sub, rate limit counters, job queues (with Bull).',
    memoryTrick: 'Redis = fast RAM database — volatile unless persisted.',
    whyMatters: [wm('Performance', 'Cache DB reads.'), wm('Scale', 'Shared session across servers.'), wm('Real-time', 'Pub/sub for live features.')],
    sections: [{ heading: 'Use Cases', content: '| Pattern | Example |\n|---------|--------|\n| Cache | User profile TTL 5min |\n| Session | express-session store |\n| Rate limit | INCR + EXPIRE |\n| Queue | BullMQ jobs |' }],
    codeExamples: [{ lang: 'typescript', code: 'await redis.set(`user:${id}`, JSON.stringify(user), "EX", 300);\nconst cached = await redis.get(`user:${id}`);\nif (cached) return JSON.parse(cached);' }],
    pitfalls: ['Cache invalidation bugs.', 'Storing large blobs in Redis.'],
    practice: [{ question: 'Cache aside pattern?', answer: 'Read cache → miss → read DB → write cache → return.' }],
    cheatSheet: ['TTL on keys', 'cache-aside', 'pub/sub live updates'],
  }),

  queues: k({
    definition: '**Message queues** decouple producers and consumers — Bull/BullMQ, RabbitMQ, SQS for async email, exports, webhooks.',
    memoryTrick: 'API responds fast — heavy work goes to queue worker.',
    whyMatters: [wm('Reliability', 'Retry failed jobs.'), wm('Scale', 'Workers scale independently.'), wm('UX', 'No 30s HTTP request.')],
    sections: [{ heading: 'Job Lifecycle', content: 'Enqueue → pending → processing → completed/failed → retry with backoff' }],
    codeExamples: [{ lang: 'typescript', code: 'await emailQueue.add("welcome", { userId, email }, { attempts: 3, backoff: 5000 });\n\nemailQueue.process("welcome", async (job) => {\n  await sendEmail(job.data.email, "Welcome!");\n});' }],
    pitfalls: ['No idempotency — duplicate emails on retry.', 'Poison messages without DLQ.'],
    practice: [{ question: 'Why queue email send?', answer: 'Non-blocking API response; retries on SMTP failure.' }],
    cheatSheet: ['async heavy work', 'retry + backoff', 'idempotent handlers'],
  }),

  notifications: k({
    definition: '**Notification systems** deliver in-app, email, push, SMS — often multi-channel with user preferences and templates.',
    memoryTrick: 'Store notification → deliver async → mark read.',
    whyMatters: [wm('Engagement', 'Product retention driver.'), wm('Architecture', 'Fan-out to channels.'), wm('Compliance', 'Opt-out for marketing email.')],
    sections: [{ heading: 'Architecture', content: 'Event → Notification Service → Queue per channel → Provider (SendGrid, FCM)' }],
    codeExamples: [{ lang: 'typescript', code: 'async function notify(userId: string, type: string, payload: object) {\n  await db.notification.create({ data: { userId, type, payload, read: false } });\n  await pushQueue.add({ userId, title: payload.title });\n}' }],
    pitfalls: ['Sending without user preference check.', 'No batching — notification spam.'],
    practice: [{ question: 'At-least-once delivery?', answer: 'Messages may duplicate — handlers must be idempotent.' }],
    cheatSheet: ['multi-channel', 'user prefs', 'async delivery', 'idempotent'],
  }),

  'async systems': k({
    definition: '**Async systems** use non-blocking I/O, event loops, queues, and callbacks/promises — handle concurrency without thread-per-request.',
    memoryTrick: 'Node single-thread — never block event loop with CPU-heavy sync code.',
    whyMatters: [wm('Throughput', 'Handle many connections.'), wm('AI APIs', 'Stream tokens async.'), wm('Integrations', 'Parallel external calls.')],
    sections: [{ heading: 'Node Patterns', content: 'Promise.all for parallel I/O. Worker threads for CPU. Queue for background. Async/await syntax.' }],
    codeExamples: [{ lang: 'typescript', code: 'const [user, orders] = await Promise.all([\n  prisma.user.findUnique({ where: { id } }),\n  prisma.order.findMany({ where: { userId: id } }),\n]);' }],
    pitfalls: ['Blocking fs.readFileSync in hot path.', 'Unhandled promise rejections.'],
    practice: [{ question: 'Promise.all vs allSettled?', answer: 'all fails fast on first reject; allSettled waits for all regardless.' }],
    cheatSheet: ['async/await', 'Promise.all parallel', 'queue CPU-heavy work'],
  }),

  docker: k({
    definition: '**Docker** packages app + dependencies into **images**, run as isolated **containers** — consistent dev and prod environments.',
    memoryTrick: 'Dockerfile = recipe. Image = snapshot. Container = running instance.',
    whyMatters: [wm('DevOps', 'Industry standard deploy unit.'), wm('Onboarding', 'docker compose up = whole stack.'), wm('CI', 'Build image in pipeline.')],
    sections: [{ heading: 'Core Commands', content: 'docker build, run, ps, logs, exec, compose up/down' }],
    codeExamples: [{ lang: 'dockerfile', code: 'FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nCMD ["node", "dist/main.js"]' }],
    pitfalls: ['Running as root in container.', 'Huge images — use multi-stage builds.', 'Secrets in Dockerfile ARG.'],
    practice: [{ question: 'Image vs container?', answer: 'Image is template; container is running process from image.' }],
    cheatSheet: ['Dockerfile', 'multi-stage build', 'docker compose', '.dockerignore'],
  }),

  'ci/cd': k({
    definition: '**CI/CD** — Continuous Integration builds/tests every commit; Continuous Deployment ships passing builds to staging/production automatically.',
    memoryTrick: 'CI catches bugs early. CD ships value faster.',
    whyMatters: [wm('Quality', 'Tests gate merges.'), wm('Speed', 'Automated deploy vs manual FTP.'), wm('Internships', 'GitHub Actions on resume impresses.')],
    sections: [{ heading: 'Pipeline Stages', content: 'lint → test → build → docker push → deploy → smoke test' }],
    codeExamples: [{ lang: 'yaml', code: 'name: CI\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci && npm test && npm run build' }],
    pitfalls: ['No tests in pipeline.', 'Deploying main without review.', 'Secrets in workflow logs.'],
    practice: [{ question: 'CI vs CD?', answer: 'CI integrates and validates code; CD deploys validated artifacts automatically.' }],
    cheatSheet: ['test on every PR', 'build docker in CI', 'secrets in GitHub Actions'],
  }),

  nginx: k({
    definition: '**nginx** is reverse proxy and web server — terminates SSL, load balances, serves static files, routes to Node upstream.',
    memoryTrick: 'Client → nginx → your app on port 3000.',
    whyMatters: [wm('Production', 'Standard edge server.'), wm('SSL', 'HTTPS termination.'), wm('Performance', 'Static file serving efficient.')],
    sections: [{ heading: 'Reverse Proxy Config', content: 'upstream backend { server app:4000; }\nlocation / { proxy_pass http://backend; }' }],
    codeExamples: [{ lang: 'nginx', code: 'server {\n  listen 443 ssl;\n  server_name app.example.com;\n  location / {\n    proxy_pass http://127.0.0.1:4000;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n}' }],
    pitfalls: ['Wrong proxy headers break auth.', 'No gzip for static assets.'],
    practice: [{ question: 'Reverse proxy why?', answer: 'Single public entry, SSL, load balance, hide internal ports.' }],
    cheatSheet: ['reverse proxy', 'SSL termination', 'static files', 'upstream pool'],
  }),

  monitoring: k({
    definition: '**Monitoring** tracks health, metrics, logs, and traces — know when production breaks before users flood support.',
    memoryTrick: 'Metrics tell trends. Logs tell stories. Traces tell request path.',
    whyMatters: [wm('SLOs', '99.9% uptime targets.'), wm('Debug', 'Postmortems need data.'), wm('Scale', 'Alert on error rate spike.')],
    sections: [{ heading: 'Three Pillars', content: 'Metrics (Prometheus/Grafana), Logs (ELK/Loki), Traces (Jaeger/OpenTelemetry)' }],
    codeExamples: [{ lang: 'typescript', code: 'app.get("/health", (_, res) => res.json({ status: "ok", uptime: process.uptime() }));\n\nlogger.info({ userId, action: "login" }, "User logged in");' }],
    pitfalls: ['No alerts configured.', 'Logging PII/passwords.'],
    practice: [{ question: 'RED method?', answer: 'Rate, Errors, Duration — monitor every service.' }],
    cheatSheet: ['/health endpoint', 'structured logs', 'alert on SLO breach'],
  }),

  'vps deployment': k({
    definition: '**VPS deployment** runs your stack on virtual private server (DigitalOcean, AWS EC2) — SSH, systemd/Docker, firewall, domain DNS.',
    memoryTrick: 'SSH in → pull image → migrate DB → restart service → curl health.',
    whyMatters: [wm('Portfolio', 'Live demo on custom domain.'), wm('Cost', 'Cheaper than managed at small scale.'), wm('Skills', 'Full ownership of stack.')],
    sections: [{ heading: 'Deploy Steps', content: '1. Provision VPS\n2. Install Docker\n3. Clone/pull image\n4. Set env vars\n5. Run compose\n6. Point DNS\n7. SSL via Certbot' }],
    codeExamples: [{ lang: 'bash', code: 'ssh user@your-vps\nsudo apt update && sudo apt install docker.io\ngit clone repo && cd repo\ndocker compose -f docker-compose.prod.yml up -d\ncurl https://yourdomain.com/health' }],
    pitfalls: ['SSH password auth — use keys.', 'Open DB port to world.', 'No backups.'],
    practice: [{ question: 'Why Docker on VPS?', answer: 'Same artifact as CI built — reproducible prod environment.' }],
    cheatSheet: ['SSH keys', 'ufw firewall', 'docker compose prod', 'Certbot SSL'],
  }),

  'system architecture': k({
    definition: '**System architecture** for full-stack products defines frontend, API, database, cache, queue, and third-party integrations with clear boundaries.',
    memoryTrick: 'Monolith first for capstone — clear module boundaries inside.',
    whyMatters: [wm('Capstone', 'Architecture diagram required.'), wm('Interviews', 'Draw boxes in 15 minutes.'), wm('Team', 'Align before parallel work.')],
    sections: [{ heading: 'Typical Stack', content: 'Next.js → NestJS API → PostgreSQL + Redis → S3 for files → SendGrid email' }],
    codeExamples: [{ lang: 'text', code: '[Browser] → [CDN/Next.js] → [API Gateway/nginx] → [NestJS]\n                                              ↓\n                                    [PostgreSQL] [Redis] [S3]' }],
    pitfalls: ['Microservices on day 1.', 'No auth in diagram.', 'Single DB bottleneck unaddressed.'],
    practice: [{ question: 'Capstone monolith OK?', answer: 'Yes — ship working product; modular monolith is industry norm for MVPs.' }],
    cheatSheet: ['draw data flow', 'label auth', 'monolith MVP', 'note scaling path'],
  }),

  'ci/cd integration': k({
    definition: '**CI/CD integration** wires automated tests and deploys into Git workflow — PR checks, staging on merge, production on tag.',
    memoryTrick: 'Green CI = mergeable. Green CD = live.',
    whyMatters: [wm('Capstone', 'Demo deploy pipeline impresses reviewers.'), wm('Quality', 'Broken main blocked.'), wm('Rollback', 'Redeploy previous image fast.')],
    sections: [{ heading: 'GitHub Actions Flow', content: 'PR → lint/test → merge main → build Docker → push registry → deploy staging → manual prod approval' }],
    codeExamples: [{ lang: 'yaml', code: 'deploy:\n  needs: test\n  if: github.ref == "refs/heads/main"\n  steps:\n    - run: docker build -t app:${{ github.sha }} .\n    - run: docker push app:${{ github.sha }}' }],
    pitfalls: ['Deploy without migration step.', 'No rollback documented.'],
    practice: [{ question: 'Deploy artifact vs source?', answer: 'Deploy immutable Docker image built in CI — not git pull on server.' }],
    cheatSheet: ['CI on PR', 'CD on main', 'docker tag = git sha', 'run migrations'],
  }),

  'production deployment': k({
    definition: '**Production deployment** is hardened release — env secrets, HTTPS, monitoring, backups, zero-downtime strategy, runbook.',
    memoryTrick: 'Prod checklist: env, SSL, health, logs, backups, rollback.',
    whyMatters: [wm('Users', 'Real traffic real consequences.'), wm('Capstone', 'Live URL required.'), wm('Career', 'Shows end-to-end ownership.')],
    sections: [{ heading: 'Go-Live Checklist', content: '- NODE_ENV=production\n- Database backups automated\n- Error tracking (Sentry)\n- Rate limits enabled\n- Smoke tests pass' }],
    codeExamples: [{ lang: 'bash', code: 'docker compose -f docker-compose.prod.yml pull\ndocker compose -f docker-compose.prod.yml up -d --no-deps api\ncurl -f https://app.example.com/health || rollback.sh' }],
    pitfalls: ['Debug mode in prod.', 'Manual schema changes without migration.'],
    practice: [{ question: 'Blue-green deploy?', answer: 'Two environments — switch traffic to new version instantly for rollback.' }],
    cheatSheet: ['health check', 'Sentry', 'backups', 'rollback script'],
  }),

  'code review': k({
    definition: '**Code review** is peer inspection before merge — correctness, readability, security, tests, and architecture alignment.',
    memoryTrick: 'Review for understanding, not style nitpicks only.',
    whyMatters: [wm('Quality', 'Catch bugs pre-prod.'), wm('Learning', 'Fastest senior feedback loop.'), wm('Culture', 'Shared ownership of codebase.')],
    sections: [{ heading: 'Review Checklist', content: 'Does it work? Tests? Edge cases? Naming? Security? Docs? Scope creep?' }],
    codeExamples: [{ lang: 'markdown', code: '## PR Review\n- [ ] Tests pass\n- [ ] No secrets committed\n- [ ] Error handling present\n- [ ] API backward compatible\n**Suggestion:** extract validation to DTO' }],
    pitfalls: ['Rubber stamp approvals.', 'Hostile comments — be kind and specific.'],
    practice: [{ question: 'Good review comment?', answer: 'Specific, actionable, explains why — suggest fix not just problem.' }],
    cheatSheet: ['kind + specific', 'check tests', 'security mindset', 'small PRs easier'],
  }),
};

export function getFullstackKnowledge(topic: string): TopicKnowledge | null {
  return FULLSTACK_KNOWLEDGE[topic.toLowerCase().trim()] ?? null;
}

export function fullstackDefault(topic: string): TopicKnowledge {
  return defaultKnowledge(topic, 'Full Stack Product Engineering', 'typescript');
}
