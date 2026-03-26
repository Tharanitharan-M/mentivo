// ─── Input Validation & Sanitization ─────────────────────────────────────────
// Two responsibilities:
//
// 1. sanitizeInput() — strips dangerous content from user text before it
//    reaches LLM prompts. Prevents prompt injection and excessively large
//    payloads from inflating token costs.
//
// 2. Zod request schemas — typed validation for every AI route's request body.
//    Routes call validateBody() to get a typed payload or a 400 response.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'
import { NextResponse } from 'next/server'

// ─── Sanitization ─────────────────────────────────────────────────────────────

/** Characters that are dangerous inside LLM prompts (prompt injection vectors) */
const STRIP_PATTERN = /<[^>]*>|[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g

/**
 * Sanitize a free-text user input before embedding in an LLM prompt.
 *
 * - Strips HTML tags (prevents prompt injection via markup)
 * - Removes ASCII control characters
 * - Trims whitespace
 * - Enforces a max character length to cap token usage
 *
 * @param text     Raw user-supplied string
 * @param maxChars Maximum allowed characters (default 1000)
 */
export function sanitizeInput(text: string, maxChars = 1_000): string {
  return text
    .replace(STRIP_PATTERN, '')
    .trim()
    .slice(0, maxChars)
}

// ─── Request body schemas ─────────────────────────────────────────────────────

const projectIdSchema = z.string().min(1, 'projectId is required')
const milestoneIdSchema = z.string().min(1, 'milestoneId is required')

/** /api/chat */
export const ChatRequestSchema = z.object({
  projectId: projectIdSchema,
  messages: z.array(z.any()).optional().default([]),
})

/** /api/quiz/generate */
export const QuizGenerateRequestSchema = z.object({
  projectId: projectIdSchema,
  conversationSummary: z.string().max(2_000).optional(),
})

/** /api/quiz/evaluate */
export const QuizEvaluateRequestSchema = z.object({
  projectId: projectIdSchema,
  questions: z.array(z.any()).min(1, 'questions must not be empty'),
  answers: z.record(z.string(), z.string()),
})

/** /api/roadmap/generate */
export const RoadmapGenerateRequestSchema = z.object({
  projectId: projectIdSchema,
})

/** /api/milestone/chat */
export const MilestoneChatRequestSchema = z.object({
  milestoneId: milestoneIdSchema,
  messages: z.array(z.any()).optional().default([]),
})

/** /api/milestone/concept */
export const MilestoneConceptRequestSchema = z.object({
  milestoneId: milestoneIdSchema,
  projectId: projectIdSchema,
})

/** /api/milestone/starter */
export const MilestoneStarterRequestSchema = z.object({
  milestoneId: milestoneIdSchema,
})

/** /api/milestone/verify-tasks */
export const MilestoneVerifyTasksRequestSchema = z.object({
  milestoneId: milestoneIdSchema,
  code: z.string().max(10_000).optional(),
  tasks: z.array(z.any()).optional(),
  completedIds: z.array(z.string()).optional(),
  files: z.record(z.string(), z.string()).optional(),
})

/** /api/milestone/quiz-generate */
export const MilestoneQuizGenerateRequestSchema = z.object({
  milestoneId: milestoneIdSchema,
})

// ─── Validation helper ────────────────────────────────────────────────────────

type ValidationSuccess<T> = { ok: true; data: T; error: null }
type ValidationFailure = { ok: false; data: null; error: NextResponse }

/**
 * Parse and validate a route's raw JSON body against a Zod schema.
 * Returns typed data on success, or a 400 NextResponse on failure.
 *
 * @example
 * const { ok, data, error } = validateBody(body, RoadmapGenerateRequestSchema)
 * if (!ok) return error
 * const { projectId } = data  // fully typed
 */
export function validateBody<T>(
  body: unknown,
  schema: z.ZodSchema<T>,
): ValidationSuccess<T> | ValidationFailure {
  const result = schema.safeParse(body)
  if (result.success) {
    return { ok: true, data: result.data, error: null }
  }

  const messages = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
  return {
    ok: false,
    data: null,
    error: NextResponse.json(
      { error: 'Invalid request', details: messages },
      { status: 400 },
    ),
  }
}
