import { registerPrompt } from './registry'
import type { PromptConfig } from './types'

type Vars = {
  idea: string
  score: number
  total: number
  percentage: number
  questionBreakdown: string
}

export const quizEvaluate = {
  name: 'quiz-evaluate',
  version: '1.0.0',
  description: 'Analyse skill quiz results and assign a learner level with personalised feedback',
  template: ({ idea, score, total, percentage, questionBreakdown }: Vars) => `A learner just completed a skill assessment for a coding project. Analyze their results.

Project they want to build: ${idea}
Score: ${score}/${total} (${percentage.toFixed(0)}%)

Results breakdown:
${questionBreakdown}

Based on this, provide:
- level: their overall coding level (beginner/intermediate/advanced)
- levelLabel: a creative, friendly label like "Curious Beginner", "Confident Builder", or "Seasoned Architect"
- summary: 2-3 warm sentences explaining their level and how we'll tailor their learning path for this project specifically
- strengths: exactly 2-3 short phrases of what they already understand well
- focusAreas: exactly 2-3 short phrases of key concepts to focus on for their project
- encouragement: one short, punchy, genuinely motivating sentence
- nextStep: one sentence describing what we'll start with in their learning path

Be warm, specific to their project, and genuinely encouraging — every level is the perfect starting point.`,
  variables: ['idea', 'score', 'total', 'percentage', 'questionBreakdown'],
  model: 'gemini-2.5-flash',
  changelog: [
    { version: '1.0.0', date: '2026-03-25', change: 'Initial extraction from inline prompt in /api/quiz/evaluate/route.ts' },
  ],
} satisfies PromptConfig<Vars>

registerPrompt(quizEvaluate)
