// ─── Eval Assertion Tests ─────────────────────────────────────────────────────
// Tests for the reusable LLM output quality assertions used by both Promptfoo
// evaluations and integration tests.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import {
  assertMilestoneCount,
  assertProgressiveDifficulty,
  assertMilestoneCompleteness,
  assertQuizQuestionCount,
  assertQuizQuestionQuality,
  assertDifficultyDistribution,
  assertStarterCodeValid,
  assertStarterTasks,
  assertConceptWordCount,
} from '@/lib/eval/assertions'
import type { Roadmap, Quiz, Starter } from '@/lib/schemas'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRoadmap(
  overrides: Partial<Roadmap['milestones'][number]>[] = [],
): Roadmap {
  const defaults: Roadmap['milestones'] = [
    { order: 1, title: 'Setup', description: 'Set up project', concept: 'Project structure', estimatedTime: '30min', difficulty: 'easy', tags: ['setup'] },
    { order: 2, title: 'HTML', description: 'Build layout', concept: 'HTML basics', estimatedTime: '1h', difficulty: 'easy', tags: ['html'] },
    { order: 3, title: 'CSS', description: 'Style it', concept: 'CSS styling', estimatedTime: '1h', difficulty: 'medium', tags: ['css'] },
    { order: 4, title: 'JS Basics', description: 'Add interactivity', concept: 'DOM manipulation', estimatedTime: '2h', difficulty: 'medium', tags: ['js'] },
    { order: 5, title: 'API', description: 'Fetch data', concept: 'Fetch API', estimatedTime: '2h', difficulty: 'medium', tags: ['api'] },
    { order: 6, title: 'State', description: 'Manage state', concept: 'State management', estimatedTime: '2h', difficulty: 'hard', tags: ['state'] },
    { order: 7, title: 'Deploy', description: 'Ship it', concept: 'Deployment', estimatedTime: '1h', difficulty: 'hard', tags: ['deploy'] },
  ]

  const milestones = defaults.map((d, i) => ({ ...d, ...overrides[i] }))
  return { milestones }
}

function makeQuiz(questionCount: number = 6): Quiz {
  return {
    questions: Array.from({ length: questionCount }, (_, i) => ({
      id: `q${i + 1}`,
      question: `Question ${i + 1}?`,
      options: [
        { id: `q${i + 1}_a`, text: 'Option A' },
        { id: `q${i + 1}_b`, text: 'Option B' },
        { id: `q${i + 1}_c`, text: 'Option C' },
        { id: `q${i + 1}_d`, text: 'Option D' },
      ],
      correctId: `q${i + 1}_a`,
      explanation: `Because option A is correct for question ${i + 1}`,
      difficulty: (['beginner', 'intermediate', 'advanced'] as const)[i % 3],
      topic: `Topic ${i + 1}`,
    })),
  }
}

function makeStarter(): Starter {
  return {
    html: '<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>',
    tasks: [
      { id: 't1', text: 'Add a heading', hint: 'Use h1 tag', test: 'document.querySelector("h1") !== null' },
      { id: 't2', text: 'Add a paragraph', hint: 'Use p tag', test: 'document.querySelector("p") !== null' },
      { id: 't3', text: 'Add a button', hint: 'Use button tag', test: 'document.querySelector("button") !== null' },
    ],
  }
}

// ─── Roadmap assertions ──────────────────────────────────────────────────────

describe('assertMilestoneCount', () => {
  it('passes with exactly 7 milestones', () => {
    const result = assertMilestoneCount(makeRoadmap())
    expect(result.pass).toBe(true)
  })

  it('fails with fewer milestones', () => {
    const roadmap = { milestones: makeRoadmap().milestones.slice(0, 5) }
    const result = assertMilestoneCount(roadmap)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('5')
  })

  it('fails with more milestones', () => {
    const roadmap = makeRoadmap()
    roadmap.milestones.push({ ...roadmap.milestones[0], order: 8 })
    const result = assertMilestoneCount(roadmap)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('8')
  })
})

describe('assertProgressiveDifficulty', () => {
  it('passes with valid progression (easy → medium → hard)', () => {
    const result = assertProgressiveDifficulty(makeRoadmap())
    expect(result.pass).toBe(true)
  })

  it('fails when first milestone is not easy', () => {
    const result = assertProgressiveDifficulty(
      makeRoadmap([{ difficulty: 'medium' }]),
    )
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('First milestone')
  })

  it('fails when no hard milestone exists', () => {
    const roadmap = makeRoadmap()
    roadmap.milestones = roadmap.milestones.map((m) => ({
      ...m,
      difficulty: m.difficulty === 'hard' ? 'medium' : m.difficulty,
    })) as Roadmap['milestones']
    const result = assertProgressiveDifficulty(roadmap)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('hard')
  })

  it('fails when difficulty drops too steeply (hard → easy)', () => {
    const roadmap = makeRoadmap()
    roadmap.milestones[5].difficulty = 'hard'
    roadmap.milestones[6].difficulty = 'easy'
    const result = assertProgressiveDifficulty(roadmap)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('drops too steeply')
  })

  it('allows difficulty to stay the same or decrease by one', () => {
    // hard → medium is allowed
    const roadmap = makeRoadmap()
    roadmap.milestones[5].difficulty = 'hard'
    roadmap.milestones[6].difficulty = 'medium'
    const result = assertProgressiveDifficulty(roadmap)
    expect(result.pass).toBe(true)
  })
})

describe('assertMilestoneCompleteness', () => {
  it('passes when all fields are populated', () => {
    const result = assertMilestoneCompleteness(makeRoadmap())
    expect(result.pass).toBe(true)
  })

  it('fails with empty title', () => {
    const result = assertMilestoneCompleteness(makeRoadmap([{ title: '' }]))
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('empty title')
  })

  it('fails with whitespace-only description', () => {
    const result = assertMilestoneCompleteness(makeRoadmap([{ description: '   ' }]))
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('empty description')
  })

  it('fails with empty concept', () => {
    const result = assertMilestoneCompleteness(makeRoadmap([{ concept: '' }]))
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('empty concept')
  })
})

// ─── Quiz assertions ─────────────────────────────────────────────────────────

describe('assertQuizQuestionCount', () => {
  it('passes with expected count', () => {
    expect(assertQuizQuestionCount(makeQuiz(6), 6).pass).toBe(true)
    expect(assertQuizQuestionCount(makeQuiz(4), 4).pass).toBe(true)
  })

  it('fails with wrong count', () => {
    const result = assertQuizQuestionCount(makeQuiz(5), 6)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('5')
  })
})

describe('assertQuizQuestionQuality', () => {
  it('passes with well-formed questions', () => {
    const result = assertQuizQuestionQuality(makeQuiz())
    expect(result.pass).toBe(true)
  })

  it('fails when a question has wrong number of options', () => {
    const quiz = makeQuiz()
    quiz.questions[0].options = quiz.questions[0].options.slice(0, 3)
    const result = assertQuizQuestionQuality(quiz)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('3 options')
  })

  it('fails when correctId does not match any option', () => {
    const quiz = makeQuiz()
    quiz.questions[1].correctId = 'nonexistent'
    const result = assertQuizQuestionQuality(quiz)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('nonexistent')
  })

  it('fails when explanation is empty', () => {
    const quiz = makeQuiz()
    quiz.questions[2].explanation = ''
    const result = assertQuizQuestionQuality(quiz)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('empty explanation')
  })
})

describe('assertDifficultyDistribution', () => {
  it('passes with mixed difficulties', () => {
    const result = assertDifficultyDistribution(makeQuiz())
    expect(result.pass).toBe(true)
  })

  it('fails when all questions have the same difficulty', () => {
    const quiz = makeQuiz()
    quiz.questions.forEach((q) => (q.difficulty = 'beginner'))
    const result = assertDifficultyDistribution(quiz)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('one difficulty')
  })
})

// ─── Starter assertions ──────────────────────────────────────────────────────

describe('assertStarterCodeValid', () => {
  it('passes with valid HTML document', () => {
    const result = assertStarterCodeValid(makeStarter())
    expect(result.pass).toBe(true)
  })

  it('fails when missing body tag', () => {
    const starter = makeStarter()
    starter.html = '<html><head></head></html>'
    const result = assertStarterCodeValid(starter)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('<body>')
  })

  it('passes with just html and body tags (no doctype)', () => {
    const starter = makeStarter()
    starter.html = '<html><head></head><body><div></div></body></html>'
    const result = assertStarterCodeValid(starter)
    expect(result.pass).toBe(true)
  })
})

describe('assertStarterTasks', () => {
  it('passes with 3 complete tasks', () => {
    const result = assertStarterTasks(makeStarter())
    expect(result.pass).toBe(true)
  })

  it('passes with 4 tasks', () => {
    const starter = makeStarter()
    starter.tasks.push({ id: 't4', text: 'Add list', hint: 'Use ul', test: 'document.querySelector("ul")' })
    const result = assertStarterTasks(starter)
    expect(result.pass).toBe(true)
  })

  it('fails with fewer than 3 tasks', () => {
    const starter = makeStarter()
    starter.tasks = starter.tasks.slice(0, 2)
    const result = assertStarterTasks(starter)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('2')
  })

  it('fails with more than 4 tasks', () => {
    const starter = makeStarter()
    starter.tasks.push(
      { id: 't4', text: 'T4', hint: 'H4', test: 'true' },
      { id: 't5', text: 'T5', hint: 'H5', test: 'true' },
    )
    const result = assertStarterTasks(starter)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('5')
  })

  it('fails with empty task text', () => {
    const starter = makeStarter()
    starter.tasks[0].text = ''
    const result = assertStarterTasks(starter)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('empty text')
  })

  it('fails with empty hint', () => {
    const starter = makeStarter()
    starter.tasks[1].hint = '   '
    const result = assertStarterTasks(starter)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('empty hint')
  })
})

// ─── Concept assertions ──────────────────────────────────────────────────────

describe('assertConceptWordCount', () => {
  it('passes when under word limit', () => {
    const text = Array(150).fill('word').join(' ')
    const result = assertConceptWordCount(text, 200)
    expect(result.pass).toBe(true)
  })

  it('fails when over word limit', () => {
    const text = Array(250).fill('word').join(' ')
    const result = assertConceptWordCount(text, 200)
    expect(result.pass).toBe(false)
    expect(result.reason).toContain('250')
  })

  it('uses 200 as default max', () => {
    const text = Array(201).fill('word').join(' ')
    const result = assertConceptWordCount(text)
    expect(result.pass).toBe(false)
  })

  it('passes at exactly the limit', () => {
    const text = Array(200).fill('word').join(' ')
    const result = assertConceptWordCount(text, 200)
    expect(result.pass).toBe(true)
  })
})
