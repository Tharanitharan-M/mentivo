// ─── AI Tracing Helpers ───────────────────────────────────────────────────────
// Provides a consistent shape for experimental_telemetry options passed to
// every Vercel AI SDK call (generateObject / generateText / streamText).
//
// Why a helper instead of inline objects?
// - Guarantees every AI call carries the same metadata fields
// - Single place to add new fields (e.g. userId, sessionId) later
// - Makes route handlers read clearly — the tracing concern is one line
// ─────────────────────────────────────────────────────────────────────────────

import { getPromptVersion } from '@/lib/prompts'

export interface TracingMetadata {
  userId?: string
  projectId?: string
  milestoneId?: string
  [key: string]: string | undefined
}

/**
 * Build the `experimental_telemetry` object for an AI SDK call.
 *
 * Usage:
 *   const result = await generateObject({
 *     model,
 *     schema: RoadmapSchema,
 *     prompt: compiled,
 *     ...withTracing('roadmap-generate', { userId, projectId }),
 *   })
 *
 * What Langfuse receives per call:
 *   - functionId  → groups traces by prompt name in the dashboard
 *   - promptVersion → links traces to the exact prompt version that ran
 *   - userId, projectId, milestoneId → filter/search in Langfuse
 */
export function withTracing(promptName: string, metadata: TracingMetadata = {}) {
  return {
    experimental_telemetry: {
      isEnabled: true,
      functionId: promptName,
      metadata: {
        promptVersion: getPromptVersion(promptName) ?? 'unknown',
        ...metadata,
      },
    },
  }
}
