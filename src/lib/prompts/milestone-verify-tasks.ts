import { registerPrompt } from './registry'
import type { PromptConfig } from './types'

type Vars = {
  taskList: string  // pre-formatted "id: description" lines
  taskIds: string   // comma-separated list of valid IDs
  code: string
}

export const milestoneVerifyTasks = {
  name: 'milestone-verify-tasks',
  version: '1.0.0',
  description: 'Fallback AI task verification when browser-based test expressions are unavailable (legacy milestones)',
  template: ({ taskList, taskIds, code }: Vars) => `Check which coding tasks the learner has completed in their code.

Tasks (id: description):
${taskList}

Learner's code:
\`\`\`html
${code}
\`\`\`

Return only the IDs of tasks that are clearly addressed in the code.
Be fairly liberal — if they've made a genuine attempt at the task, count it complete.
Only return IDs from this list: [${taskIds}]`,
  variables: ['taskList', 'taskIds', 'code'],
  model: 'gemini-2.5-flash',
  changelog: [
    { version: '1.0.0', date: '2026-03-25', change: 'Initial extraction from inline prompt in /api/milestone/verify-tasks/route.ts' },
  ],
} satisfies PromptConfig<Vars>

registerPrompt(milestoneVerifyTasks)
