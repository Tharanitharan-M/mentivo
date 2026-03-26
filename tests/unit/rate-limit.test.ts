// ─── Rate Limiter Tests ───────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  checkRateLimit,
  rateLimitResponse,
  RATE_LIMIT,
  _resetWindowsForTesting,
} from '@/lib/rate-limit'

beforeEach(() => {
  _resetWindowsForTesting()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('checkRateLimit — per-minute window', () => {
  it('allows first request', () => {
    const result = checkRateLimit('user-1')
    expect(result.limited).toBe(false)
    expect(result.retryAfter).toBe(0)
  })

  it(`allows up to ${RATE_LIMIT.perMinute} requests per minute`, () => {
    for (let i = 0; i < RATE_LIMIT.perMinute; i++) {
      expect(checkRateLimit('user-1').limited).toBe(false)
    }
  })

  it(`blocks the ${RATE_LIMIT.perMinute + 1}th request within a minute`, () => {
    for (let i = 0; i < RATE_LIMIT.perMinute; i++) checkRateLimit('user-1')
    const result = checkRateLimit('user-1')
    expect(result.limited).toBe(true)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('resets after the minute window expires', () => {
    for (let i = 0; i < RATE_LIMIT.perMinute; i++) checkRateLimit('user-1')
    expect(checkRateLimit('user-1').limited).toBe(true)

    // Advance time past the window
    vi.advanceTimersByTime(61 * 1_000)
    expect(checkRateLimit('user-1').limited).toBe(false)
  })

  it('tracks different users independently', () => {
    for (let i = 0; i < RATE_LIMIT.perMinute; i++) checkRateLimit('user-a')
    expect(checkRateLimit('user-a').limited).toBe(true)
    expect(checkRateLimit('user-b').limited).toBe(false)
  })

  it('returns retryAfter close to 60 when blocked at window start', () => {
    for (let i = 0; i < RATE_LIMIT.perMinute; i++) checkRateLimit('user-1')
    const { retryAfter } = checkRateLimit('user-1')
    expect(retryAfter).toBeGreaterThan(0)
    expect(retryAfter).toBeLessThanOrEqual(60)
  })
})

describe('checkRateLimit — per-hour window', () => {
  it(`blocks after ${RATE_LIMIT.perHour} requests in an hour`, () => {
    // Make minute window irrelevant by spreading requests across minutes
    for (let i = 0; i < RATE_LIMIT.perHour; i++) {
      // Advance 7 seconds between each request so minute window never fills
      vi.advanceTimersByTime(7_000)
      checkRateLimit('user-1')
    }
    // Hour window should now be full
    vi.advanceTimersByTime(7_000)
    const result = checkRateLimit('user-1')
    expect(result.limited).toBe(true)
  })

  it('resets after the hour window expires', () => {
    for (let i = 0; i < RATE_LIMIT.perHour; i++) {
      vi.advanceTimersByTime(7_000)
      checkRateLimit('user-1')
    }
    vi.advanceTimersByTime(7_000)
    expect(checkRateLimit('user-1').limited).toBe(true)

    vi.advanceTimersByTime(61 * 60 * 1_000)
    expect(checkRateLimit('user-1').limited).toBe(false)
  })
})

describe('rateLimitResponse', () => {
  it('returns null when not rate limited', () => {
    expect(rateLimitResponse('user-1')).toBeNull()
  })

  it('returns 429 NextResponse when rate limited', () => {
    for (let i = 0; i < RATE_LIMIT.perMinute; i++) checkRateLimit('user-1')
    const response = rateLimitResponse('user-1')
    expect(response).not.toBeNull()
    expect(response?.status).toBe(429)
  })

  it('includes Retry-After header in 429 response', async () => {
    for (let i = 0; i < RATE_LIMIT.perMinute; i++) checkRateLimit('user-1')
    const response = rateLimitResponse('user-1')!
    expect(response.headers.get('Retry-After')).toBeTruthy()
  })

  it('includes retryAfter in response body', async () => {
    for (let i = 0; i < RATE_LIMIT.perMinute; i++) checkRateLimit('user-1')
    const response = rateLimitResponse('user-1')!
    const body = await response.json()
    expect(body.error).toContain('Too many requests')
    expect(typeof body.retryAfter).toBe('number')
    expect(body.retryAfter).toBeGreaterThan(0)
  })

  it('returns null again after window reset', () => {
    for (let i = 0; i < RATE_LIMIT.perMinute; i++) checkRateLimit('user-1')
    expect(rateLimitResponse('user-1')).not.toBeNull()

    vi.advanceTimersByTime(61 * 1_000)
    expect(rateLimitResponse('user-1')).toBeNull()
  })
})
