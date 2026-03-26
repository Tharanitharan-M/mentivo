// ─── Prompt Registry — Public API ────────────────────────────────────────────
// Import this module anywhere you need to compile or retrieve a prompt.
//
// Usage in a route handler:
//   import { getPrompt } from '@/lib/prompts'
//   const prompt = getPrompt('roadmap-generate')
//   const compiled = prompt.template({ idea, level })
//
// Each prompt file below registers itself into the registry on import.
// This file is the single place that triggers all registrations.
// ─────────────────────────────────────────────────────────────────────────────

// Registry functions — re-exported for consumers
export { getPrompt, listPrompts, getPromptVersion } from './registry'

// Type exports — re-exported for consumers
export type {
  PromptConfig,
  PromptTemplate,
  PromptVariables,
  PromptChangelogEntry,
} from './types'

// ── Prompt registrations (1b + 1c) ───────────────────────────────────────────
// Each import executes registerPrompt() as a side effect.
// Prompts are added here as they are extracted in subsequent components.
// ─────────────────────────────────────────────────────────────────────────────
