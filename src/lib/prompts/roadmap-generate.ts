import { registerPrompt } from './registry'
import type { PromptConfig } from './types'

type Vars = {
  idea: string
  level: 'beginner' | 'intermediate' | 'advanced'
}

const levelGuidance: Record<Vars['level'], string> = {
  beginner:     'start from absolute basics, no assumed knowledge',
  intermediate: 'assume basic HTML/CSS/JS knowledge, dive deeper',
  advanced:     'assume solid fundamentals, focus on architecture and best practices',
}

export const roadmapGenerate = {
  name: 'roadmap-generate',
  version: '1.0.0',
  description: 'Generate a 7-milestone progressive learning roadmap tailored to the learner\'s project and skill level',
  template: ({ idea, level }: Vars) => `Create a milestone-based learning roadmap for a student building their project.

Project idea: "${idea}"
Student level: ${level}

Generate exactly 7 milestones that progressively build the complete project from scratch.

Guidelines:
- Each milestone builds directly on the previous one — they form a continuous project
- Each milestone should be completable in 2–4 hours of focused work
- Each teaches exactly ONE main programming concept
- Milestone 1 should be "Set up the project" — environment, file structure, basic scaffold
- Final milestone should result in a fully working, deployable project
- Concept names should be specific (e.g. "Event Listeners" not just "JavaScript")
- Tags should be 2–4 specific technologies or concepts (e.g. ["HTML", "CSS Grid", "Flexbox"])
- Descriptions should be 2 sentences: what they'll build + what they'll learn
- For ${level} level: ${levelGuidance[level]}
- estimatedTime examples: "1–2 hours", "2–3 hours", "3–4 hours"`,
  variables: ['idea', 'level'],
  model: 'gemini-2.5-flash',
  changelog: [
    { version: '1.0.0', date: '2026-03-25', change: 'Initial extraction from inline prompt in /api/roadmap/generate/route.ts' },
  ],
} satisfies PromptConfig<Vars>

registerPrompt(roadmapGenerate)
