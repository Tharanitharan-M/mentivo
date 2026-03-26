// Custom Promptfoo provider for quiz-generate
// Wraps the real AI pipeline: prompt registry → generateObject → Zod schema

import './env'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { QuizSchema } from '../../src/lib/schemas'
import { quizGenerate } from '../../src/lib/prompts/quiz-generate'

const model = google('gemini-2.5-flash')

export default class QuizProvider {
  id() {
    return 'mentivo:quiz-generate'
  }

  async callApi(prompt: string, context: { vars: Record<string, string> }) {
    const { idea, conversationSummary } = context.vars
    const compiledPrompt = quizGenerate.template({
      idea,
      conversationSummary: conversationSummary || undefined,
    })

    try {
      const { object } = await generateObject({
        model,
        schema: QuizSchema,
        prompt: compiledPrompt,
      })
      return { output: JSON.stringify(object) }
    } catch (error) {
      return { error: `Generation failed: ${(error as Error).message}` }
    }
  }
}
