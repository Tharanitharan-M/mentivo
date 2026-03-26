import { registerPrompt } from './registry'
import type { PromptConfig } from './types'

type Vars = {
  idea: string
  milestoneOrder: number
  milestoneTitle: string
  concept: string
  description: string
  level: string
  isFirst: boolean
}

export const milestoneStarter = {
  name: 'milestone-starter',
  version: '1.0.0',
  description: 'Generate starter HTML/CSS/JS code and 3–4 verifiable coding tasks for a milestone',
  template: ({ idea, milestoneOrder, milestoneTitle, concept, description, level, isFirst }: Vars) => `Generate starter HTML/CSS/JS code AND verifiable coding tasks for a milestone.

Project: "${idea}"
Milestone ${milestoneOrder}: "${milestoneTitle}"
Concept to teach: "${concept}"
What to build: "${description}"
Student level: ${level}

STARTER CODE rules:
${isFirst
  ? '- Clean HTML5 boilerplate with <style> and <script> blocks\n- TODO comments showing where to build\n- Just the skeleton, not the implementation'
  : '- Builds on earlier milestones (assume basic HTML structure exists)\n- Shows this milestone\'s feature scaffold\n- ~20-30% pre-filled to get them started'
}
- Under 70 lines, relevant to "${idea}", ${level === 'beginner' ? 'lots of guiding comments' : 'clean code with few comments'}

TASKS rules (3–4 tasks):
- Each is a concrete, verifiable coding action (e.g. "Add a <form> element with id='expense-form'")
- Ordered from simple to complex — each builds on the previous
- Written as clear instructions ("Add", "Create", "Make", "Write")
- The hint should be a short code snippet or direction (one line)
- IDs: t1, t2, t3, t4
- Together, completing all tasks means the milestone is essentially built

For EACH task you MUST provide a "test" field: a short JavaScript expression that runs in the BROWSER (same window as the learner's page) and returns true if the task is done, false otherwise.
- Use only the DOM: document.getElementById, document.querySelector, document.querySelectorAll, element.matches, .value, etc.
- Must be a single expression or IIFE that evaluates to a boolean, e.g. "!!document.getElementById('expense-form')" or "(function(){ return document.querySelectorAll('input').length >= 2; })()"
- No document.write, no fetch, no external URLs. Must run synchronously.
- The learner's HTML/JS will already be loaded in the window when this runs.`,
  variables: ['idea', 'milestoneOrder', 'milestoneTitle', 'concept', 'description', 'level', 'isFirst'],
  model: 'gemini-2.5-flash',
  changelog: [
    { version: '1.0.0', date: '2026-03-25', change: 'Initial extraction from inline prompt in /api/milestone/starter/route.ts' },
  ],
} satisfies PromptConfig<Vars>

registerPrompt(milestoneStarter)
