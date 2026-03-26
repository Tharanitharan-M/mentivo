// ─── Quiz Business Logic ──────────────────────────────────────────────────────
// Pure functions extracted from route handlers so they can be unit tested
// without any HTTP, database, or AI context.
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared types ──────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string
  question?: string
  correctId: string
  difficulty: string
  topic: string
}

export type Answers = Record<string, string>

// ── Skill assessment quiz (onboarding) ───────────────────────────────────────

export interface SkillQuizResult {
  score: number       // number of correct answers
  percentage: number  // 0–100
  questionBreakdown: string // formatted string for the AI prompt
}

/**
 * Score the 6-question onboarding skill quiz.
 * Returns raw score, percentage, and a pre-formatted breakdown string
 * ready to be passed into the quiz-evaluate prompt.
 */
export function scoreSkillQuiz(
  questions: QuizQuestion[],
  answers: Answers,
): SkillQuizResult {
  const score = questions.reduce(
    (acc, q) => acc + (answers[q.id] === q.correctId ? 1 : 0),
    0,
  )
  const percentage = (score / questions.length) * 100
  const questionBreakdown = questions
    .map(
      (q, i) =>
        `Q${i + 1} [${q.difficulty}] ${q.topic}: ${
          answers[q.id] === q.correctId ? '✓ Correct' : '✗ Incorrect'
        }`,
    )
    .join('\n')

  return { score, percentage, questionBreakdown }
}

// ── Milestone comprehension quiz ──────────────────────────────────────────────

export interface MilestoneQuizResult {
  correct: number
  total: number
  score: number  // 0–100, rounded
  passed: boolean
}

export interface MilestoneQuizFeedback {
  title: string
  body: string
}

const PASS_THRESHOLD = 75 // percent

/**
 * Score the 4-question milestone comprehension quiz.
 */
export function scoreMilestoneQuiz(
  questions: QuizQuestion[],
  answers: Answers,
): MilestoneQuizResult {
  const correct = questions.filter((q) => answers[q.id] === q.correctId).length
  const total = questions.length
  const score = Math.round((correct / total) * 100)
  const passed = score >= PASS_THRESHOLD

  return { correct, total, score, passed }
}

/**
 * Return the appropriate feedback message for a milestone quiz score.
 * Kept separate from scoring so each can be tested independently.
 */
export function getMilestoneQuizFeedback(score: number, passed: boolean): MilestoneQuizFeedback {
  if (score === 100) {
    return {
      title: 'Perfect score! 🎉',
      body: "You've completely nailed this concept. On to the next challenge!",
    }
  }
  if (score >= 88) {
    return {
      title: 'Great job! ✨',
      body: "You've got this concept down solid. Keep that momentum going!",
    }
  }
  if (passed) {
    return {
      title: 'You passed! 👍',
      body: 'Good understanding of the concept. A few gaps, but you\'re ready to move on.',
    }
  }
  return {
    title: 'Almost there!',
    body: "Review the concept and try again — you're closer than you think.",
  }
}
