import { describe, it, expect } from 'vitest'
import {
  scoreSkillQuiz,
  scoreMilestoneQuiz,
  getMilestoneQuizFeedback,
  type QuizQuestion,
  type Answers,
} from '@/lib/quiz'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const skillQuestions: QuizQuestion[] = [
  { id: 'q1', correctId: 'q1_a', difficulty: 'beginner',     topic: 'HTML basics' },
  { id: 'q2', correctId: 'q2_b', difficulty: 'beginner',     topic: 'CSS selectors' },
  { id: 'q3', correctId: 'q3_c', difficulty: 'intermediate', topic: 'JS functions' },
  { id: 'q4', correctId: 'q4_a', difficulty: 'intermediate', topic: 'React components' },
  { id: 'q5', correctId: 'q5_d', difficulty: 'advanced',     topic: 'State management' },
  { id: 'q6', correctId: 'q6_b', difficulty: 'advanced',     topic: 'Performance' },
]

const milestoneQuestions: QuizQuestion[] = [
  { id: 'q1', correctId: 'q1_a', difficulty: 'beginner',     topic: 'Event listeners' },
  { id: 'q2', correctId: 'q2_b', difficulty: 'beginner',     topic: 'DOM manipulation' },
  { id: 'q3', correctId: 'q3_c', difficulty: 'intermediate', topic: 'Code behaviour' },
  { id: 'q4', correctId: 'q4_d', difficulty: 'intermediate', topic: 'What-if scenario' },
]

// ── scoreSkillQuiz ─────────────────────────────────────────────────────────────

describe('scoreSkillQuiz', () => {
  it('returns score 6 and percentage 100 for a perfect run', () => {
    const answers: Answers = {
      q1: 'q1_a', q2: 'q2_b', q3: 'q3_c', q4: 'q4_a', q5: 'q5_d', q6: 'q6_b',
    }
    const { score, percentage } = scoreSkillQuiz(skillQuestions, answers)
    expect(score).toBe(6)
    expect(percentage).toBe(100)
  })

  it('returns score 0 and percentage 0 for a blank run', () => {
    const answers: Answers = {
      q1: 'q1_z', q2: 'q2_z', q3: 'q3_z', q4: 'q4_z', q5: 'q5_z', q6: 'q6_z',
    }
    const { score, percentage } = scoreSkillQuiz(skillQuestions, answers)
    expect(score).toBe(0)
    expect(percentage).toBe(0)
  })

  it('counts only correct answers', () => {
    const answers: Answers = {
      q1: 'q1_a', // correct
      q2: 'q2_z', // wrong
      q3: 'q3_c', // correct
      q4: 'q4_z', // wrong
      q5: 'q5_d', // correct
      q6: 'q6_z', // wrong
    }
    const { score, percentage } = scoreSkillQuiz(skillQuestions, answers)
    expect(score).toBe(3)
    expect(percentage).toBeCloseTo(50)
  })

  it('formats questionBreakdown with ✓ and ✗ markers', () => {
    const answers: Answers = {
      q1: 'q1_a', q2: 'q2_z', q3: 'q3_c', q4: 'q4_z', q5: 'q5_z', q6: 'q6_z',
    }
    const { questionBreakdown } = scoreSkillQuiz(skillQuestions, answers)
    expect(questionBreakdown).toContain('✓ Correct')
    expect(questionBreakdown).toContain('✗ Incorrect')
    expect(questionBreakdown).toContain('[beginner]')
    expect(questionBreakdown).toContain('[advanced]')
    expect(questionBreakdown.split('\n')).toHaveLength(6)
  })

  it('includes difficulty and topic in each breakdown line', () => {
    const answers: Answers = {
      q1: 'q1_a', q2: 'q2_b', q3: 'q3_c', q4: 'q4_a', q5: 'q5_d', q6: 'q6_b',
    }
    const { questionBreakdown } = scoreSkillQuiz(skillQuestions, answers)
    expect(questionBreakdown).toContain('HTML basics')
    expect(questionBreakdown).toContain('Performance')
  })
})

// ── scoreMilestoneQuiz ────────────────────────────────────────────────────────

describe('scoreMilestoneQuiz', () => {
  it('returns 100 score and passed=true for a perfect run', () => {
    const answers: Answers = { q1: 'q1_a', q2: 'q2_b', q3: 'q3_c', q4: 'q4_d' }
    const result = scoreMilestoneQuiz(milestoneQuestions, answers)
    expect(result.correct).toBe(4)
    expect(result.total).toBe(4)
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
  })

  it('returns passed=false when score is below 75', () => {
    const answers: Answers = {
      q1: 'q1_a', // correct
      q2: 'q2_z', // wrong
      q3: 'q3_z', // wrong
      q4: 'q4_z', // wrong
    }
    const result = scoreMilestoneQuiz(milestoneQuestions, answers)
    expect(result.score).toBe(25)
    expect(result.passed).toBe(false)
  })

  it('returns passed=true at exactly 75 (3/4 correct)', () => {
    const answers: Answers = {
      q1: 'q1_a', // correct
      q2: 'q2_b', // correct
      q3: 'q3_c', // correct
      q4: 'q4_z', // wrong
    }
    const result = scoreMilestoneQuiz(milestoneQuestions, answers)
    expect(result.score).toBe(75)
    expect(result.passed).toBe(true)
  })

  it('rounds the score to the nearest integer', () => {
    // 1 of 3 correct = 33.33...%
    const threeQs = milestoneQuestions.slice(0, 3)
    const answers: Answers = { q1: 'q1_a', q2: 'q2_z', q3: 'q3_z' }
    const { score } = scoreMilestoneQuiz(threeQs, answers)
    expect(Number.isInteger(score)).toBe(true)
    expect(score).toBe(33)
  })
})

// ── getMilestoneQuizFeedback ──────────────────────────────────────────────────

describe('getMilestoneQuizFeedback', () => {
  it('returns "Perfect score!" for 100', () => {
    const { title } = getMilestoneQuizFeedback(100, true)
    expect(title).toContain('Perfect score')
  })

  it('returns "Great job!" for scores 88–99', () => {
    expect(getMilestoneQuizFeedback(88, true).title).toContain('Great job')
    expect(getMilestoneQuizFeedback(99, true).title).toContain('Great job')
  })

  it('returns "You passed!" for scores 75–87', () => {
    expect(getMilestoneQuizFeedback(75, true).title).toContain('You passed')
    expect(getMilestoneQuizFeedback(87, true).title).toContain('You passed')
  })

  it('returns "Almost there!" for failing scores', () => {
    expect(getMilestoneQuizFeedback(74, false).title).toContain('Almost there')
    expect(getMilestoneQuizFeedback(0, false).title).toContain('Almost there')
  })

  it('every feedback object has both title and body', () => {
    const cases = [
      [100, true], [88, true], [75, true], [0, false],
    ] as [number, boolean][]
    cases.forEach(([score, passed]) => {
      const fb = getMilestoneQuizFeedback(score, passed)
      expect(fb.title).toBeTruthy()
      expect(fb.body).toBeTruthy()
    })
  })
})
