// ─── Prompt Management Types ──────────────────────────────────────────────────
// Prompts are versioned, typed artifacts — not inline strings.
// Every prompt has a template function (vars → string), metadata, and a changelog.
// ─────────────────────────────────────────────────────────────────────────────

/** All variable values a prompt template can receive */
export type PromptVariables = Record<string, string | number | boolean | undefined>

/** A prompt template is a pure function: variables in → compiled string out */
export type PromptTemplate<T extends PromptVariables = PromptVariables> = (vars: T) => string

/** One entry in a prompt's changelog */
export interface PromptChangelogEntry {
  version: string
  date: string
  change: string
}

/**
 * The full configuration for a managed prompt.
 *
 * @template T - Shape of the variables object the template requires.
 *
 * Usage:
 *   export const myPrompt = {
 *     name: 'my-prompt',
 *     version: '1.0.0',
 *     ...
 *   } satisfies PromptConfig<{ idea: string }>
 */
export interface PromptConfig<T extends PromptVariables = PromptVariables> {
  /** Unique identifier used to look up the prompt via getPrompt() */
  name: string
  /** Semantic version — increment on any content change */
  version: string
  /** One-line description of what this prompt does */
  description: string
  /** Pure function: receives typed variables, returns the compiled prompt string */
  template: PromptTemplate<T>
  /** List of variable keys the template expects — serves as documentation */
  variables: (keyof T)[]
  /** Model identifier this prompt is tuned for */
  model: string
  /** Full history of changes to this prompt */
  changelog: PromptChangelogEntry[]
}
