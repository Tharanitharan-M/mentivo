# Mentivo

An AI powered learning platform that teaches you web development by having you build something you actually care about.

---

## The Problem

Most people who want to learn web development hit the same wall. They watch tutorials, follow along, and feel like they understand it. Then they close the video and try to build something on their own, and nothing comes together.

The rise of AI tools made this worse in a different way. Now you can describe what you want and have it write all the code for you in seconds. The app gets built, but you have no idea what happened. You copy and paste, tweak a few things, and eventually you have something that sort of works, but you could not explain a single line of it if someone asked.

Then came AI builders like Cursor, Lovable, and a dozen others. These tools are genuinely impressive. You type what you want, a diff shows up, and you click accept. Again and again and again. The whole app materialises in front of you without you writing a single meaningful line. It feels productive, and in some ways it is, but it is not learning. You are not a developer at the end of it. You are just someone who got good at describing things to an AI and clicking accept.

The moment something breaks, or someone asks you to explain your own code, or you need to build something the AI does not quite understand, you are completely stuck. Because you never actually learned anything. You just watched it happen.

There is no real learning happening. Just delegation.

---

## The Solution

Mentivo is an AI coding mentor, not an AI code generator. The difference matters.

You start by describing the project you want to build, something real that you actually want to exist. Mentivo figures out a focused, achievable version of that idea, assesses where you are starting from, and creates a personalized roadmap for you. Then it walks you through building it, milestone by milestone.

At every step, it teaches you the concept you need before you write a single line. You write the code yourself in a browser based editor. You see it run in a live preview. And before you move on, Mentivo makes sure you actually understood what just happened.

The AI is there the whole time if you get stuck, but it will not just hand you the answer. It asks questions, gives hints, and nudges you in the right direction. By the time you finish, you have a working project and you can genuinely explain how it works.

---

## How It Works

### You start with an idea

When you log in, you land on a simple dashboard. There is a text input asking what you want to build. You type something like "I want to build an expense tracker that helps me understand where my money goes each month" and hit send.

Mentivo takes that idea and runs with it.

![Dashboard](public/screenshots/dashboard.png)

### You get a roadmap built for you

Based on your idea and your current skill level, Mentivo generates a personalized learning roadmap. It breaks the project into milestones in the right order, estimates how long each one will take, and tells you exactly what concept you will learn at each step.

You can see which milestones are done, which one you are on, and what is coming next. Everything is scoped to beginner, intermediate, or advanced depending on where you are starting from.

![Roadmap](public/screenshots/roadmap.png)

### You actually write the code

When you open a milestone, the screen splits into three parts. On the left there is a plain English explanation of the concept you are about to use, with a clear task at the bottom telling you what to build. In the middle is a code editor where you write everything yourself. On the right is a live preview that updates as you type so you can see exactly what your code is doing.

If you are stuck, there is an AI assistant on the right side that you can talk to. It will not write the code for you, but it will help you think through the problem.

![Learning Page](public/screenshots/learning%20page.png)

### You prove you understood it

After you finish each milestone, Mentivo does not just let you move on. It runs a short quiz based on the concept you just worked with. The questions are grounded in what you actually built, so it is testing real understanding, not memorization.

This is the part most learning tools skip. Mentivo does not.

![Quiz](public/screenshots/quiz-after-milestone.png)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 with TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL on Neon (serverless) with Prisma ORM |
| AI | Google Gemini 2.5 Flash via Vercel AI SDK |
| Auth | NextAuth v5 with Google OAuth and credentials login |
| Code Editor | Monaco Editor (browser based) |
| Testing | Vitest, React Testing Library |
| LLM Evaluation | Promptfoo with LLM as judge |
| Observability | Langfuse, OpenTelemetry, structured JSON logging |
| CI/CD | GitHub Actions |
| Deployment | Vercel |

---

## Production Engineering

This is not just a working app. It is built with the same practices you would see in a production system. Here is what is in place.

### Unit Testing

The test suite uses Vitest with React Testing Library. There are 11 test files covering the core logic across the codebase.

What is tested:
- Rate limiting logic with sliding window counters, including per minute and per hour windows, multi user isolation, and time based resets using fake timers
- Input sanitization covering HTML stripping, control character removal, and max length enforcement
- All 9 Zod request schemas validating structure, types, and edge cases
- Quiz scoring algorithms for both skill assessment (6 questions) and milestone comprehension (4 questions with a 75% pass threshold)
- 9 reusable LLM output quality assertions that check milestone count, progressive difficulty, question quality, starter code validity, and more
- Structured logging output format and log level filtering
- Prompt registry lookups and version tracking
- React components for quiz presentation and results display

Coverage thresholds are enforced at 80% for statements, functions, and lines, with 75% for branches.

```bash
npm run test              # run once
npm run test:watch        # watch mode
npm run test:coverage     # with coverage report
```

### Observability and Tracing

Every AI call in the app is traced end to end using Langfuse and Vercel OpenTelemetry.

The tracing system works like this. Each call to `generateObject`, `generateText`, or `streamText` includes telemetry metadata with the prompt name, prompt version, user ID, project ID, and milestone ID. That data flows through the Vercel OpenTelemetry provider into Langfuse, where you can see per call latency, token usage, cost, and the full prompt lineage.

On top of that there is a structured JSON logger that outputs single line JSON for compatibility with log aggregators like Vercel Logs or Datadog. It supports debug, info, warn, and error levels, and automatically routes errors to stderr.

The instrumentation registers at server startup through the Next.js instrumentation hook, so there is zero setup needed at the route level beyond passing the telemetry metadata.

### LLM Evaluation Pipeline

The project uses Promptfoo to evaluate every AI powered feature against real test cases with both deterministic and LLM as judge assertions.

There are three evaluation configs:

**Roadmap generation** is tested with 3 cases across beginner, intermediate, and advanced levels. The assertions check that exactly 7 milestones are generated, that the first one is easy, that at least one is hard, and that all milestones have the required fields. On top of that, LLM as judge rubrics verify that the first milestone is about project setup and that difficulty progresses naturally.

**Quiz generation** is tested with 3 different project ideas. It checks for exactly 6 questions, valid option structures, difficulty distribution, and uses LLM as judge to verify that questions are actually relevant to the project scope.

**Starter code generation** is tested with 2 milestone contexts. It verifies valid HTML5 structure, 3 to 4 tasks with hints and test expressions, and uses LLM as judge to check that the code matches the milestone context.

The LLM as judge evaluator uses Google Gemini to evaluate the output of Google Gemini against plain English rubrics. This catches the subtle quality issues that deterministic checks cannot, like whether a roadmap actually makes pedagogical sense.

```bash
npm run eval              # run all 3 evaluations
npm run eval:roadmap      # roadmap eval only
npm run eval:quiz         # quiz eval only
npm run eval:starter      # starter code eval only
npm run eval:view         # open the Promptfoo results UI
```

### CI/CD Pipeline

GitHub Actions runs on every push to main and on every pull request. The pipeline has five jobs.

1. **Type check** runs `tsc --noEmit` to catch type errors without emitting output.
2. **Lint** runs ESLint 9 with the Next.js config.
3. **Unit tests** runs the full Vitest suite with coverage and uploads the coverage report as a GitHub artifact.
4. **Build** runs the full Next.js production build using dummy environment variables so it does not need real secrets.
5. **Prompt evaluation** runs all three Promptfoo eval configs against the real Gemini API. This only runs on pull requests and is set to `continue-on-error` so a flaky LLM response does not block the merge. The results are uploaded as an artifact for human review.

The pipeline uses concurrency groups so pushing a new commit cancels any in progress run for the same branch.

### Rate Limiting

Every AI route is protected by a sliding window rate limiter. The limits are 10 requests per minute and 100 requests per hour, tracked per user.

The implementation uses two independent in memory maps. Each tracks the request count and the window reset time for a given user ID. When a request comes in, it checks the tighter window first. If either limit is exceeded, the route returns a 429 response with a `Retry-After` header telling the client how many seconds to wait.

The rate limiter is called right after the auth check in every AI route, so unauthenticated requests never even reach it.

For production at scale, the in memory approach can be swapped out for Upstash Redis with `@upstash/ratelimit` as a drop in replacement.

### Input Validation and Sanitization

Every AI route validates its request body against a Zod schema before doing anything else.

The `sanitizeInput` function strips HTML tags and control characters from user text, and enforces a configurable max character limit (1,000 by default). This prevents prompt injection attempts, reduces token waste from malicious input, and keeps payloads clean.

There are 9 Zod schemas covering all AI endpoints. Each one validates the exact shape, types, and constraints of the request body. If validation fails, the route returns a 400 response with detailed field level error messages.

The validation layer sits between the auth check and the rate limiter in the route handler, so invalid requests are rejected before they count against the rate limit.

### Security Headers

The app sets a strict Content Security Policy along with other security headers through the Next.js config.

The CSP is specifically designed for Mentivo's architecture. It allows `unsafe-eval` and `unsafe-inline` because the Monaco editor and Tailwind CSS require them. It restricts `connect-src` to only the domains the app actually talks to (Neon for the database, Google for the Gemini API, Langfuse for observability). It restricts `frame-src` to `self` and `blob:` because milestone workspaces render user code in iframes. And it blocks everything else with `object-src 'none'` and `base-uri 'self'`.

Additional headers include `X-Content-Type-Options: nosniff` to prevent MIME type sniffing, `X-Frame-Options: DENY` to block clickjacking, a strict referrer policy, and a permissions policy that disables camera, microphone, and geolocation access.

### Prompt Engineering

The AI system uses a prompt registry with versioning and changelog tracking. There are 8 prompts in total, each registered with a name, version number, and description.

Every prompt is a function that takes context variables and returns a compiled string. The prompts use Zod schemas as the single source of truth for both the AI output structure and the request validation layer.

The prompts cover the full learning flow:
- Onboarding chat (conversational guidance during project setup)
- Quiz generation and evaluation (skill assessment with 6 tiered questions)
- Roadmap generation (7 milestone progressive learning path)
- Milestone concept explanation, starter code generation, task verification, contextual chat, and comprehension quizzes

The versioning system means every AI call in Langfuse traces back to the exact prompt version that produced it, which makes debugging and evaluation straightforward.

---

## Database Schema

The database has 11 models built on PostgreSQL through Prisma.

The core learning flow is: **User** creates a **Project** from an idea, takes a **Quiz** to assess their level, gets a **Roadmap** with 7 **Milestones**, and works through each milestone with concept explanations, a code editor, task verification, and comprehension quizzes.

Chat history is stored in **Message** (onboarding phase) and **MilestoneMessage** (workspace phase) so conversations persist across sessions.

Auth is handled by NextAuth's required tables: **User**, **Account**, **Session**, and **VerificationToken**.

Milestone status progresses through LOCKED, UNLOCKED, IN_PROGRESS, and COMPLETED. Project status moves through ONBOARDING, QUIZ, ACTIVE, and COMPLETED.

---

## API Routes

The app has 16 API routes organized around the learning flow.

**Auth**: signup endpoint plus NextAuth's built in handler for sign in, callbacks, and session management.

**Projects**: create, list, and delete projects. There is also a route to regenerate a roadmap.

**Onboarding**: a streaming chat endpoint for conversational guidance, quiz generation for skill assessment, and quiz evaluation that scores answers and recommends a level.

**Roadmap**: generates a 7 milestone personalized learning path based on the project idea and assessed skill level.

**Milestone workspace**: concept explanation, starter code generation, contextual chat for when you are stuck, task verification against your actual code, comprehension quiz generation, quiz evaluation, progress saving, and milestone reset.

Every AI route follows the same pattern: authenticate, validate the request body, check the rate limit, call the AI with tracing metadata, persist the result, and return the response.

---

## Running It Locally

Clone the repo and install dependencies.

```bash
https://github.com/Tharanitharan-M/mentivo
cd mentivo
npm install
```

Create a `.env.local` file in the root. You can copy from the example file.

```bash
cp .env.example .env.local
```

Fill in the required values:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:pass@host-pooler.neon.tech/dbname?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://user:pass@host.neon.tech/dbname?sslmode=require"

# NextAuth
NEXTAUTH_SECRET=""          # generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (from https://console.cloud.google.com)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Google Gemini (from https://aistudio.google.com/app/apikey)
GOOGLE_GENERATIVE_AI_API_KEY=""

# Langfuse (from https://cloud.langfuse.com)
LANGFUSE_PUBLIC_KEY=""
LANGFUSE_SECRET_KEY=""
LANGFUSE_BASE_URL="https://us.cloud.langfuse.com"
LANGFUSE_BASEURL="https://us.cloud.langfuse.com"
```

Push the database schema.

```bash
npx prisma db push
```

Start the dev server.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you are good to go.

---

## Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run eval` | Run all LLM evaluations |
| `npm run eval:roadmap` | Evaluate roadmap generation |
| `npm run eval:quiz` | Evaluate quiz generation |
| `npm run eval:starter` | Evaluate starter code generation |
| `npm run eval:view` | Open the Promptfoo results UI |
