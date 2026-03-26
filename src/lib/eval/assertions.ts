// ─── LLM Eval Assertions ──────────────────────────────────────────────────────
// Reusable quality checks for AI-generated output. Used in two contexts:
//
// 1. Promptfoo evaluation configs — programmatic assertions alongside llm-rubric
// 2. Integration / unit tests — import directly for deterministic checks
//
// Each assertion returns { pass: boolean; reason: string } so callers always
// know *why* a check failed, not just that it did.
// ─────────────────────────────────────────────────────────────────────────────

import type { Roadmap, Quiz, Starter } from '@/lib/schemas'

// ─── Result type ─────────────────────────────────────────────────────────────

export interface AssertionResult {
  pass: boolean
  reason: string
}

// ─── Roadmap assertions ──────────────────────────────────────────────────────

/**
 * A valid roadmap must contain exactly 7 milestones.
 */
export function assertMilestoneCount(roadmap: Roadmap): AssertionResult {
  const count = roadmap.milestones.length
  return {
    pass: count === 7,
    reason:
      count === 7
        ? 'Roadmap contains exactly 7 milestones'
        : `Expected 7 milestones, got ${count}`,
  }
}

/**
 * Milestones must follow a progressive difficulty curve.
 * - The first milestone should be "easy" (project setup).
 * - At least one milestone should be "hard".
 * - Difficulty must never decrease by more than one level
 *   (e.g. hard → easy is invalid, hard → medium is fine).
 */
export function assertProgressiveDifficulty(roadmap: Roadmap): AssertionResult {
  const difficulties = roadmap.milestones.map((m) => m.difficulty)
  const order = { easy: 0, medium: 1, hard: 2 }

  if (difficulties[0] !== 'easy') {
    return { pass: false, reason: `First milestone should be "easy", got "${difficulties[0]}"` }
  }

  if (!difficulties.includes('hard')) {
    return { pass: false, reason: 'Roadmap must include at least one "hard" milestone' }
  }

  for (let i = 1; i < difficulties.length; i++) {
    const drop = order[difficulties[i - 1]] - order[difficulties[i]]
    if (drop > 1) {
      return {
        pass: false,
        reason: `Difficulty drops too steeply at milestone ${i + 1}: "${difficulties[i - 1]}" → "${difficulties[i]}"`,
      }
    }
  }

  return { pass: true, reason: 'Difficulty progression is valid' }
}

/**
 * Every milestone must have a non-empty title, description, and concept.
 */
export function assertMilestoneCompleteness(roadmap: Roadmap): AssertionResult {
  for (const m of roadmap.milestones) {
    if (!m.title.trim()) return { pass: false, reason: `Milestone ${m.order} has empty title` }
    if (!m.description.trim())
      return { pass: false, reason: `Milestone ${m.order} has empty description` }
    if (!m.concept.trim()) return { pass: false, reason: `Milestone ${m.order} has empty concept` }
  }
  return { pass: true, reason: 'All milestones have title, description, and concept' }
}

// ─── Quiz assertions ─────────────────────────────────────────────────────────

/**
 * Quiz must have exactly `expected` questions (default 6 for skill quiz,
 * 4 for milestone quiz).
 */
export function assertQuizQuestionCount(
  quiz: Quiz,
  expected: number,
): AssertionResult {
  const count = quiz.questions.length
  return {
    pass: count === expected,
    reason:
      count === expected
        ? `Quiz has exactly ${expected} questions`
        : `Expected ${expected} questions, got ${count}`,
  }
}

/**
 * Every question must have exactly 4 options and the correctId must
 * reference one of those options.
 */
export function assertQuizQuestionQuality(quiz: Quiz): AssertionResult {
  for (const q of quiz.questions) {
    if (q.options.length !== 4) {
      return { pass: false, reason: `Question "${q.id}" has ${q.options.length} options, expected 4` }
    }

    const optionIds = q.options.map((o) => o.id)
    if (!optionIds.includes(q.correctId)) {
      return {
        pass: false,
        reason: `Question "${q.id}" correctId "${q.correctId}" not found in option ids: ${optionIds.join(', ')}`,
      }
    }

    if (!q.explanation.trim()) {
      return { pass: false, reason: `Question "${q.id}" has empty explanation` }
    }
  }

  return { pass: true, reason: 'All questions have 4 options, valid correctId, and explanation' }
}

/**
 * Quiz must include a mix of difficulty levels — not all the same.
 */
export function assertDifficultyDistribution(quiz: Quiz): AssertionResult {
  const levels = new Set(quiz.questions.map((q) => q.difficulty))
  return {
    pass: levels.size >= 2,
    reason:
      levels.size >= 2
        ? `Quiz covers ${levels.size} difficulty levels: ${[...levels].join(', ')}`
        : `Quiz only covers one difficulty level: ${[...levels].join(', ')}`,
  }
}

// ─── Starter code assertions ─────────────────────────────────────────────────

/**
 * Starter HTML must contain basic document structure.
 */
export function assertStarterCodeValid(starter: Starter): AssertionResult {
  const html = starter.html.toLowerCase()

  if (!html.includes('<!doctype html>') && !html.includes('<!doctype html>')) {
    // Check for either case — some models vary capitalisation
    if (!html.includes('<html')) {
      return { pass: false, reason: 'Starter HTML missing <html> tag' }
    }
  }

  if (!html.includes('<body')) {
    return { pass: false, reason: 'Starter HTML missing <body> tag' }
  }

  return { pass: true, reason: 'Starter HTML has valid document structure' }
}

/**
 * Starter must have 3–4 tasks, each with non-empty text, hint, and test.
 */
export function assertStarterTasks(starter: Starter): AssertionResult {
  const count = starter.tasks.length
  if (count < 3 || count > 4) {
    return { pass: false, reason: `Expected 3-4 tasks, got ${count}` }
  }

  for (const task of starter.tasks) {
    if (!task.text.trim()) return { pass: false, reason: `Task "${task.id}" has empty text` }
    if (!task.hint.trim()) return { pass: false, reason: `Task "${task.id}" has empty hint` }
    if (!task.test.trim()) return { pass: false, reason: `Task "${task.id}" has empty test` }
  }

  return { pass: true, reason: `Starter has ${count} complete tasks` }
}

// ─── Concept explanation assertions ──────────────────────────────────────────

/**
 * Concept text should be concise — under the given word limit.
 */
export function assertConceptWordCount(
  text: string,
  maxWords: number = 200,
): AssertionResult {
  const wordCount = text.split(/\s+/).filter(Boolean).length
  return {
    pass: wordCount <= maxWords,
    reason:
      wordCount <= maxWords
        ? `Concept is ${wordCount} words (under ${maxWords} limit)`
        : `Concept is ${wordCount} words — exceeds ${maxWords} word limit`,
  }
}
