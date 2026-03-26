// ─── API Rate Limiter ─────────────────────────────────────────────────────────
// Sliding window counter per userId. Protects AI endpoints from runaway usage.
//
// Limits (per user):
//   - 10 AI calls per minute
//   - 100 AI calls per hour
//
// ⚠️  Production note: This is process-local (in-memory Map). On Vercel, each
// serverless function invocation may run in a separate process, so the counter
// resets per cold start. For true distributed rate limiting upgrade to:
//   → Upstash Redis + @upstash/ratelimit (drop-in replacement, same interface)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'

interface Window {
  count: number
  resetAt: number
}

interface RateLimitResult {
  limited: boolean
  /** Seconds until the window resets. 0 when not limited. */
  retryAfter: number
}

// Two independent windows: per-minute and per-hour
const minuteWindows = new Map<string, Window>()
const hourWindows = new Map<string, Window>()

const MINUTE_MS = 60 * 1_000
const HOUR_MS = 60 * 60 * 1_000

export const RATE_LIMIT = {
  perMinute: 10,
  perHour: 100,
} as const

// ─── Core check ──────────────────────────────────────────────────────────────

function checkWindow(
  map: Map<string, Window>,
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const entry = map.get(key)

  if (!entry || now > entry.resetAt) {
    // New window — first request always passes
    map.set(key, { count: 1, resetAt: now + windowMs })
    return { limited: false, retryAfter: 0 }
  }

  if (entry.count >= maxRequests) {
    return {
      limited: true,
      retryAfter: Math.ceil((entry.resetAt - now) / 1_000),
    }
  }

  entry.count++
  return { limited: false, retryAfter: 0 }
}

/**
 * Check both the per-minute and per-hour windows for a userId.
 * Returns the tighter limit if either window is exceeded.
 */
export function checkRateLimit(userId: string): RateLimitResult {
  const minute = checkWindow(minuteWindows, userId, RATE_LIMIT.perMinute, MINUTE_MS)
  if (minute.limited) return minute

  const hour = checkWindow(hourWindows, userId, RATE_LIMIT.perHour, HOUR_MS)
  return hour
}

/**
 * Call at the top of every AI route handler (after auth).
 * Returns a 429 NextResponse if rate limited, or null to continue.
 *
 * @example
 * const limited = rateLimitResponse(session.user.id)
 * if (limited) return limited
 */
export function rateLimitResponse(userId: string): NextResponse | null {
  const { limited, retryAfter } = checkRateLimit(userId)
  if (!limited) return null

  return NextResponse.json(
    {
      error: 'Too many requests. Please wait a moment before making another AI request.',
      retryAfter,
    },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    },
  )
}

// ─── Test helpers ─────────────────────────────────────────────────────────────

/** Reset all windows — only for use in tests. */
export function _resetWindowsForTesting() {
  minuteWindows.clear()
  hourWindows.clear()
}
