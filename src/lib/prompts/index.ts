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

// ── Prompt registrations ──────────────────────────────────────────────────────
// Each import executes registerPrompt() as a side effect.
// ─────────────────────────────────────────────────────────────────────────────

// Component 1b — core flow prompts
export { onboardingChat } from './onboarding-chat'
export { quizGenerate } from './quiz-generate'
export { quizEvaluate } from './quiz-evaluate'
export { roadmapGenerate } from './roadmap-generate'
export { milestoneChat } from './milestone-chat'
