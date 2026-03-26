// ─── Validation & Sanitization Tests ─────────────────────────────────────────

import { describe, it, expect } from 'vitest'
import {
  sanitizeInput,
  validateBody,
  ChatRequestSchema,
  QuizGenerateRequestSchema,
  QuizEvaluateRequestSchema,
  RoadmapGenerateRequestSchema,
  MilestoneStarterRequestSchema,
  MilestoneVerifyTasksRequestSchema,
} from '@/lib/validation'

// ─── sanitizeInput ────────────────────────────────────────────────────────────

describe('sanitizeInput', () => {
  it('returns clean text unchanged', () => {
    expect(sanitizeInput('Build a todo app')).toBe('Build a todo app')
  })

  it('strips HTML tags but preserves text content between them', () => {
    // Tags are removed; text between tags is kept (harmless when sent as plain text to LLM)
    expect(sanitizeInput('Build a <script>alert(1)</script> app')).toBe('Build a alert(1) app')
  })

  it('strips HTML tags with attributes', () => {
    expect(sanitizeInput('<img src=x onerror=alert(1)>recipe finder')).toBe('recipe finder')
  })

  it('removes ASCII control characters', () => {
    expect(sanitizeInput('hello\x00world\x1F!')).toBe('helloworld!')
  })

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
  })

  it('enforces default 1000 char limit', () => {
    const long = 'a'.repeat(2000)
    expect(sanitizeInput(long)).toHaveLength(1000)
  })

  it('respects custom maxChars limit', () => {
    expect(sanitizeInput('hello world', 5)).toBe('hello')
  })

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('')
  })

  it('preserves normal punctuation and numbers', () => {
    const input = 'Recipe finder v2.0 — search by ingredients!'
    expect(sanitizeInput(input)).toBe(input)
  })

  it('strips nested HTML tags', () => {
    expect(sanitizeInput('<b><i>bold italic</i></b>')).toBe('bold italic')
  })
})

// ─── validateBody ─────────────────────────────────────────────────────────────

describe('validateBody — ChatRequestSchema', () => {
  it('accepts valid body with projectId', async () => {
    const result = validateBody({ projectId: 'proj-1', messages: [] }, ChatRequestSchema)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.projectId).toBe('proj-1')
  })

  it('defaults messages to empty array when omitted', () => {
    const result = validateBody({ projectId: 'proj-1' }, ChatRequestSchema)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.messages).toEqual([])
  })

  it('rejects missing projectId', async () => {
    const result = validateBody({ messages: [] }, ChatRequestSchema)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      const body = await result.error.json()
      expect(body.error).toBe('Invalid request')
      expect(result.error.status).toBe(400)
    }
  })

  it('rejects empty projectId', () => {
    const result = validateBody({ projectId: '' }, ChatRequestSchema)
    expect(result.ok).toBe(false)
  })
})

describe('validateBody — QuizGenerateRequestSchema', () => {
  it('accepts valid body', () => {
    const result = validateBody({ projectId: 'proj-1' }, QuizGenerateRequestSchema)
    expect(result.ok).toBe(true)
  })

  it('accepts optional conversationSummary', () => {
    const result = validateBody(
      { projectId: 'proj-1', conversationSummary: 'They want a weather app' },
      QuizGenerateRequestSchema,
    )
    expect(result.ok).toBe(true)
  })

  it('rejects conversationSummary over 2000 chars', () => {
    const result = validateBody(
      { projectId: 'proj-1', conversationSummary: 'x'.repeat(2001) },
      QuizGenerateRequestSchema,
    )
    expect(result.ok).toBe(false)
  })
})

describe('validateBody — QuizEvaluateRequestSchema', () => {
  it('accepts valid body', () => {
    const result = validateBody(
      { projectId: 'proj-1', questions: [{ id: 'q1' }], answers: { q1: 'q1_a' } },
      QuizEvaluateRequestSchema,
    )
    expect(result.ok).toBe(true)
  })

  it('rejects empty questions array', () => {
    const result = validateBody(
      { projectId: 'proj-1', questions: [], answers: {} },
      QuizEvaluateRequestSchema,
    )
    expect(result.ok).toBe(false)
  })
})

describe('validateBody — RoadmapGenerateRequestSchema', () => {
  it('accepts valid body', () => {
    expect(validateBody({ projectId: 'proj-1' }, RoadmapGenerateRequestSchema).ok).toBe(true)
  })

  it('rejects missing projectId', () => {
    expect(validateBody({}, RoadmapGenerateRequestSchema).ok).toBe(false)
  })
})

describe('validateBody — MilestoneStarterRequestSchema', () => {
  it('accepts valid body', () => {
    expect(validateBody({ milestoneId: 'ms-1' }, MilestoneStarterRequestSchema).ok).toBe(true)
  })

  it('rejects missing milestoneId', () => {
    expect(validateBody({}, MilestoneStarterRequestSchema).ok).toBe(false)
  })
})

describe('validateBody — MilestoneVerifyTasksRequestSchema', () => {
  it('accepts body with only milestoneId', () => {
    expect(validateBody({ milestoneId: 'ms-1' }, MilestoneVerifyTasksRequestSchema).ok).toBe(true)
  })

  it('accepts body with code and tasks', () => {
    const result = validateBody(
      { milestoneId: 'ms-1', code: '<html></html>', tasks: [{ id: 't1' }] },
      MilestoneVerifyTasksRequestSchema,
    )
    expect(result.ok).toBe(true)
  })

  it('rejects code over 10000 chars', () => {
    const result = validateBody(
      { milestoneId: 'ms-1', code: 'x'.repeat(10_001) },
      MilestoneVerifyTasksRequestSchema,
    )
    expect(result.ok).toBe(false)
  })

  it('includes field path in error details', async () => {
    const result = validateBody({ milestoneId: '' }, MilestoneVerifyTasksRequestSchema)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      const body = await result.error.json()
      expect(body.details).toBeDefined()
      expect(Array.isArray(body.details)).toBe(true)
    }
  })
})
