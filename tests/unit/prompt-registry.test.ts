import { describe, it, expect } from 'vitest'
import {
  getPrompt,
  listPrompts,
  getPromptVersion,
} from '@/lib/prompts'

// Importing index.ts triggers all registerPrompt() side effects,
// so by the time these tests run the registry is fully populated.

const EXPECTED_PROMPTS = [
  'onboarding-chat',
  'quiz-generate',
  'quiz-evaluate',
  'roadmap-generate',
  'milestone-chat',
  'milestone-concept',
  'milestone-starter',
  'milestone-verify-tasks',
  'milestone-quiz-generate',
] as const

// ── Registry contents ─────────────────────────────────────────────────────────

describe('prompt registry', () => {
  it('has exactly 9 prompts registered', () => {
    expect(listPrompts()).toHaveLength(9)
  })

  it('contains every expected prompt name', () => {
    const registered = listPrompts()
    EXPECTED_PROMPTS.forEach((name) => {
      expect(registered).toContain(name)
    })
  })

  it('getPromptVersion returns the version string for known prompts', () => {
    EXPECTED_PROMPTS.forEach((name) => {
      expect(getPromptVersion(name)).toMatch(/^\d+\.\d+\.\d+$/)
    })
  })

  it('getPromptVersion returns undefined for an unknown name', () => {
    expect(getPromptVersion('does-not-exist')).toBeUndefined()
  })

  it('getPrompt throws a descriptive error for an unknown name', () => {
    expect(() => getPrompt('does-not-exist')).toThrowError(
      /does-not-exist/,
    )
  })

  it('getPrompt error message lists available prompts', () => {
    expect(() => getPrompt('typo-prompt')).toThrowError(
      /Registered prompts:/,
    )
  })
})

// ── Per-prompt shape validation ───────────────────────────────────────────────

describe.each(EXPECTED_PROMPTS)('prompt "%s"', (name) => {
  it('has required metadata fields', () => {
    const p = getPrompt(name)
    expect(p.name).toBe(name)
    expect(p.version).toBeTruthy()
    expect(p.description).toBeTruthy()
    expect(p.model).toBeTruthy()
  })

  it('has a non-empty changelog', () => {
    const p = getPrompt(name)
    expect(p.changelog.length).toBeGreaterThan(0)
    expect(p.changelog[0].version).toBeTruthy()
    expect(p.changelog[0].change).toBeTruthy()
  })

  it('template is a function', () => {
    const p = getPrompt(name)
    expect(typeof p.template).toBe('function')
  })

  it('variables list is non-empty', () => {
    const p = getPrompt(name)
    expect(p.variables.length).toBeGreaterThan(0)
  })
})

// ── Template output spot-checks ───────────────────────────────────────────────

describe('prompt template output', () => {
  it('onboarding-chat includes the project idea', () => {
    const output = getPrompt('onboarding-chat').template({ idea: 'a recipe tracker' })
    expect(output).toContain('a recipe tracker')
    expect(output).toContain('[READY_FOR_QUIZ]')
  })

  it('roadmap-generate includes idea, level, and level guidance', () => {
    const output = getPrompt('roadmap-generate').template({
      idea: 'a budget app',
      level: 'beginner',
    })
    expect(output).toContain('a budget app')
    expect(output).toContain('beginner')
    expect(output).toContain('7 milestones')
  })

  it('quiz-generate includes the idea and optional conversationSummary', () => {
    const withSummary = getPrompt('quiz-generate').template({
      idea: 'todo app',
      conversationSummary: 'wants offline support',
    })
    expect(withSummary).toContain('todo app')
    expect(withSummary).toContain('wants offline support')

    const withoutSummary = getPrompt('quiz-generate').template({ idea: 'todo app' })
    expect(withoutSummary).not.toContain('Additional context')
  })

  it('milestone-chat includes all key context variables', () => {
    const output = getPrompt('milestone-chat').template({
      idea: 'expense tracker',
      milestoneOrder: 2,
      milestoneTitle: 'Add a form',
      concept: 'DOM Manipulation',
      description: 'Build the input form.',
      level: 'beginner',
      currentCode: '<html/>',
    })
    expect(output).toContain('expense tracker')
    expect(output).toContain('DOM Manipulation')
    expect(output).toContain('<html/>')
  })

  it('milestone-starter uses first-milestone instructions when isFirst=true', () => {
    const first = getPrompt('milestone-starter').template({
      idea: 'blog',
      milestoneOrder: 1,
      milestoneTitle: 'Setup',
      concept: 'HTML Boilerplate',
      description: 'Create the scaffold.',
      level: 'beginner',
      isFirst: true,
    })
    expect(first).toContain('HTML5 boilerplate')

    const later = getPrompt('milestone-starter').template({
      idea: 'blog',
      milestoneOrder: 3,
      milestoneTitle: 'Add styles',
      concept: 'CSS Flexbox',
      description: 'Style the layout.',
      level: 'beginner',
      isFirst: false,
    })
    expect(later).toContain('earlier milestones')
  })
})
