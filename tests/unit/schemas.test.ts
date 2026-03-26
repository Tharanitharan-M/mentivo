import { describe, it, expect } from 'vitest'
import { RoadmapSchema, QuizSchema, QuizEvaluateSchema, StarterSchema } from '@/lib/schemas'

// ── RoadmapSchema ─────────────────────────────────────────────────────────────

describe('RoadmapSchema', () => {
  const validMilestone = {
    order: 1,
    title: 'Set up the project',
    description: 'Scaffold the app.',
    concept: 'HTML Boilerplate',
    estimatedTime: '1–2 hours',
    difficulty: 'easy' as const,
    tags: ['HTML', 'CSS'],
  }

  it('accepts a valid roadmap with 7 milestones', () => {
    const milestones = Array.from({ length: 7 }, (_, i) => ({
      ...validMilestone,
      order: i + 1,
    }))
    const result = RoadmapSchema.safeParse({ milestones })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown difficulty value', () => {
    const result = RoadmapSchema.safeParse({
      milestones: [{ ...validMilestone, difficulty: 'expert' }],
    })
    expect(result.success).toBe(false)
  })

  it('requires all milestone fields', () => {
    const { title: _omitted, ...withoutTitle } = validMilestone
    const result = RoadmapSchema.safeParse({ milestones: [withoutTitle] })
    expect(result.success).toBe(false)
  })

  it('accepts an empty milestones array', () => {
    // Schema does not enforce count — that constraint is in the prompt
    const result = RoadmapSchema.safeParse({ milestones: [] })
    expect(result.success).toBe(true)
  })

  it('rejects a milestone with numeric tags', () => {
    const result = RoadmapSchema.safeParse({
      milestones: [{ ...validMilestone, tags: [1, 2] }],
    })
    expect(result.success).toBe(false)
  })
})

// ── QuizSchema ────────────────────────────────────────────────────────────────

describe('QuizSchema', () => {
  const validQuestion = {
    id: 'q1',
    question: 'What does HTML stand for?',
    options: [
      { id: 'q1_a', text: 'HyperText Markup Language' },
      { id: 'q1_b', text: 'High Tech Modern Language' },
      { id: 'q1_c', text: 'Hyper Transfer Markup Language' },
      { id: 'q1_d', text: 'HyperText Modern Language' },
    ],
    correctId: 'q1_a',
    explanation: 'HTML stands for HyperText Markup Language.',
    difficulty: 'beginner' as const,
    topic: 'HTML basics',
  }

  it('accepts a valid quiz with 6 questions', () => {
    const questions = Array.from({ length: 6 }, (_, i) => ({
      ...validQuestion,
      id: `q${i + 1}`,
    }))
    expect(QuizSchema.safeParse({ questions }).success).toBe(true)
  })

  it('rejects an unknown difficulty', () => {
    const result = QuizSchema.safeParse({
      questions: [{ ...validQuestion, difficulty: 'expert' }],
    })
    expect(result.success).toBe(false)
  })

  it('requires correctId field', () => {
    const { correctId: _omitted, ...withoutCorrectId } = validQuestion
    const result = QuizSchema.safeParse({ questions: [withoutCorrectId] })
    expect(result.success).toBe(false)
  })

  it('requires each option to have id and text', () => {
    const result = QuizSchema.safeParse({
      questions: [{ ...validQuestion, options: [{ id: 'q1_a' }] }],
    })
    expect(result.success).toBe(false)
  })
})

// ── QuizEvaluateSchema ────────────────────────────────────────────────────────

describe('QuizEvaluateSchema', () => {
  const validResult = {
    level: 'beginner' as const,
    levelLabel: 'Curious Beginner',
    summary: 'You are just starting out.',
    strengths: ['HTML basics', 'CSS layout'],
    focusAreas: ['JavaScript', 'React'],
    encouragement: 'Keep going!',
    nextStep: "We'll start with the basics.",
  }

  it('accepts a valid evaluation result', () => {
    expect(QuizEvaluateSchema.safeParse(validResult).success).toBe(true)
  })

  it('accepts all three valid levels', () => {
    for (const level of ['beginner', 'intermediate', 'advanced'] as const) {
      expect(QuizEvaluateSchema.safeParse({ ...validResult, level }).success).toBe(true)
    }
  })

  it('rejects an unknown level', () => {
    const result = QuizEvaluateSchema.safeParse({ ...validResult, level: 'expert' })
    expect(result.success).toBe(false)
  })

  it('requires strengths to be an array', () => {
    const result = QuizEvaluateSchema.safeParse({ ...validResult, strengths: 'HTML' })
    expect(result.success).toBe(false)
  })
})

// ── StarterSchema ─────────────────────────────────────────────────────────────

describe('StarterSchema', () => {
  const validTask = {
    id: 't1',
    text: 'Add a form element',
    hint: "<form id='my-form'>",
    test: "!!document.getElementById('my-form')",
  }

  it('accepts valid starter code with 3 tasks', () => {
    const result = StarterSchema.safeParse({
      html: '<html><body></body></html>',
      tasks: [validTask, { ...validTask, id: 't2' }, { ...validTask, id: 't3' }],
    })
    expect(result.success).toBe(true)
  })

  it('accepts up to 4 tasks', () => {
    const tasks = [1, 2, 3, 4].map((n) => ({ ...validTask, id: `t${n}` }))
    expect(StarterSchema.safeParse({ html: '<html/>', tasks }).success).toBe(true)
  })

  it('rejects fewer than 3 tasks', () => {
    const result = StarterSchema.safeParse({
      html: '<html/>',
      tasks: [validTask, { ...validTask, id: 't2' }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects more than 4 tasks', () => {
    const tasks = [1, 2, 3, 4, 5].map((n) => ({ ...validTask, id: `t${n}` }))
    expect(StarterSchema.safeParse({ html: '<html/>', tasks }).success).toBe(false)
  })

  it('requires the test field on each task', () => {
    const { test: _omitted, ...withoutTest } = validTask
    const result = StarterSchema.safeParse({
      html: '<html/>',
      tasks: [withoutTest, { ...validTask, id: 't2' }, { ...validTask, id: 't3' }],
    })
    expect(result.success).toBe(false)
  })
})
