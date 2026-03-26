// ─── Structured Logger ────────────────────────────────────────────────────────
// Emits JSON log entries carrying AI-specific context alongside standard fields.
//
// Every log entry includes: timestamp, level, message.
// AI-call entries additionally carry: userId, projectId, promptName,
// promptVersion, duration (ms), tokenUsage.
//
// Why JSON? Log aggregators (Vercel Log Drains, Datadog, etc.) parse structured
// JSON out of the box — no regex required. Each field becomes a searchable
// attribute so you can query "all errors for promptName=roadmap-generate" or
// "p95 duration for userId=X" without additional parsing pipelines.
//
// Complements Langfuse/OTel: OTel traces capture AI span detail;
// this logger captures operational events (auth errors, cache hits, retry
// attempts) and surfaces them in the same log stream as your app logs.
// ─────────────────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface TokenUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

export interface LogContext {
  userId?: string
  projectId?: string
  milestoneId?: string
  promptName?: string
  promptVersion?: string
  /** Wall-clock duration of the operation in milliseconds */
  duration?: number
  tokenUsage?: TokenUsage
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  [key: string]: unknown
}

// ─── Level filtering ──────────────────────────────────────────────────────────

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function resolveMinLevel(): LogLevel {
  const env = process.env.LOG_LEVEL as LogLevel | undefined
  if (env && env in LEVEL_PRIORITY) return env
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

// ─── Core emit ────────────────────────────────────────────────────────────────

function emit(level: LogLevel, message: string, context: LogContext = {}): void {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[resolveMinLevel()]) return

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  }

  const line = JSON.stringify(entry)

  // Errors and warnings go to stderr so they're separated in log drains
  if (level === 'error' || level === 'warn') {
    console.error(line)
  } else {
    console.log(line)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const logger = {
  debug: (message: string, context?: LogContext) => emit('debug', message, context),
  info:  (message: string, context?: LogContext) => emit('info',  message, context),
  warn:  (message: string, context?: LogContext) => emit('warn',  message, context),
  error: (message: string, context?: LogContext) => emit('error', message, context),
}
