// Custom Promptfoo provider for milestone-starter
// Wraps the real AI pipeline: prompt registry → generateObject → Zod schema

import './env'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { StarterSchema } from '../../src/lib/schemas'
import { milestoneStarter } from '../../src/lib/prompts/milestone-starter'

const model = google('gemini-2.5-flash')

export default class StarterProvider {
  id() {
    return 'mentivo:milestone-starter'
  }

  async callApi(prompt: string, context: { vars: Record<string, string> }) {
    const { idea, milestoneOrder, milestoneTitle, concept, description, level, isFirst } =
      context.vars
    const compiledPrompt = milestoneStarter.template({
      idea,
      milestoneOrder: Number(milestoneOrder),
      milestoneTitle,
      concept,
      description,
      level,
      isFirst: isFirst === 'true',
    })

    try {
      const { object } = await generateObject({
        model,
        schema: StarterSchema,
        prompt: compiledPrompt,
      })
      return { output: JSON.stringify(object) }
    } catch (error) {
      return { error: `Generation failed: ${(error as Error).message}` }
    }
  }
}
