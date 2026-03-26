import { describe, it, expect } from 'vitest'
import { withTracing } from '@/lib/tracing'
import { AIGenerationError } from '@/lib/ai-errors'

// ── withTracing ───────────────────────────────────────────────────────────────

describe('withTracing', () => {
  it('returns an object with experimental_telemetry enabled', () => {
    const result = withTracing('roadmap-generate', { userId: 'u1' })
    expect(result.experimental_telemetry.isEnabled).toBe(true)
  })

  it('sets functionId to the prompt name', () => {
    const result = withTracing('quiz-generate', {})
    expect(result.experimental_telemetry.functionId).toBe('quiz-generate')
  })

  it('includes promptVersion from the registry', () => {
    // All registered prompts start at 1.0.0
    const result = withTracing('roadmap-generate', {})
    expect(result.experimental_telemetry.metadata.promptVersion).toBe('1.0.0')
  })

  it('falls back to "unknown" for an unregistered prompt name', () => {
    const result = withTracing('does-not-exist', {})
    expect(result.experimental_telemetry.metadata.promptVersion).toBe('unknown')
  })

  it('spreads all metadata fields into the telemetry metadata', () => {
    const result = withTracing('milestone-chat', {
      userId: 'user-123',
      projectId: 'proj-456',
      milestoneId: 'ms-789',
    })
    const { metadata } = result.experimental_telemetry
    expect(metadata.userId).toBe('user-123')
    expect(metadata.projectId).toBe('proj-456')
    expect(metadata.milestoneId).toBe('ms-789')
  })

  it('works with no metadata argument', () => {
    const result = withTracing('onboarding-chat')
    expect(result.experimental_telemetry.isEnabled).toBe(true)
    expect(result.experimental_telemetry.metadata.promptVersion).toBe('1.0.0')
  })

  it('output can be spread directly into an AI SDK call options object', () => {
    // Simulates: await generateObject({ model, schema, prompt, ...withTracing(...) })
    const aiOptions = {
      model: 'gemini',
      prompt: 'hello',
      ...withTracing('quiz-generate', { userId: 'u1' }),
    }
    expect(aiOptions).toHaveProperty('experimental_telemetry.isEnabled', true)
    expect(aiOptions).toHaveProperty('experimental_telemetry.functionId', 'quiz-generate')
  })
})

// ── AIGenerationError ─────────────────────────────────────────────────────────

describe('AIGenerationError', () => {
  it('has name "AIGenerationError"', () => {
    const err = new AIGenerationError('failed', 'roadmap-generate', '1.0.0')
    expect(err.name).toBe('AIGenerationError')
  })

  it('inherits from Error', () => {
    const err = new AIGenerationError('failed', 'roadmap-generate', '1.0.0')
    expect(err).toBeInstanceOf(Error)
  })

  it('exposes promptName and promptVersion', () => {
    const err = new AIGenerationError('failed', 'quiz-generate', '1.1.0')
    expect(err.promptName).toBe('quiz-generate')
    expect(err.promptVersion).toBe('1.1.0')
  })

  it('stores the cause', () => {
    const cause = new Error('rate limit')
    const err = new AIGenerationError('failed', 'milestone-chat', '1.0.0', cause)
    expect(err.cause).toBe(cause)
  })

  it('has a message', () => {
    const err = new AIGenerationError('Schema validation failed', 'roadmap-generate', '1.0.0')
    expect(err.message).toBe('Schema validation failed')
  })

  it('has a stack trace', () => {
    const err = new AIGenerationError('failed', 'quiz-generate', '1.0.0')
    expect(err.stack).toBeTruthy()
  })
})
