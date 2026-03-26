import { registerPrompt } from './registry'
import type { PromptConfig } from './types'

type Vars = {
  milestoneTitle: string
  concept: string
  description: string
  idea: string
  level: string
  userCode: string
}

export const milestoneQuizGenerate = {
  name: 'milestone-quiz-generate',
  version: '1.0.0',
  description: 'Generate 4 comprehension questions to verify a learner understood a milestone\'s concept',
  template: ({ milestoneTitle, concept, description, idea, level, userCode }: Vars) => `Generate exactly 4 multiple-choice questions to check understanding of a coding milestone.

Milestone: "${milestoneTitle}"
Concept taught: "${concept}"
What they built: "${description}"
Project context: "${idea}"
Student level: ${level}
${userCode ? `Their code:\n\`\`\`html\n${userCode}\n\`\`\`` : ''}

Requirements:
- 4 questions total: 2 concept questions + 1 practical "what does this code do" + 1 "what would happen if..."
- Each question has exactly 4 options
- Questions test understanding of ${concept}, not just memorization
- Be specific to what they just built
- Questions should be achievable for a ${level} level student

IDs: question ids q1–q4, option ids q1_a, q1_b, q1_c, q1_d etc.
The correctId must exactly match one of the option ids.`,
  variables: ['milestoneTitle', 'concept', 'description', 'idea', 'level', 'userCode'],
  model: 'gemini-2.5-flash',
  changelog: [
    { version: '1.0.0', date: '2026-03-25', change: 'Initial extraction from inline prompt in /api/milestone/quiz-generate/route.ts' },
  ],
} satisfies PromptConfig<Vars>

registerPrompt(milestoneQuizGenerate)
