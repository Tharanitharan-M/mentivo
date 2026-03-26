# Mentivo — Implementation Plan

> **Goal**: Transform Mentivo from a working prototype into a production-grade AI application that demonstrates AI software engineering maturity — testing at every layer, prompt management as a discipline, LLM evaluation as a practice, and full observability across the AI pipeline.

---

## Current State

| Area | Status |
|---|---|
| Core features | Working — onboarding chat, quiz, roadmap generation, milestone workspace, AI mentor chat |
| Tech stack | Next.js 16, React 19, Prisma 7 + Neon Postgres, Vercel AI SDK v6, Google Gemini |
| Testing | None — no framework, no tests |
| Prompt management | Inline in 10 route files, no versioning |
| LLM evaluation | None — no quality measurement |
| Observability | Vercel Analytics only — no AI-specific tracing |
| Error handling | Minimal — some try-catch in auth routes |

---

## Phase 1: Testing Foundation

**Why**: A testing pyramid proves you think about code quality at every level — not just "does it work on my machine."

### 1.1 Unit Testing with Vitest

**Stack**: Vitest 4 + React Testing Library 16 + @vitejs/plugin-react

```
npm i -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**What to test**:

| Target | Examples | Location |
|---|---|---|
| Utility functions | Quiz scoring logic, level determination, task completion checks | `__tests__/unit/` |
| Zod schemas | RoadmapSchema, QuizSchema validation with valid/invalid inputs | `__tests__/unit/schemas/` |
| React hooks | `useChat` state management, message handling | `__tests__/unit/hooks/` |
| Client components | QuizView renders questions, QuizResults shows correct score, WorkspaceClient renders editor | `__tests__/unit/components/` |

**Key patterns**:
- Extract pure business logic from route handlers into `src/lib/` functions that can be tested without HTTP context
- Example: extract quiz scoring from `/api/quiz/evaluate/route.ts` into `src/lib/quiz.ts`
- Mock the AI SDK at the module level for deterministic component tests
- Test Zod schemas directly — they define your API contracts

**Config** (`vitest.config.ts`):
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    alias: { '@/': new URL('./src/', import.meta.url).pathname },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      thresholds: { statements: 80, branches: 75, functions: 80, lines: 80 }
    }
  },
})
```

### 1.2 Integration Testing

**What to test**: API route handlers with real Prisma queries against a test database.

**Stack**: Vitest + Prisma test client + test database

**Approach**:
- Use a separate `.env.test` with a test Neon branch (or local PostgreSQL via Docker)
- Test each API route's happy path and auth/validation edge cases
- Mock only the AI SDK (not the database — that's the whole point of integration tests)

| Route | Test cases |
|---|---|
| `POST /api/auth/signup` | Creates user, rejects duplicate email, validates password strength |
| `POST /api/projects` | Creates project for authenticated user, rejects unauthenticated |
| `POST /api/roadmap/generate` | Returns existing roadmap if cached, generates new one, saves to DB |
| `POST /api/quiz/evaluate` | Calculates correct score, assigns right level, transitions project status |
| `POST /api/milestone/verify-tasks` | Returns completed task IDs, handles empty code |
| `POST /api/milestone/save` | Saves code + files to correct milestone |

**Key patterns**:
- Seed test data in `beforeEach`, clean up in `afterEach` with transaction rollback
- Use `vi.mock('ai', ...)` to return deterministic AI responses
- Assert both response shape AND database state changes

### 1.3 E2E Testing with Playwright

**Stack**: Playwright 1.58

```
npm i -D @playwright/test
npx playwright install
```

**Critical user flows to cover**:

| Flow | Steps |
|---|---|
| Onboarding | Sign up → Enter project idea → Chat with AI → Take quiz → See results |
| Learning | View roadmap → Open milestone → Read concept → Write code → Pass task checks → Take milestone quiz |
| Auth | Sign in with Google → Dashboard loads → Sign out |
| Error recovery | Expired session → Redirect to sign-in → Return to previous page |

**Config** (`playwright.config.ts`):
- Use `webServer` option to auto-start Next.js dev server
- Create auth state fixture (save authenticated cookie to `playwright/.auth/`)
- Use Page Object Model for reusable page interactions
- Run against Chromium, Firefox, WebKit

**Key patterns**:
- Test the AI-dependent flows with seeded database state (pre-created roadmaps, pre-generated milestones) to avoid flaky AI-dependent tests
- Use `page.route()` to intercept and mock AI streaming responses in E2E tests when needed
- Screenshot on failure for debugging

### 1.4 Test Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "vitest run && playwright test"
  }
}
```

---

## Phase 2: Prompt Management System

**Why**: Treating prompts as first-class artifacts (versioned, tested, evaluated) separates an AI software engineer from someone who just calls APIs.

### 2.1 Centralized Prompt Registry

Extract all 10 inline prompts into a structured prompt management system:

```
src/lib/prompts/
├── index.ts                    # Registry: getPrompt(name, version?)
├── types.ts                    # PromptConfig type definitions
├── registry.ts                 # Version catalog + active version mapping
├── onboarding-chat.ts          # Project idea clarification
├── quiz-generate.ts            # Skill assessment quiz generation
├── quiz-evaluate.ts            # Quiz result analysis + level assignment
├── roadmap-generate.ts         # 7-milestone roadmap creation
├── milestone-concept.ts        # Concept explanation generation
├── milestone-starter.ts        # Starter code + tasks + tests generation
├── milestone-chat.ts           # AI mentor during coding
├── milestone-quiz-generate.ts  # Comprehension quiz generation
└── milestone-verify-tasks.ts   # Task completion verification
```

**Each prompt file exports**:
```ts
export const onboardingChat = {
  name: 'onboarding-chat',
  version: '1.0.0',
  description: 'Clarify project idea through warm mentor conversation',
  template: (vars: { idea: string }) => `You are Mentivo, a warm...`,
  variables: ['idea'],
  model: 'gemini-2.5-flash',
  maxTokens: 1024,
  temperature: 0.7,
} satisfies PromptConfig
```

**Benefits for interview talking points**:
- **Version tracking**: Every prompt change gets a new version — can A/B test and rollback
- **Type safety**: TypeScript enforces that all required variables are passed
- **Testability**: Prompts are pure functions (variables in → string out) — unit testable
- **Auditability**: `registry.ts` maps each route to its active prompt version
- **Separation of concerns**: Route handlers focus on HTTP/DB logic, not prompt engineering

### 2.2 Prompt Metadata & Changelog

Each prompt file includes metadata for tracking:
```ts
{
  changelog: [
    { version: '1.0.0', date: '2026-03-26', change: 'Initial extraction from inline prompt' },
    { version: '1.1.0', date: '2026-03-27', change: 'Added constraint to limit questions to 1-2 per turn' },
  ]
}
```

### 2.3 Future: Langfuse Prompt Management (Optional Enhancement)

For a production upgrade path, integrate Langfuse's prompt CMS:
- Store prompts in Langfuse with environment-based deployment (dev/staging/prod)
- Fetch prompts at runtime with caching
- Link prompt versions to traces for full lineage tracking
- This is the "where I'd take it next" interview story

---

## Phase 3: LLM Evaluation Pipeline

**Why**: You can't improve what you don't measure. LLM eval proves you treat AI output quality as a first-class engineering concern.

### 3.1 Promptfoo for Prompt Testing

**Stack**: Promptfoo (MIT, used by OpenAI & Anthropic)

```
npm i -D promptfoo
```

**What to evaluate**:

| Prompt | Eval criteria | Test cases |
|---|---|---|
| `onboarding-chat` | Asks 1-2 questions (not a list), warm tone, eventually outputs `[READY_FOR_QUIZ]` | 5 different project ideas |
| `roadmap-generate` | Exactly 7 milestones, progressive difficulty, milestone 1 is setup, final is deployable | 3 project ideas × 3 skill levels |
| `quiz-generate` | 6 questions, correct difficulty distribution, valid options, one correct answer each | 3 project types |
| `milestone-concept` | Under 200 words, includes code example, relevant to milestone | 5 milestone types |
| `milestone-starter` | Valid HTML, 3-4 tasks, tests are executable JS expressions | 5 milestone types |
| `milestone-chat` | Gives hints not answers, asks Socratic questions, references learner's code | 3 help scenarios |

**Config** (`promptfooconfig.yaml`):
```yaml
prompts:
  - file://src/lib/prompts/roadmap-generate.ts:template

providers:
  - id: google:gemini-2.5-flash

tests:
  - vars:
      idea: "Personal expense tracker with charts"
      level: "beginner"
    assert:
      - type: javascript
        value: "output.milestones.length === 7"
      - type: llm-rubric
        value: "Milestone 1 should be about project setup, not a complex feature"
      - type: llm-rubric
        value: "The milestones should progressively increase in difficulty"
      - type: contains
        value: "HTML"
```

**Scripts**:
```json
{
  "scripts": {
    "eval": "promptfoo eval",
    "eval:view": "promptfoo view"
  }
}
```

### 3.2 Custom Evaluation Functions

Build lightweight eval helpers in `src/lib/eval/` for programmatic assertions:

```ts
// src/lib/eval/assertions.ts
export function assertMilestoneCount(output: unknown): boolean { ... }
export function assertQuizQuestionQuality(questions: unknown[]): { pass: boolean; reason: string } { ... }
export function assertConceptWordCount(text: string, max: number): boolean { ... }
export function assertStarterCodeValid(html: string): boolean { ... }
```

These run in both Promptfoo eval AND integration tests — single source of truth for quality.

### 3.3 Evaluation Metrics to Track

| Metric | What it measures | How |
|---|---|---|
| **Schema compliance** | Does output match Zod schema? | Automatic via `generateObject()` — log failures |
| **Content quality** | Is the generated content pedagogically sound? | LLM-as-judge via Promptfoo rubrics |
| **Consistency** | Same input → similar quality output? | Run same test cases 3x, measure variance |
| **Latency** | Time to first token, total generation time | OpenTelemetry spans (Phase 4) |
| **Token usage** | Cost per generation | AI SDK telemetry metadata |
| **Hallucination rate** | Does the AI invent non-existent APIs or patterns? | Spot-check code examples in concept explanations |

---

## Phase 4: Observability & Tracing

**Why**: If you can't observe your AI pipeline in production, you're flying blind. This is the difference between "I call AI APIs" and "I build production AI systems."

### 4.1 OpenTelemetry + Langfuse

**Stack**: Vercel AI SDK built-in telemetry → OpenTelemetry → Langfuse

**Why Langfuse**:
- Open-source (MIT), self-hostable, acquired by ClickHouse (strong backing)
- Native OpenTelemetry support in SDK v3
- Combines tracing + prompt management + evaluation in one platform
- Free tier generous enough for demo/interview purposes

**Integration approach — AI SDK telemetry**:

The Vercel AI SDK has built-in OpenTelemetry support. Enable per-call:
```ts
const result = await generateObject({
  model,
  schema: RoadmapSchema,
  prompt: compiledPrompt,
  experimental_telemetry: {
    isEnabled: true,
    functionId: 'roadmap-generate',
    metadata: {
      projectId,
      skillLevel: quizLevel,
      promptVersion: '1.0.0',
    },
  },
});
```

**What gets traced automatically**:
- Model name, provider
- Prompt tokens, completion tokens, total tokens
- Time to first token, total duration
- Input messages, output text/object
- Tool calls and results
- Custom metadata (projectId, promptVersion, etc.)

### 4.2 Langfuse Integration

```
npm i langfuse-vercel
```

**Setup** (`src/lib/observability.ts`):
```ts
import { LangfuseExporter } from 'langfuse-vercel'

export const langfuseExporter = new LangfuseExporter()
```

**Instrumentation file** (`src/instrumentation.ts` — Next.js convention):
```ts
import { registerOTel } from '@vercel/otel'
import { LangfuseExporter } from 'langfuse-vercel'

export function register() {
  registerOTel({
    serviceName: 'mentivo',
    traceExporter: new LangfuseExporter(),
  })
}
```

### 4.3 Custom Trace Enrichment

Add meaningful context to every AI call:

```ts
// Wrap all AI calls with consistent metadata
export function withTracing<T>(
  name: string,
  promptVersion: string,
  metadata: Record<string, string>,
) {
  return {
    experimental_telemetry: {
      isEnabled: true,
      functionId: name,
      metadata: { ...metadata, promptVersion },
    },
  }
}
```

### 4.4 Observable Metrics Dashboard

What to monitor in Langfuse:

| Metric | Why it matters |
|---|---|
| **Latency per AI call** | Which prompts are slow? Is roadmap generation taking 30s? |
| **Token usage per prompt** | Cost allocation — which features burn the most tokens? |
| **Error rate per endpoint** | Schema validation failures, API timeouts |
| **Prompt version performance** | Did v1.1.0 of `milestone-chat` improve quality over v1.0.0? |
| **User flow completion** | How many users complete onboarding → quiz → first milestone? |
| **Trace lineage** | Full journey: prompt version → AI call → output → user interaction |

### 4.5 Error Tracking & Alerting

Add structured error handling for AI failures:

```ts
// src/lib/ai-errors.ts
export class AIGenerationError extends Error {
  constructor(
    message: string,
    public readonly promptName: string,
    public readonly promptVersion: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'AIGenerationError'
  }
}
```

- Log AI errors with full context (prompt name, version, input variables, error type)
- Retry with exponential backoff for transient failures (rate limits, network)
- Fallback behavior: show cached content or graceful degradation message

---

## Phase 5: CI/CD Pipeline

**Why**: Automated quality gates prove that testing and evaluation aren't afterthoughts — they're built into the development workflow.

### 5.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run lint

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run test:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  prompt-eval:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run eval
    env:
      GOOGLE_GENERATIVE_AI_API_KEY: ${{ secrets.GOOGLE_GENERATIVE_AI_API_KEY }}
```

### 5.2 Quality Gates

| Gate | Threshold | Blocks merge? |
|---|---|---|
| Lint | Zero errors | Yes |
| Unit tests | 100% pass | Yes |
| Coverage | 80% statements, 75% branches | Yes |
| E2E tests | 100% pass | Yes |
| Prompt eval | No regressions from baseline | Warning (manual review) |
| Type check | `tsc --noEmit` passes | Yes |
| Build | `next build` succeeds | Yes |

---

## Phase 6: Production Hardening

### 6.1 API Rate Limiting

Protect AI endpoints from abuse:

```ts
// src/lib/rate-limit.ts — simple in-memory rate limiter
// Per-user limits: 10 AI calls/minute, 100/hour
// Can upgrade to Upstash Redis rate limiting for distributed deployment
```

### 6.2 Input Validation & Sanitization

- Validate all user inputs before sending to LLM (prevent prompt injection)
- Sanitize AI-generated HTML before rendering in milestone workspace (XSS prevention)
- Add Content Security Policy headers for iframe sandbox

### 6.3 Graceful Degradation

| Failure | Degradation strategy |
|---|---|
| AI API down | Show cached roadmap/concept if available, queue generation for retry |
| Rate limited | Show friendly "AI is busy" with estimated wait time |
| Schema validation fail | Retry once with stricter prompt, then show error with support link |
| Database down | Read-only mode from edge cache for public pages |

### 6.4 Structured Logging

```ts
// src/lib/logger.ts
// Structured JSON logging with context:
// { timestamp, level, message, userId, projectId, promptName, promptVersion, duration, tokenUsage }
```

---

## Implementation Priority & Timeline

### Day 1 — Interview Prep (March 26)

Focus on **demonstrable, talkable** implementations:

| Priority | Task | Interview impact |
|---|---|---|
| 1 | Extract prompts into `src/lib/prompts/` with versioning | "I treat prompts as versioned production artifacts" |
| 2 | Set up Vitest + write 5-10 meaningful unit tests | "I have a testing pyramid with real coverage" |
| 3 | Add Langfuse observability with AI SDK telemetry | "Every AI call is traced — I can show you the dashboard" |
| 4 | Write 1-2 Promptfoo eval configs | "I evaluate LLM output quality systematically" |
| 5 | Add 1 Playwright E2E test for the critical user flow | "I test end-to-end, not just unit level" |

### Week 1 — Core Quality (March 26–April 1)

- Complete Phase 1 (full test suite)
- Complete Phase 2 (all prompts extracted)
- Phase 3 partial (eval configs for 3 most critical prompts)

### Week 2 — AI Engineering (April 2–8)

- Complete Phase 3 (full eval coverage)
- Complete Phase 4 (observability + dashboards)
- Phase 5 (CI/CD pipeline)

### Week 3 — Production Polish (April 9–15)

- Complete Phase 6 (rate limiting, error handling, graceful degradation)
- Performance optimization
- Documentation

---

## Interview Talking Points

### "I don't just call AI APIs — I engineer AI systems"

1. **Prompt Management**: "Prompts are versioned artifacts, not inline strings. Each has a changelog, type-safe variables, and is independently testable. This is how you avoid prompt regressions."

2. **LLM Evaluation**: "I use Promptfoo to run automated evaluation suites against every prompt. I test for schema compliance, content quality via LLM-as-judge rubrics, and consistency across multiple runs. This runs in CI on every PR."

3. **Observability**: "Every AI call emits OpenTelemetry traces via the Vercel AI SDK. Langfuse gives me dashboards for latency, token usage, and error rates per prompt version. I can trace a user's entire AI journey from onboarding to milestone completion."

4. **Testing Pyramid**: "Unit tests with Vitest for business logic and components. Integration tests for API routes with a real test database — not mocks that hide real bugs. Playwright E2E tests for critical user flows. 80%+ coverage with quality gates in CI."

5. **Schema-Driven AI**: "I use Zod schemas with `generateObject()` to enforce structured output from the LLM. No parsing regex on free text — the AI SDK validates against the schema and retries if needed."

6. **Cost Awareness**: "Every AI call logs token usage. I know exactly how many tokens each feature costs per user. The observability dashboard shows cost trends and helps me optimize prompts for efficiency."

---

## Tech Stack Summary

| Layer | Tool | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 16.1.6 | App Router, API routes, SSR |
| Language | TypeScript | 5 | Type safety end-to-end |
| AI SDK | Vercel AI SDK | v6 | Unified LLM abstraction + streaming + structured output |
| AI Provider | Google Gemini | 2.5 Flash | Primary model (swappable via `src/lib/ai.ts`) |
| Database | PostgreSQL + Prisma | 7.4.2 | Type-safe ORM, serverless via Neon |
| Auth | NextAuth | v5 beta | Google OAuth + credentials |
| Unit tests | Vitest | 4 | Fast, ESM-native, Vite-powered |
| Component tests | React Testing Library | 16 | DOM-based component testing |
| E2E tests | Playwright | 1.58 | Cross-browser user flow testing |
| LLM evaluation | Promptfoo | latest | Automated prompt quality testing |
| Observability | Langfuse + OpenTelemetry | v3 | AI-specific tracing, prompt management |
| CI/CD | GitHub Actions | — | Lint, test, eval, build pipeline |
| Deployment | Vercel | — | Edge deployment, analytics, speed insights |
