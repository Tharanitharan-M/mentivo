import { registerPrompt } from './registry'
import type { PromptConfig } from './types'

type Vars = {
  concept: string
  idea: string
  level: string
}

export const milestoneConcept = {
  name: 'milestone-concept',
  version: '1.0.0',
  description: 'Generate a short, punchy concept explanation (150–200 words) with one focused code example',
  template: ({ concept, idea, level }: Vars) => `Write a SHORT, punchy concept explanation for a coding lesson.

Concept: "${concept}"
Project context: "${idea}"
Student level: ${level}

Format exactly like this — keep it brief:

# ${concept}

[2–3 sentences only. Define what ${concept} is in plain language. One analogy if it helps.]

\`\`\`html
[ONE focused code example, 8–14 lines, directly related to "${idea}"]
\`\`\`

[1–2 sentences: how this concept is used when building "${idea}". Be specific.]

Rules:
- Total output: 150–200 words maximum
- No extra sections, no bullet points, no headers beyond the title
- The code example must be the most important illustration of the concept
- Write for a ${level} student — simple words, concrete ideas`,
  variables: ['concept', 'idea', 'level'],
  model: 'gemini-2.5-flash',
  changelog: [
    { version: '1.0.0', date: '2026-03-25', change: 'Initial extraction from inline prompt in /api/milestone/concept/route.ts' },
  ],
} satisfies PromptConfig<Vars>

registerPrompt(milestoneConcept)
