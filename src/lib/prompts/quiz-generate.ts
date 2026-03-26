import { registerPrompt } from './registry'
import type { PromptConfig } from './types'

type Vars = {
  idea: string
  conversationSummary?: string
}

export const quizGenerate = {
  name: 'quiz-generate',
  version: '1.0.0',
  description: 'Generate 6 tiered multiple-choice questions to assess a learner\'s coding skill level',
  template: ({ idea, conversationSummary }: Vars) => `Generate exactly 6 multiple-choice quiz questions to assess a learner's coding skill level.

Project they want to build: ${idea}
${conversationSummary ? `Additional context from conversation: ${conversationSummary}` : ''}

Requirements:
- Questions 1-2: Beginner difficulty (what is HTML/CSS/JS, variables, loops, basic concepts)
- Questions 3-4: Intermediate difficulty (functions, components, APIs, databases, React)
- Questions 5-6: Advanced difficulty (architecture decisions, performance, design patterns, state management)
- Each question must have exactly 4 answer options
- Questions should be relevant to concepts needed to build their specific project
- Test understanding and practical thinking, not trivia or memorization
- Be friendly and educational in phrasing

IMPORTANT: For IDs, use exactly: question ids q1 through q6, option ids like q1_a, q1_b, q1_c, q1_d.
The correctId must match one of the option ids exactly.`,
  variables: ['idea'],
  model: 'gemini-2.5-flash',
  changelog: [
    { version: '1.0.0', date: '2026-03-25', change: 'Initial extraction from inline prompt in /api/quiz/generate/route.ts' },
  ],
} satisfies PromptConfig<Vars>

registerPrompt(quizGenerate)
