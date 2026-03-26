// Custom Promptfoo provider for roadmap-generate
// Wraps the real AI pipeline: prompt registry → generateObject → Zod schema

import './env'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { RoadmapSchema } from '../../src/lib/schemas'
import { roadmapGenerate } from '../../src/lib/prompts/roadmap-generate'

const model = google('gemini-2.5-flash')

export default class RoadmapProvider {
  id() {
    return 'mentivo:roadmap-generate'
  }

  async callApi(prompt: string, context: { vars: Record<string, string> }) {
    const { idea, level } = context.vars
    const compiledPrompt = roadmapGenerate.template({
      idea,
      level: level as 'beginner' | 'intermediate' | 'advanced',
    })

    try {
      const { object } = await generateObject({
        model,
        schema: RoadmapSchema,
        prompt: compiledPrompt,
      })
      return { output: JSON.stringify(object) }
    } catch (error) {
      return { error: `Generation failed: ${(error as Error).message}` }
    }
  }
}
