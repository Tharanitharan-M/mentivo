// ─── AI Error Types ───────────────────────────────────────────────────────────
// Structured error class for AI generation failures.
// Carries prompt context so errors logged in production include enough
// information to diagnose which prompt, which version, and what caused it —
// without having to dig through raw logs.
// ─────────────────────────────────────────────────────────────────────────────

export class AIGenerationError extends Error {
  constructor(
    message: string,
    public readonly promptName: string,
    public readonly promptVersion: string,
    public readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'AIGenerationError'

    // Maintain proper stack trace in V8 (Node.js / Chrome)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AIGenerationError)
    }
  }
}
