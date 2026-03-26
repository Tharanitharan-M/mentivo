// Load environment variables for Promptfoo eval providers.
// Next.js auto-loads .env.local, but Promptfoo doesn't — so we do it manually.

import { config } from 'dotenv'

config({ path: '.env' })
config({ path: '.env.local', override: true })

// Promptfoo's built-in Google provider (used for llm-rubric grading) expects
// GOOGLE_API_KEY, but the Vercel AI SDK uses GOOGLE_GENERATIVE_AI_API_KEY.
// Bridge the gap so both work from the same key.
if (process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GOOGLE_API_KEY) {
  process.env.GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY
}
