import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from '@/lib/logger'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseLog(spy: ReturnType<typeof vi.spyOn>, callIndex = 0): Record<string, unknown> {
  const raw = (spy.mock.calls[callIndex]?.[0] ?? '') as string
  return JSON.parse(raw)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('logger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy   = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    // Ensure LOG_LEVEL doesn't suppress anything for most tests
    delete process.env.LOG_LEVEL
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ─── Output routing ──────────────────────────────────────────────────────

  describe('output routing', () => {
    it('routes debug to console.log', () => {
      logger.debug('test')
      expect(logSpy).toHaveBeenCalledOnce()
      expect(errorSpy).not.toHaveBeenCalled()
    })

    it('routes info to console.log', () => {
      logger.info('test')
      expect(logSpy).toHaveBeenCalledOnce()
      expect(errorSpy).not.toHaveBeenCalled()
    })

    it('routes warn to console.error', () => {
      logger.warn('test')
      expect(errorSpy).toHaveBeenCalledOnce()
      expect(logSpy).not.toHaveBeenCalled()
    })

    it('routes error to console.error', () => {
      logger.error('test')
      expect(errorSpy).toHaveBeenCalledOnce()
      expect(logSpy).not.toHaveBeenCalled()
    })
  })

  // ─── Base fields ─────────────────────────────────────────────────────────

  describe('base fields', () => {
    it('emits valid ISO 8601 timestamp', () => {
      logger.info('msg')
      const entry = parseLog(logSpy)
      expect(() => new Date(entry.timestamp as string)).not.toThrow()
      expect(new Date(entry.timestamp as string).toISOString()).toBe(entry.timestamp)
    })

    it('includes level field', () => {
      logger.warn('msg')
      const entry = parseLog(errorSpy)
      expect(entry.level).toBe('warn')
    })

    it('includes message field', () => {
      logger.info('hello world')
      const entry = parseLog(logSpy)
      expect(entry.message).toBe('hello world')
    })

    it('emits valid JSON', () => {
      logger.info('test')
      const raw = logSpy.mock.calls[0]?.[0] as string
      expect(() => JSON.parse(raw)).not.toThrow()
    })
  })

  // ─── Context fields ───────────────────────────────────────────────────────

  describe('context fields', () => {
    it('includes userId', () => {
      logger.info('ai call', { userId: 'user_123' })
      const entry = parseLog(logSpy)
      expect(entry.userId).toBe('user_123')
    })

    it('includes projectId', () => {
      logger.info('ai call', { projectId: 'proj_abc' })
      const entry = parseLog(logSpy)
      expect(entry.projectId).toBe('proj_abc')
    })

    it('includes milestoneId', () => {
      logger.info('ai call', { milestoneId: 'ms_xyz' })
      const entry = parseLog(logSpy)
      expect(entry.milestoneId).toBe('ms_xyz')
    })

    it('includes promptName', () => {
      logger.info('ai call', { promptName: 'roadmap-generate' })
      const entry = parseLog(logSpy)
      expect(entry.promptName).toBe('roadmap-generate')
    })

    it('includes promptVersion', () => {
      logger.info('ai call', { promptVersion: '1.0.0' })
      const entry = parseLog(logSpy)
      expect(entry.promptVersion).toBe('1.0.0')
    })

    it('includes duration in ms', () => {
      logger.info('ai call', { duration: 342 })
      const entry = parseLog(logSpy)
      expect(entry.duration).toBe(342)
    })

    it('includes tokenUsage object', () => {
      logger.info('ai call', {
        tokenUsage: { promptTokens: 120, completionTokens: 340, totalTokens: 460 },
      })
      const entry = parseLog(logSpy)
      expect(entry.tokenUsage).toEqual({
        promptTokens: 120,
        completionTokens: 340,
        totalTokens: 460,
      })
    })

    it('includes all AI fields together', () => {
      logger.info('roadmap generated', {
        userId: 'u1',
        projectId: 'p1',
        promptName: 'roadmap-generate',
        promptVersion: '1.0.0',
        duration: 2450,
        tokenUsage: { promptTokens: 200, completionTokens: 800, totalTokens: 1000 },
      })
      const entry = parseLog(logSpy)
      expect(entry.userId).toBe('u1')
      expect(entry.projectId).toBe('p1')
      expect(entry.promptName).toBe('roadmap-generate')
      expect(entry.promptVersion).toBe('1.0.0')
      expect(entry.duration).toBe(2450)
      expect((entry.tokenUsage as Record<string, number>).totalTokens).toBe(1000)
    })

    it('handles missing context gracefully', () => {
      expect(() => logger.info('no context')).not.toThrow()
      const entry = parseLog(logSpy)
      expect(entry.message).toBe('no context')
    })
  })

  // ─── Level filtering ──────────────────────────────────────────────────────

  describe('level filtering', () => {
    it('suppresses debug when LOG_LEVEL=info', () => {
      process.env.LOG_LEVEL = 'info'
      logger.debug('suppressed')
      expect(logSpy).not.toHaveBeenCalled()
    })

    it('allows info when LOG_LEVEL=info', () => {
      process.env.LOG_LEVEL = 'info'
      logger.info('allowed')
      expect(logSpy).toHaveBeenCalledOnce()
    })

    it('suppresses debug and info when LOG_LEVEL=warn', () => {
      process.env.LOG_LEVEL = 'warn'
      logger.debug('no')
      logger.info('no')
      expect(logSpy).not.toHaveBeenCalled()
    })

    it('allows warn and error when LOG_LEVEL=warn', () => {
      process.env.LOG_LEVEL = 'warn'
      logger.warn('yes')
      logger.error('yes')
      expect(errorSpy).toHaveBeenCalledTimes(2)
    })

    it('suppresses everything below error when LOG_LEVEL=error', () => {
      process.env.LOG_LEVEL = 'error'
      logger.debug('no')
      logger.info('no')
      logger.warn('no')
      expect(logSpy).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
    })

    it('only emits error when LOG_LEVEL=error', () => {
      process.env.LOG_LEVEL = 'error'
      logger.error('yes')
      expect(errorSpy).toHaveBeenCalledOnce()
    })
  })
})
