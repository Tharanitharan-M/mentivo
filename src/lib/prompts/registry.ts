// ─── Prompt Registry ──────────────────────────────────────────────────────────
// Single source of truth for all managed prompts.
// Route handlers call getPrompt(name) instead of inlining strings.
// ─────────────────────────────────────────────────────────────────────────────

import type { PromptConfig, PromptVariables } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry = new Map<string, PromptConfig<any>>()

/**
 * Register a prompt config into the global registry.
 * Called once per prompt file at module load time.
 */
export function registerPrompt<T extends PromptVariables>(config: PromptConfig<T>): void {
  registry.set(config.name, config)
}

/**
 * Retrieve a prompt config by name.
 * Throws if the prompt has not been registered — fail fast at startup,
 * not silently at request time.
 */
export function getPrompt<T extends PromptVariables = PromptVariables>(name: string): PromptConfig<T> {
  const prompt = registry.get(name)
  if (!prompt) {
    const available = [...registry.keys()].join(', ')
    throw new Error(
      `Prompt "${name}" not found in registry. Registered prompts: [${available || 'none'}]`
    )
  }
  return prompt as PromptConfig<T>
}

/** Returns the names of all registered prompts — useful for auditing and tests */
export function listPrompts(): string[] {
  return [...registry.keys()]
}

/** Returns the version string for a registered prompt, or undefined if not found */
export function getPromptVersion(name: string): string | undefined {
  return registry.get(name)?.version
}
