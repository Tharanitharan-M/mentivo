// ─── Zod Schemas ──────────────────────────────────────────────────────────────
// Single source of truth for all AI output schemas used with generateObject().
// Extracting them here means they can be unit-tested independently of any
// route handler or HTTP context, and eliminates the duplicate QuizSchema that
// previously existed in both quiz/generate and milestone/quiz-generate.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'

// ── Roadmap generation ────────────────────────────────────────────────────────

export const RoadmapSchema = z.object({
  milestones: z.array(
    z.object({
      order: z.number(),
      title: z.string(),
      description: z.string(),
      concept: z.string(),
      estimatedTime: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      tags: z.array(z.string()),
    }),
  ),
})

export type Roadmap = z.infer<typeof RoadmapSchema>
export type RoadmapMilestone = Roadmap['milestones'][number]

// ── Quiz (shared by quiz/generate and milestone/quiz-generate) ────────────────

export const QuizSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      options: z.array(z.object({ id: z.string(), text: z.string() })),
      correctId: z.string(),
      explanation: z.string(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
      topic: z.string(),
    }),
  ),
})

export type Quiz = z.infer<typeof QuizSchema>
export type QuizQuestionSchema = Quiz['questions'][number]

// ── Quiz evaluation result ────────────────────────────────────────────────────

export const QuizEvaluateSchema = z.object({
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  levelLabel: z.string(),
  summary: z.string(),
  strengths: z.array(z.string()),
  focusAreas: z.array(z.string()),
  encouragement: z.string(),
  nextStep: z.string(),
})

export type QuizEvaluateResult = z.infer<typeof QuizEvaluateSchema>

// ── Milestone starter code + tasks ────────────────────────────────────────────

export const StarterSchema = z.object({
  html: z.string(),
  tasks: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        hint: z.string(),
        test: z.string(), // JS expression run in the preview iframe; must return true/false
      }),
    )
    .min(3)
    .max(4),
})

export type Starter = z.infer<typeof StarterSchema>
export type StarterTask = Starter['tasks'][number]
